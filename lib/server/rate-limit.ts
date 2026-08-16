import { NextResponse, type NextRequest } from 'next/server';
import { getTrialConfig } from './trial-config';
import { resolveTrialIdentity } from './trial-identity';
import { createUsageStore } from './usage-store';

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
}

async function consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitDecision> {
  const config = getTrialConfig();
  const store = createUsageStore(config);
  const count = await store.increment(key, windowSeconds);
  return {
    allowed: count <= limit,
    limit,
    remaining: Math.max(0, limit - count),
    retryAfter: windowSeconds,
  };
}

export async function checkIpRateLimit(
  req: NextRequest,
  scope: string,
  limit = 30,
  windowSeconds = 600,
): Promise<RateLimitDecision | null> {
  try {
    const config = getTrialConfig();
    if (!config.signingSecret || config.mode === 'disabled') return null;
    const identity = resolveTrialIdentity(req, config.signingSecret);
    return await consume(`rate:v1:${scope}:ip:${identity.ipHash}`, limit, windowSeconds);
  } catch (error) {
    console.warn('IP rate limit unavailable:', error);
    return null;
  }
}

export function rateLimitResponse(decision: RateLimitDecision): NextResponse {
  return NextResponse.json({
    error: 'Terlalu banyak permintaan dalam waktu singkat. Tunggu sebentar lalu coba lagi.',
    code: 'RATE_LIMITED',
    isQuota: true,
  }, {
    status: 429,
    headers: {
      'Retry-After': String(decision.retryAfter),
      'RateLimit-Limit': String(decision.limit),
      'RateLimit-Remaining': String(decision.remaining),
    },
  });
}
