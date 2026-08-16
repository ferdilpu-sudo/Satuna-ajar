export type TrialProtectionMode = 'disabled' | 'monitor' | 'enforce';
export type TrialStoreKind = 'memory' | 'redis';

const DEFAULT_FREE_GENERATIONS = 3;

function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export interface TrialConfig {
  mode: TrialProtectionMode;
  freeGenerations: number;
  storeKind: TrialStoreKind;
  redisUrl?: string;
  redisToken?: string;
  signingSecret: string;
}

export function getTrialConfig(): TrialConfig {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  const hasRedis = Boolean(redisUrl && redisToken);
  const requested = (process.env.TRIAL_PROTECTION_MODE || 'auto').toLowerCase();
  const signingSecret = process.env.TRIAL_SIGNING_SECRET?.trim()
    || (process.env.NODE_ENV === 'development' ? 'satuna-local-development-only' : '');

  let mode: TrialProtectionMode;
  if (requested === 'disabled' || requested === 'monitor' || requested === 'enforce') {
    mode = requested;
  } else if (hasRedis) {
    mode = 'enforce';
  } else if (process.env.NODE_ENV === 'development') {
    mode = 'enforce';
  } else {
    mode = 'monitor';
  }

  if (mode === 'enforce' && !signingSecret) {
    throw new Error('TRIAL_SIGNING_SECRET wajib diisi saat proteksi trial diaktifkan.');
  }
  if (mode === 'enforce' && process.env.NODE_ENV === 'production' && !hasRedis) {
    throw new Error('UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN wajib diisi untuk proteksi trial production.');
  }

  return {
    mode,
    freeGenerations: positiveInt(process.env.TRIAL_FREE_GENERATIONS, DEFAULT_FREE_GENERATIONS),
    storeKind: hasRedis ? 'redis' : 'memory',
    redisUrl,
    redisToken,
    signingSecret,
  };
}
