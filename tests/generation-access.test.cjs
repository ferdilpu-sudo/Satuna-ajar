const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }

test('generation route uses unified access reservation and finalization', () => {
  const route = read('app/api/gemini/generate-rpp/route.ts');
  assert.match(route, /reserveGenerationAccess\(req\)/);
  assert.match(route, /generationAccessDeniedResponse/);
  assert.match(route, /generationReservation\.complete/);
  assert.match(route, /generationReservation\.release/);
  assert.match(route, /generationAccess: \{ source: generationReservation\.source \}/);
});

test('paid generation reservation prefers one-time balance before subscription quota', () => {
  const migration = read('supabase/migrations/20260817113700_generation_access_rpc.sql');
  const oneTimePosition = migration.indexOf("source = 'one_time'");
  const subscriptionPosition = migration.indexOf("s.status = 'active'");
  assert.ok(oneTimePosition >= 0, 'one-time entitlement query must exist');
  assert.ok(subscriptionPosition > oneTimePosition, 'subscription fallback must run after one-time balance');
  assert.match(migration, /coalesce\(p\.generation_quota, 0\) > 0/);
});

test('failed paid generation restores one-time balance and frees subscription quota', () => {
  const migration = read('supabase/migrations/20260817113700_generation_access_rpc.sql');
  assert.match(migration, /v_usage\.source = 'one_time'/);
  assert.match(migration, /greatest\(used_uses - 1, 0\)/);
  assert.match(migration, /set status = 'failed'/);
  assert.match(migration, /status in \('started', 'completed'\)/);
});

test('exhausted paid access directs the user to pricing instead of retrying AI', () => {
  const guard = read('lib/server/generation-access.ts');
  const modal = read('components/GenerationProgressModal.tsx');
  assert.match(guard, /GENERATION_BALANCE_EXHAUSTED/);
  assert.match(guard, /status: 402/);
  assert.match(modal, /Saldo Generate Habis/);
  assert.match(modal, /href="\/pricing"/);
  assert.match(modal, /!isAccessExhausted/);
});
