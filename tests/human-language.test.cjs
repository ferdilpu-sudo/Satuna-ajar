const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const { normalizeGeneratedText } = require('../.tmp-tests/app/api/gemini/generate-rpp/text-quality.js');
const { assessmentExecutionSummary } = require('../.tmp-tests/lib/assessment-execution-display.js');

test('human language normalizer replaces avoidable academic and English jargon', () => {
  assert.equal(
    normalizeGeneratedText('Trophic cascade mengganggu homeostasis ekosistem dan membutuhkan solusi kontekstual yang saintifik.'),
    'dampak berantai dalam rantai makanan mengganggu keseimbangan ekosistem dan membutuhkan solusi yang sesuai dengan kondisi setempat yang ilmiah.',
  );
  assert.equal(
    normalizeGeneratedText('Peserta didik menginvestigasi dampak microplastic secara komprehensif.'),
    'Peserta didik menyelidiki dampak mikroplastik secara menyeluruh.',
  );
});

test('assessment execution summary reads like teacher guidance, not system output', () => {
  const text = assessmentExecutionSummary({
    availableMinutes: 10,
    reservedClosingMinutes: 3,
    questionBudgetMinutes: 7,
    estimatedQuestionMinutes: 6,
    selectedQuestionIds: ['PG-1', 'PG-2', 'PG-3'],
    fullQuestionBankIds: ['PG-1', 'PG-2', 'PG-3', 'PG-4', 'PG-5', 'UR-1', 'UR-2', 'UR-3'],
    feasible: true,
  });
  assert.match(text, /Pada pertemuan ini, gunakan PG-1, PG-2, dan PG-3/);
  assert.match(text, /latihan atau pertemuan berikutnya/);
  assert.doesNotMatch(text, /bank instrumen/i);
});

test('generated document labels avoid scaffolding and syntax jargon', () => {
  const docxTables = fs.readFileSync('lib/export/docx-tables.ts', 'utf8');
  const activities = fs.readFileSync('components/rpp-detail/LearningActivitiesSection.tsx', 'utf8');
  const languageRules = fs.readFileSync('app/api/gemini/generate-rpp/human-language.ts', 'utf8');
  assert.match(docxTables, /Dukungan Guru/);
  assert.match(docxTables, /Cara Dikembangkan/);
  assert.match(activities, /Tahap Model \/ Prinsip/);
  assert.doesNotMatch(activities, /Scaffolding:/);
  assert.match(languageRules, /GAYA BAHASA UNTUK DOKUMEN GURU/);
});

