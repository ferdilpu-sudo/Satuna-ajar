const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) { return fs.readFileSync(path, 'utf8'); }

test('binary material files are not serialized as base64 in the browser request', () => {
  const wizard = read('components/WizardForm.tsx');
  assert.match(wizard, /uploadMaterialBinary\(file\.file\)/);
  assert.match(wizard, /storagePath: stored\.storagePath/);
  assert.match(wizard, /removeStoredMaterial/);
  assert.doesNotMatch(wizard, /readAsDataURL/);
  assert.doesNotMatch(wizard, /readFileAsBase64/);
});

test('material analysis route resolves stored attachments server-side', () => {
  const route = read('app/api/gemini/analyze-material/route.ts');
  const resolver = read('lib/material-files/server.ts');
  assert.match(route, /resolveMaterialFileParts\(fileData\)/);
  assert.match(resolver, /storage\.from\(MATERIAL_UPLOAD_BUCKET\)\.download/);
  assert.match(resolver, /startsWith\(`\$\{userId\}\/`\)/);
  assert.match(resolver, /Buffer\.from\(await blob\.arrayBuffer\(\)\)\.toString\('base64'\)/);
});

test('temporary material storage is private, user-scoped, and limited to 15 MB', () => {
  const migration = read('supabase/migrations/20260818101500_material_analysis_storage.sql');
  assert.match(migration, /'material-analysis'/);
  assert.match(migration, /false,\s*15728640/s);
  assert.match(migration, /storage\.foldername\(name\)/);
  assert.match(migration, /auth\.jwt\(\)->>'sub'/);
  assert.match(migration, /owner_id = \(select auth\.uid\(\)::text\)/);
});

test('client rejects oversized material files before upload', () => {
  const browser = read('lib/material-files/browser.ts');
  const config = read('lib/material-files/config.ts');
  assert.match(config, /15 \* 1024 \* 1024/);
  assert.match(browser, /file\.size > MAX_MATERIAL_FILE_BYTES/);
  assert.match(browser, /melebihi batas/);
});
