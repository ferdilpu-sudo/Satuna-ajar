const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const read = (path) => fs.readFileSync(path, 'utf8');

test('generation flow no longer contains a separate Quality Check stage or panel', () => {
  const postProcess = read('app/api/gemini/generate-rpp/post-process.ts');
  const progress = read('components/GenerationProgressModal.tsx');
  const detail = read('components/RPPDetailView.tsx');
  const dashboard = read('components/DashboardView.tsx');

  assert.doesNotMatch(postProcess, /evaluateQualityCheck/);
  assert.doesNotMatch(progress, /Melakukan quality check/i);
  assert.doesNotMatch(detail, /QualityCheckPanel/);
  assert.doesNotMatch(dashboard, /Quality Check|Perlu Ditinjau/);
  assert.equal(fs.existsSync('components/rpp-detail/QualityCheckPanel.tsx'), false);
  assert.equal(fs.existsSync('lib/validation/quality.ts'), false);
});

test('DOCX exporter uses Word-specific fixed layouts instead of wide preview-style tables', () => {
  const theme = read('lib/export/docx-theme.ts');
  const tables = read('lib/export/docx-tables.ts');
  const exporter = read('lib/export/docx-export.ts');

  assert.match(theme, /TableLayoutType\.FIXED/);
  assert.match(theme, /WidthType\.DXA/);
  assert.match(theme, /cantSplit: true/);
  assert.match(tables, /const widths = \[2600, 7400\]/); // activity table: 2 columns
  assert.match(tables, /const widths = \[2300, 7700\]/); // rubric: vertical score layout
  assert.doesNotMatch(tables, /Skor 1['"],\s*['"]Skor 2['"],\s*['"]Skor 3['"],\s*['"]Skor 4/);
  assert.match(exporter, /size: \{ width: 11906, height: 16838 \}/);
});

test('natural Sumber Belajar Lainnya wording remains unchanged', () => {
  assert.match(read('lib/export/source-docx.ts'), /Sumber Belajar Lainnya/);
});
