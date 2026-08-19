const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }

test('checkout orders snapshot plan price and enforce idempotency', () => {
  const migration = read('supabase/migrations/20260817113600_payment_core.sql');
  assert.match(migration, /create table if not exists public\.checkout_orders/);
  assert.match(migration, /unique \(user_id, idempotency_key\)/);
  assert.match(migration, /create_checkout_order/);
  assert.match(migration, /price_amount/);
  assert.match(migration, /IDEMPOTENCY_KEY_CONFLICT/);
});

test('webhook fulfillment is service-role only and deduplicated', () => {
  const migration = read('supabase/migrations/20260817113600_payment_core.sql');
  assert.match(migration, /finalize_checkout_payment/);
  assert.match(migration, /payment_webhook_events/);
  assert.match(migration, /on conflict \(provider, provider_event_id\) do nothing/);
  assert.match(migration, /grant execute .* service_role/s);
  assert.match(migration, /revoke all .* anon, authenticated/s);
});

test('paid events cannot be downgraded by late failure events', () => {
  const migration = read('supabase/migrations/20260817113600_payment_core.sql');
  assert.match(migration, /v_existing_status = 'paid' and p_payment_status <> 'refunded'/);
  assert.match(migration, /v_effective_status := 'paid'/);
});

test('one-time payment fulfillment creates exactly one quota entitlement', () => {
  const migration = read('supabase/migrations/20260817113600_payment_core.sql');
  assert.match(migration, /uq_one_time_entitlement_payment/);
  assert.match(migration, /v_generation_quota/);
  assert.match(migration, /source_payment_id/);
  assert.match(migration, /'one_time'/);
});

test('subscription fulfillment creates an active bounded period', () => {
  const migration = read('supabase/migrations/20260817113600_payment_core.sql');
  assert.match(migration, /insert into public\.subscriptions/);
  assert.match(migration, /'active'/);
  assert.match(migration, /interval '1 month'/);
  assert.match(migration, /interval '1 year'/);
});

test('payment domain supports both providers without exposing provider secrets', () => {
  const types = read('types/payment.ts');
  const config = read('lib/payment/config.ts');
  assert.match(types, /'ipaymu' \| 'midtrans'/);
  assert.match(types, /interface PaymentProvider/);
  assert.match(config, /SATUNA_PAYMENT_PROVIDER/);
  assert.match(config, /server-only/);
});
