const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }

test('checkout endpoint authenticates before creating an order', () => {
  const route = read('app/api/billing/checkout/route.ts');
  const authPosition = route.indexOf('supabase.auth.getUser()');
  const preparePosition = route.indexOf('prepareCheckout(body.planCode, body.idempotencyKey)');
  assert.ok(authPosition >= 0, 'checkout must verify the authenticated user');
  assert.ok(preparePosition > authPosition, 'order creation must happen after auth');
  assert.match(route, /code: 'AUTH_REQUIRED'/);
});

test('checkout trusts plan code but never a client supplied price', () => {
  const route = read('app/api/billing/checkout/route.ts');
  assert.match(route, /planCode/);
  assert.match(route, /idempotencyKey/);
  assert.doesNotMatch(route, /body\.price/);
  assert.doesNotMatch(route, /body\.amount/);
  assert.match(route, /prepareCheckout\(body\.planCode, body\.idempotencyKey\)/);
});

test('checkout is provider agnostic and unavailable until an adapter is registered', () => {
  const route = read('app/api/billing/checkout/route.ts');
  const registry = read('lib/payment/provider-registry.ts');
  assert.match(route, /getActivePaymentProvider/);
  assert.match(route, /provider\.createCheckout/);
  assert.match(route, /attachProviderCheckout/);
  assert.match(route, /PAYMENT_GATEWAY_REVIEW_PENDING/);
  assert.match(route, /PAYMENT_PROVIDER_ADAPTER_UNAVAILABLE/);
  assert.match(registry, /Partial<Record<PaymentProviderName, ProviderFactory>>/);
});

test('purchase UI reuses an idempotency key until checkout redirects successfully', () => {
  const button = read('components/public/PurchaseButton.tsx');
  assert.match(button, /sessionStorage\.getItem/);
  assert.match(button, /sessionStorage\.setItem/);
  assert.match(button, /crypto\.randomUUID/);
  assert.match(button, /sessionStorage\.removeItem/);
  assert.match(button, /\/api\/billing\/checkout/);
});

test('purchase UI redirects unauthenticated buyers to login and disables payment during review', () => {
  const button = read('components/public/PurchaseButton.tsx');
  const pricing = read('app/pricing/page.tsx');
  assert.match(button, /response\.status === 401/);
  assert.match(button, /\/login\?next=/);
  assert.match(button, /disabled=!checkoutEnabled \|\| loading/);
  assert.match(button, /Menunggu payment gateway/);
  assert.match(pricing, /getPaymentRuntimeStatus/);
  assert.match(pricing, /PurchaseButton/);
});
