import type { TrialConfig } from './trial-config';

type RedisResult<T> = { result?: T; error?: string };
interface MemoryEntry { value: number; expiresAt?: number; }

const globalMemory = globalThis as typeof globalThis & {
  __satunaUsageMemory?: Map<string, MemoryEntry>;
};
const memory = globalMemory.__satunaUsageMemory ?? new Map<string, MemoryEntry>();
globalMemory.__satunaUsageMemory = memory;

function liveEntry(key: string): MemoryEntry | undefined {
  const entry = memory.get(key);
  if (entry?.expiresAt && entry.expiresAt <= Date.now()) {
    memory.delete(key);
    return undefined;
  }
  return entry;
}

export interface UsageStore {
  getNumber(key: string): Promise<number>;
  increment(key: string, ttlSeconds?: number): Promise<number>;
  decrement(key: string): Promise<number>;
}

class MemoryUsageStore implements UsageStore {
  async getNumber(key: string): Promise<number> {
    return liveEntry(key)?.value ?? 0;
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    const current = liveEntry(key)?.value ?? 0;
    const value = current + 1;
    memory.set(key, { value, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined });
    return value;
  }

  async decrement(key: string): Promise<number> {
    const current = liveEntry(key)?.value ?? 0;
    const value = Math.max(0, current - 1);
    memory.set(key, { value });
    return value;
  }
}

class RedisRestUsageStore implements UsageStore {
  constructor(private readonly url: string, private readonly token: string) {}

  private async command<T>(command: Array<string | number>): Promise<T> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      cache: 'no-store',
    });
    const payload = await response.json() as RedisResult<T>;
    if (!response.ok || payload.error) throw new Error(payload.error || `Usage store HTTP ${response.status}`);
    return payload.result as T;
  }

  private async transaction(commands: Array<Array<string | number>>): Promise<Array<RedisResult<number>>> {
    const response = await fetch(`${this.url.replace(/\/$/, '')}/multi-exec`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      cache: 'no-store',
    });
    const payload = await response.json() as Array<RedisResult<number>> | RedisResult<never>;
    if (!response.ok || !Array.isArray(payload)) {
      throw new Error(!Array.isArray(payload) && payload.error ? payload.error : `Usage store HTTP ${response.status}`);
    }
    const failed = payload.find((item) => item.error);
    if (failed?.error) throw new Error(failed.error);
    return payload;
  }

  async getNumber(key: string): Promise<number> {
    const result = await this.command<string | number | null>(['GET', key]);
    return result === null ? 0 : Number(result) || 0;
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    if (!ttlSeconds) return Number(await this.command<number>(['INCR', key]));
    const result = await this.transaction([['INCR', key], ['EXPIRE', key, ttlSeconds]]);
    return Number(result[0]?.result) || 0;
  }

  async decrement(key: string): Promise<number> {
    const current = await this.getNumber(key);
    if (current <= 0) return 0;
    return Number(await this.command<number>(['DECR', key]));
  }
}

export function createUsageStore(config: TrialConfig): UsageStore {
  if (config.storeKind === 'redis' && config.redisUrl && config.redisToken) {
    return new RedisRestUsageStore(config.redisUrl, config.redisToken);
  }
  return new MemoryUsageStore();
}
