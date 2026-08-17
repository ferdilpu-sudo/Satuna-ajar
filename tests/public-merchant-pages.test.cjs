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

test('pricing page never invents a price when env is unset', () => {
  const pricing = read('app/pricing/page.tsx');
  assert.match(pricing, /NEXT_PUBLIC_PRICE_ONE_TIME/);
  assert.match(pricing, /NEXT_PUBLIC_PRICE_PRO_MONTHLY/);
  assert.match(pricing, /Harga belum ditetapkan/);
});
