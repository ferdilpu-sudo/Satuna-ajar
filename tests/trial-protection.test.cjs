const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const policy = require('../.tmp-tests/lib/server/trial-policy.js');
const accountPolicy = require('../.tmp-tests/lib/server/trial-account-policy.js');

test('trial snapshot clamps remaining and marks exhausted', () => {
  assert.deepEqual(policy.buildTrialUsageSnapshot(2, 3), {
    limit: 3, used: 2, remaining: 1, exhausted: false,
  });
  assert.deepEqual(policy.buildTrialUsageSnapshot(4, 3), {
    limit: 3, used: 4, remaining: 0, exhausted: true,
  });
});

test('reservation policy allows only usage inside free limit', () => {
  assert.equal(policy.canReserveTrialGeneration(1, 3), true);
  assert.equal(policy.canReserveTrialGeneration(3, 3), true);
  assert.equal(policy.canReserveTrialGeneration(4, 3), false);
});

test('authenticated trial uses stricter remaining between account and browser ceiling', () => {
  assert.deepEqual(accountPolicy.effectiveTrialUsage(0, 0, 3), {
    limit: 3, used: 0, remaining: 3, exhausted: false,
  });
  assert.equal(accountPolicy.effectiveTrialUsage(3, 0, 3).remaining, 0);
  assert.equal(accountPolicy.effectiveTrialUsage(0, 3, 3).remaining, 3);
  assert.equal(accountPolicy.effectiveTrialUsage(0, 6, 3).remaining, 0);
});

test('authenticated reservation caps both account and aggregate browser usage', () => {
  assert.equal(accountPolicy.canReserveAuthenticatedTrial(3, 6, 3), true);
  assert.equal(accountPolicy.canReserveAuthenticatedTrial(4, 6, 3), false);
  assert.equal(accountPolicy.canReserveAuthenticatedTrial(3, 7, 3), false);
});

test('generate route reserves quota before first AI planner call', () => {
  const source = read('app/api/gemini/generate-rpp/route.ts');
  const reserveIndex = source.indexOf('reserveTrialGeneration(req)');
  const plannerIndex = source.indexOf('const pedagogicalPlan = await generatePedagogicalPlan');
  assert.ok(reserveIndex > 0);
  assert.ok(plannerIndex > reserveIndex);
  assert.match(source, /trialDeniedResponse\(trialReservation\)/);
  assert.match(source, /trialReservation\.release\(\)/);
});

test('trial is stored server-side and keeps existing install key', () => {
  const guard = read('lib/server/trial-guard.ts');
  const store = read('lib/server/usage-store.ts');
  assert.doesNotMatch(guard + store, /localStorage|sessionStorage/);
  assert.match(store, /UPSTASH_REDIS_REST_URL|redisUrl/);
  assert.match(guard, /trial:v1:used:/);
});

test('authenticated trial adds hashed account usage key', () => {
  const guard = read('lib/server/trial-guard.ts');
  const authUser = read('lib/server/auth-user.ts');
  const subject = read('lib/server/trial-subject.ts');
  assert.match(guard, /trial:v2:account:/);
  assert.match(guard, /getAuthenticatedUserId/);
  assert.match(authUser, /auth\.getClaims\(\)/);
  assert.match(subject, /createHmac/);
});

test('trial UI disables generation when quota is exhausted', () => {
  const output = read('components/wizard/OutputStep.tsx');
  const card = read('components/wizard/TrialUsageCard.tsx');
  assert.match(output, /disabled=\{errors\.length > 0 \|\| trialExhausted\}/);
  assert.match(output, /Trial Selesai/);
  assert.match(card, /Sisa \$\{trial\.remaining\}/);
});

test('production env documents auth and persistent trial requirements', () => {
  const env = read('.env.example');
  assert.match(env, /SATUNA_AUTH_MODE="optional"/);
  assert.match(env, /NEXT_PUBLIC_SUPABASE_URL=/);
  assert.match(env, /NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=/);
  assert.match(env, /TRIAL_PROTECTION_MODE="enforce"/);
  assert.match(env, /TRIAL_SIGNING_SECRET=/);
  assert.match(env, /UPSTASH_REDIS_REST_URL=/);
  assert.match(env, /UPSTASH_REDIS_REST_TOKEN=/);
});
