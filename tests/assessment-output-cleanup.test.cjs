const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const read = (file) => fs.readFileSync(file, 'utf8');

test('DOCX question headings hide internal assessment IDs and evidence roles', () => {
  const source = read('lib/export/question-docx.ts');
  assert.match(source, /text: `Soal \${index \+ 1}`/);
  assert.doesNotMatch(source, /Soal \${index \+ 1} \[\${question\.id/);
  assert.doesNotMatch(source, /Bukti utama \${question\.objectiveMeasured}/);
  assert.doesNotMatch(source, /Pendukung \${question\.objectiveMeasured}/);
});

test('HTML export presents question text without bracketed evidence metadata', () => {
  const source = read('lib/export/assessment-sections.ts');
  assert.match(source, /<li>\${safe\(question\.question\)}/);
  assert.doesNotMatch(source, /roleLabel/);
  assert.doesNotMatch(source, /\[\${safe\(question\.type\)}/);
});

test('RPP and Modul preview hide internal question IDs and evidence roles', () => {
  const compact = read('components/rpp-detail/CompactAssessmentSection.tsx');
  const module = read('components/rpp-detail/AssessmentRubricsSection.tsx');
  for (const source of [compact, module]) {
    assert.doesNotMatch(source, /SOAL-\${index \+ 1}/);
    assert.doesNotMatch(source, /Bukti utama \${/);
    assert.doesNotMatch(source, /Pendukung \${/);
  }
  assert.match(compact, /\{index \+ 1\}\. \{question\.question\}/);
  assert.match(module, /\{index \+ 1\}\. \{q\.question\}/);
});

test('internal evidence metadata remains available for mapping and validation', () => {
  const mapping = read('lib/export/docx-tables.ts');
  const editor = read('components/rpp-editor/AssessmentEditor.tsx');
  assert.match(mapping, /getObjectiveEvidenceGroups/);
  assert.match(mapping, /Bukti Utama/);
  assert.match(editor, /evidenceRole/);
});
