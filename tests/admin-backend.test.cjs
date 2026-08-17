const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('admin route is protected by a server layout', () => {
  const layout = read('app/admin/layout.tsx');
  assert.match(layout, /requireAdmin\(\)/);
  assert.match(layout, /async function AdminLayout/);
});

test('admin API returns explicit auth and authorization failures', () => {
  const route = read('app/api/admin/overview/route.ts');
  assert.match(route, /AUTH_REQUIRED/);
  assert.match(route, /ADMIN_REQUIRED/);
  assert.match(route, /getAdminOverviewMetrics/);
});

test('admin overview frontend loads protected live metrics', () => {
  const view = read('components/admin/views/OverviewView.tsx');
  assert.match(view, /fetch\('\/api\/admin\/overview'/);
  assert.match(view, /cache: 'no-store'/);
  assert.match(view, /metrics\.monthRevenue/);
  assert.match(view, /metrics\.monthOneTimeRevenue/);
  assert.match(view, /metrics\.aiCost30d/);
});

test('monetization schema includes subscription and one-time ownership', () => {
  const migration = read('supabase/migrations/20260817113000_admin_monetization_foundation.sql');
  assert.match(migration, /create table if not exists public\.subscriptions/);
  assert.match(migration, /create table if not exists public\.payments/);
  assert.match(migration, /create table if not exists public\.generation_entitlements/);
  assert.match(migration, /kind in \('subscription', 'one_time'\)/);
});

test('failed one-time generation restores reserved entitlement', () => {
  const migration = read('supabase/migrations/20260817113200_generation_finalize_rpc.sql');
  assert.match(migration, /greatest\(used_uses - 1, 0\)/);
  assert.match(migration, /status = 'failed'/);
  assert.match(migration, /p_success/);
});
