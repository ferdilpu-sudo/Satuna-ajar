const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }

test('merchant verification pages and billing catalog are public', () => {
  const middleware = read('lib/supabase/middleware.ts');
  for (const path of ['/pricing', '/syarat-ketentuan', '/kebijakan-refund', '/kebijakan-privasi', '/faq', '/kontak', '/api/billing/plans']) {
    assert.match(middleware, new RegExp(path.replace('/', '\\/')));
  }
});

test('required merchant policy pages exist with business-specific content', () => {
  assert.match(read('app/syarat-ketentuan/page.tsx'), /Harga dan pembayaran/);
  assert.match(read('app/kebijakan-refund/page.tsx'), /Refund dapat diajukan/);
  assert.match(read('app/faq/page.tsx'), /Apa itu Satuna Ajar/);
  assert.match(read('app/kebijakan-privasi/page.tsx'), /Data yang diproses/);
  assert.match(read('app/kontak/page.tsx'), /Kontak resmi/);
});

test('pricing reads its products and prices from the billing catalog', () => {
  const pricing = read('app/pricing/page.tsx');
  assert.match(pricing, /listPublicPlans/);
  assert.match(pricing, /offer\.priceAmount/);
  assert.doesNotMatch(pricing, /price:\s*7_000/);
  assert.doesNotMatch(pricing, /price:\s*59_000/);
});

test('bulk generation plans are seeded with matching quotas and prices', () => {
  const migration = read('supabase/migrations/20260817113400_seed_bulk_generation_plans.sql');
  assert.match(migration, /'generate-1'.*7000.*1/s);
  assert.match(migration, /'generate-3'.*15000.*3/s);
  assert.match(migration, /'generate-5'.*25000.*5/s);
  assert.match(migration, /'generate-10'.*35000.*10/s);
});

test('Satuna Pro monthly plan is seeded at Rp59.000', () => {
  const migration = read('supabase/migrations/20260817113500_seed_satuna_pro_monthly.sql');
  assert.match(migration, /'pro-monthly'/);
  assert.match(migration, /'Satuna Pro Bulanan'/);
  assert.match(migration, /59000/);
  assert.match(migration, /'month'/);
});
