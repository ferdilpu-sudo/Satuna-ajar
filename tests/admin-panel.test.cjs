const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('admin route renders the isolated admin panel', () => {
  const page = read('app/admin/page.tsx');
  assert.match(page, /AdminPanel/);
  assert.match(page, /index: false/);
});

test('admin panel exposes business monitoring sections', () => {
  const sidebar = read('components/admin/AdminSidebar.tsx');
  for (const label of ['Ringkasan', 'Pengguna', 'Monetisasi', 'Pendapatan', 'Penggunaan AI', 'Sistem']) {
    assert.match(sidebar, new RegExp(label));
  }
});

test('admin frontend clearly labels mock data and does not pretend backend is connected', () => {
  const panel = read('components/admin/AdminPanel.tsx');
  assert.match(panel, /Frontend preview/);
  assert.match(panel, /masih mock/);
});

test('admin monetization UI tracks one-time generation purchases separately', () => {
  const monetization = read('components/admin/views/SubscriptionsView.tsx');
  const purchaseTable = read('components/admin/OneTimePurchaseTable.tsx');
  const revenue = read('components/admin/views/RevenueView.tsx');
  assert.match(monetization, /Beli sekali/);
  assert.match(monetization, /1x Generasi AI/);
  assert.match(purchaseTable, /Hak generate/);
  assert.match(revenue, /Dari beli sekali/);
});
