const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('uses Satuna Ajar as the visible product brand', () => {
  const sidebar = read('components/Sidebar.tsx');
  const header = read('components/Header.tsx');
  const layout = read('app/layout.tsx');
  const metadata = read('metadata.json');

  assert.match(sidebar, /BRAND\.name/);
  assert.match(sidebar, /BRAND\.tagline/);
  assert.match(header, /BRAND\.name/);
  assert.match(layout, /BRAND\.name/);
  assert.match(metadata, /Satuna Ajar/);
});

test('removes legacy RPP Generator branding from visible shell', () => {
  const files = [
    'components/Sidebar.tsx',
    'components/Header.tsx',
    'components/wizard/DocumentTypeStep.tsx',
    'metadata.json',
    'app/layout.tsx',
  ];
  const source = files.map(read).join('\n');

  assert.equal(source.includes('RPP Generator'), false);
  assert.equal(source.includes('RPP Deep Learning Generator'), false);
  assert.equal(source.includes('AI RPP & Modul Ajar Generator'), false);
});

test('keeps Satuna master brand data centralized', () => {
  const brand = read('lib/brand.ts');
  assert.match(brand, /name: 'Satuna Ajar'/);
  assert.match(brand, /shortName: 'Satuna'/);
  assert.match(brand, /tagline: 'Ruang kerja untuk guru'/);
  assert.match(brand, /domain: 'satuna\.my\.id'/);
});
