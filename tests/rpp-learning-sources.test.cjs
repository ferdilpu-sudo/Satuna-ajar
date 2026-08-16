const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

function read(path) { return fs.readFileSync(path, 'utf8'); }

test('RPP response schema explicitly requests learning sources', () => {
  const schema = read('app/api/gemini/generate-rpp/schema-rpp.ts');
  assert.match(schema, /facilities:\s*object\(/);
  assert.match(schema, /learningSources:/);
  assert.match(schema, /'facilities'/);
});

test('RPP prompt requires non-URL learning-source suggestions', () => {
  const prompt = read('app/api/gemini/generate-rpp/prompt.ts');
  assert.match(prompt, /Isi facilities\.learningSources dengan 2-4 SARAN SUMBER BELAJAR non-URL/);
  assert.match(prompt, /Jangan mengarang judul buku, penerbit, penulis, atau URL spesifik/);
});

test('DOCX still renders the natural learning-source heading', () => {
  const source = read('lib/export/source-docx.ts');
  assert.match(source, /Sumber Belajar Lainnya:/);
});
