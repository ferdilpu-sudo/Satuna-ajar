import { NextResponse, type NextRequest } from 'next/server';
import { getTrialConfig } from './trial-config';
import { attachTrialCookie, resolveTrialIdentity, type TrialIdentity } from './trial-identity';
import { buildTrialUsageSnapshot, canReserveTrialGeneration, type TrialUsageSnapshot } from './trial-policy';
import { canReserveAuthenticatedTrial, effectiveTrialUsage } from './trial-account-policy';
import { createUsageStore, type UsageStore } from './usage-store';
import { getAuthenticatedUserId } from './auth-user';
import { hashAccountSubject } from './trial-subject';

const GENERATE_WINDOW_SECONDS = 600;
const INSTALL_GENERATE_LIMIT = 8;
const IP_GENERATE_LIMIT = 80;

export interface TrialReservation {
  allowed: boolean;
  code?: 'TRIAL_EXHAUSTED' | 'RATE_LIMITED';
  identity: TrialIdentity;
  usage: TrialUsageSnapshot;
  enforced: boolean;
  retryAfter?: number;
  release: () => Promise<void>;
  attach: (response: NextResponse) => NextResponse;
}

function attachUsageHeaders(response: NextResponse, usage: TrialUsageSnapshot, enforced: boolean): NextResponse {
  response.headers.set('X-Satuna-Trial-Limit', String(usage.limit));
  response.headers.set('X-Satuna-Trial-Remaining', String(usage.remaining));
  response.headers.set('X-Satuna-Trial-Enforced', enforced ? '1' : '0');
  return response;
}

function reservationBase(identity: TrialIdentity, usage: TrialUsageSnapshot, enforced: boolean) {
  return {
    identity,
    usage,
    enforced,
    attach: (response: NextResponse) => attachUsageHeaders(attachTrialCookie(response, identity), usage, enforced),
  };
}

async function hitRateLimits(store: UsageStore, identity: TrialIdentity): Promise<{ blocked: boolean; retryAfter: number }> {
  const [installCount, ipCount] = await Promise.all([
    store.increment(`rate:v1:generate:install:${identity.installHash}`, GENERATE_WINDOW_SECONDS),
    store.increment(`rate:v1:generate:ip:${identity.ipHash}`, GENERATE_WINDOW_SECONDS),
  ]);
  return { blocked: installCount > INSTALL_GENERATE_LIMIT || ipCount > IP_GENERATE_LIMIT, retryAfter: GENERATE_WINDOW_SECONDS };
}

function installUsageKey(identity: TrialIdentity): string {
  return `trial:v1:used:${identity.installHash}`;
}

function accountUsageKey(userId: string, secret: string): string {
  return `trial:v2:account:${hashAccountSubject(userId, secret)}`;
}

async function currentUsage(store: UsageStore, identity: TrialIdentity, userId: string | null, secret: string, limit: number) {
  const installUsed = await store.getNumber(installUsageKey(identity));
  if (!userId) return { installUsed, accountUsed: null, usage: buildTrialUsageSnapshot(installUsed, limit) };
  const accountUsed = await store.getNumber(accountUsageKey(userId, secret));
  return { installUsed, accountUsed, usage: effectiveTrialUsage(accountUsed, installUsed, limit) };
}

export async function getTrialStatus(req: NextRequest): Promise<TrialReservation> {
  const config = getTrialConfig();
  const identity = resolveTrialIdentity(req, config.signingSecret);
  const store = createUsageStore(config);
  const userId = await getAuthenticatedUserId();
  const state = config.mode === 'disabled'
    ? { usage: buildTrialUsageSnapshot(0, config.freeGenerations) }
    : await currentUsage(store, identity, userId, config.signingSecret, config.freeGenerations);
  return {
    ...reservationBase(identity, state.usage, config.mode === 'enforce'),
    allowed: !state.usage.exhausted || config.mode !== 'enforce',
    release: async () => undefined,
  };
}

export async function reserveTrialGeneration(req: NextRequest): Promise<TrialReservation> {
  const config = getTrialConfig();
  const identity = resolveTrialIdentity(req, config.signingSecret);
  const store = createUsageStore(config);
  const enforced = config.mode === 'enforce';
  const userId = await getAuthenticatedUserId();
  const previous = await currentUsage(store, identity, userId, config.signingSecret, config.freeGenerations);

  if (config.mode !== 'disabled') {
    const rate = await hitRateLimits(store, identity);
    if (rate.blocked) return {
      ...reservationBase(identity, previous.usage, enforced), allowed: false, code: 'RATE_LIMITED',
      retryAfter: rate.retryAfter, release: async () => undefined,
    };
  }

  if (!enforced) return { ...reservationBase(identity, previous.usage, false), allowed: true, release: async () => undefined };

  const installKey = installUsageKey(identity);
  const accountKey = userId ? accountUsageKey(userId, config.signingSecret) : null;
  const [installNext, accountNext] = await Promise.all([
    store.increment(installKey),
    accountKey ? store.increment(accountKey) : Promise.resolve(0),
  ]);
  const allowed = accountKey
    ? canReserveAuthenticatedTrial(accountNext, installNext, config.freeGenerations)
    : canReserveTrialGeneration(installNext, config.freeGenerations);

  if (!allowed) {
    await Promise.all([store.decrement(installKey), accountKey ? store.decrement(accountKey) : Promise.resolve(0)]);
    return {
      ...reservationBase(identity, previous.usage, true), allowed: false, code: 'TRIAL_EXHAUSTED',
      release: async () => undefined,
    };
  }

  let released = false;
  const usage = accountKey
    ? effectiveTrialUsage(accountNext, installNext, config.freeGenerations)
    : buildTrialUsageSnapshot(installNext, config.freeGenerations);
  return {
    ...reservationBase(identity, usage, true), allowed: true,
    release: async () => {
      if (released) return;
      released = true;
      await Promise.all([store.decrement(installKey), accountKey ? store.decrement(accountKey) : Promise.resolve(0)]);
    },
  };
}

export function trialDeniedResponse(reservation: TrialReservation): NextResponse {
  const isRate = reservation.code === 'RATE_LIMITED';
  const response = NextResponse.json({
    error: isRate
      ? 'Terlalu banyak percobaan pembuatan dokumen. Tunggu sebentar lalu coba lagi.'
      : `Trial Satuna Ajar sudah digunakan ${reservation.usage.limit} kali. Pembuatan AI baru tidak tersedia pada trial ini.`,
    code: reservation.code,
    isQuota: true,
    trial: reservation.usage,
  }, {
    status: 429,
    headers: isRate && reservation.retryAfter ? { 'Retry-After': String(reservation.retryAfter) } : undefined,
  });
  return reservation.attach(response);
}
