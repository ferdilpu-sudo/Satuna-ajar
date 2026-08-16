const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('dashboard uses neutral document creation wording for RPP and Modul Ajar', () => {
  const dashboard = read('components/DashboardView.tsx');
  const header = read('components/Header.tsx');
  const sidebar = read('components/Sidebar.tsx');
  const history = read('components/HistoryView.tsx');

  assert.match(dashboard, /Buat Dokumen/);
  assert.match(header, /Dokumen Baru/);
  assert.match(sidebar, /Buat Dokumen/);
  assert.match(history, /Dokumen Baru/);
  assert.doesNotMatch(header, /Buat RPP Baru/);
});

test('dashboard exposes document type and counts RPP and Modul Ajar separately', () => {
  const dashboard = read('components/DashboardView.tsx');
  assert.match(dashboard, /const rppCount =/);
  assert.match(dashboard, /const moduleCount =/);
  assert.match(dashboard, /label="RPP"/);
  assert.match(dashboard, /label="Modul Ajar"/);
  assert.match(dashboard, />Jenis</);
  assert.match(dashboard, /DocumentTypeBadge/);
});

test('profile summary is actionable and opens settings', () => {
  const header = read('components/Header.tsx');
  const page = read('app/page.tsx');
  assert.match(header, /Lengkapi Profil/);
  assert.match(header, /Nama & sekolah belum diatur/);
  assert.match(header, /onOpenSettings/);
  assert.match(page, /onOpenSettings=\{\(\) => setCurrentTab\('settings'\)\}/);
});

test('dashboard action buttons meet a larger click target and sidebar guide is collapsible', () => {
  const dashboard = read('components/DashboardView.tsx');
  const sidebar = read('components/Sidebar.tsx');
  assert.match(dashboard, /h-10 w-10/);
  assert.match(sidebar, /<details/);
  assert.match(sidebar, /Panduan Pembelajaran Mendalam/);
});
