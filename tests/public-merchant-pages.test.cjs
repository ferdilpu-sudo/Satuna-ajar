const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }

test('merchant verification pages are public in auth middleware', () => {
  const middleware = read('lib/supabase/middleware.ts');
  for (const path of ['/pricing', '/syarat-ketentuan', '/kebijakan-refund', '/kebijakan-privasi', '/faq', '/kontak']) {
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

test('pricing publishes the approved bulk generation packages', () => {
  const pricing = read('app/pricing/page.tsx');
  assert.match(pricing, /1x Generate AI/);
  assert.match(pricing, /price: 7_000/);
  assert.match(pricing, /price: 15_000/);
  assert.match(pricing, /price: 25_000/);
  assert.match(pricing, /price: 35_000/);
});

test('bulk generation plans are seeded with matching quotas and prices', () => {
  const migration = read('supabase/migrations/20260817113400_seed_bulk_generation_plans.sql');
  assert.match(migration, /'generate-1'.*7000.*1/s);
  assert.match(migration, /'generate-3'.*15000.*3/s);
  assert.match(migration, /'generate-5'.*25000.*5/s);
  assert.match(migration, /'generate-10'.*35000.*10/s);
});
