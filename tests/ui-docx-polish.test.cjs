const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { formatChoiceOptions, stripChoicePrefix } = require('../.tmp-tests/lib/assessment-display.js');

const read = (file) => fs.readFileSync(file, 'utf8');

test('multiple-choice options receive stable alphabetic labels without duplicate prefixes', () => {
  assert.deepEqual(formatChoiceOptions(['Fotosintesis', 'Respirasi', 'Dekomposisi']), [
    'A. Fotosintesis',
    'B. Respirasi',
    'C. Dekomposisi',
  ]);
  assert.deepEqual(formatChoiceOptions(['A. Lama', 'b) Baru', 'C: Ketiga']), [
    'A. Lama',
    'B. Baru',
    'C. Ketiga',
  ]);
  assert.equal(stripChoicePrefix('D - Pilihan'), 'Pilihan');
});

test('DOCX exporter uses a consistent 1.15 body rhythm and alphabetized choices', () => {
  const theme = read('lib/export/docx-theme.ts');
  const questions = read('lib/export/question-docx.ts');
  assert.match(theme, /body: \{ after: 120, line: 276 \}/);
  assert.match(theme, /list: \{ after: 60, line: 276 \}/);
  assert.match(theme, /option: \{ after: 35, line: 276 \}/);
  assert.match(questions, /formatChoiceOptions\(question\.options\)/);
  assert.match(questions, /spacing: DOCX_SPACING\.body/);
  assert.match(questions, /spacing: DOCX_SPACING\.option/);
});

test('document preview also presents answer choices vertically with alphabetic labels', () => {
  const compact = read('components/rpp-detail/CompactAssessmentSection.tsx');
  const module = read('components/rpp-detail/AssessmentRubricsSection.tsx');
  assert.match(compact, /formatChoiceOptions\(question\.options\)/);
  assert.match(module, /formatChoiceOptions\(q\.options\)/);
  assert.doesNotMatch(compact, /options\.join\('\s*\|\s*'\)/);
  assert.doesNotMatch(module, /options\.join\('\s*\|\s*'\)/);
});

test('DOCX presentation mirrors the polished preview with question and source cards', () => {
  const theme = read('lib/export/docx-theme.ts');
  const exporter = read('lib/export/docx-export.ts');
  const questions = read('lib/export/question-docx.ts');
  const compact = read('lib/export/compact-assessment-docx.ts');
  const sources = read('lib/export/source-docx.ts');

  assert.match(theme, /buildContentCard/);
  assert.match(theme, /titleDivider/);
  assert.match(exporter, /buildQuestionCard/);
  assert.match(exporter, /titleDivider\(\)/);
  assert.match(questions, /DOCX_COLORS\.softBlue/);
  assert.match(questions, /buildContentCard\(content, \{ fill: DOCX_COLORS\.soft, accent: true \}\)/);
  assert.match(compact, /buildContentCard\(content, \{ fill: DOCX_COLORS\.white \}\)/);
  assert.match(sources, /buildContentCard\(paragraphs, \{ fill: DOCX_COLORS\.soft \}\)/);
});
