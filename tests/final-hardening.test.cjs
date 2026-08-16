const assert = require('node:assert/strict');
const test = require('node:test');

const { validateQuestionAnswerConsistency } = require('../.tmp-tests/lib/validation/answer-consistency.js');
const { normalizeGeneratedText } = require('../.tmp-tests/app/api/gemini/generate-rpp/text-quality.js');
const { prepareFinalExportRPP } = require('../.tmp-tests/lib/export/finalize.js');

function baseRpp(cp) {
  return {
    id: 'x', createdAt: '', updatedAt: '', status: 'Selesai', documentFormat: 'Lengkap',
    identity: {
      teacherName: 'Guru', schoolName: 'Sekolah', academicYear: '2026/2027', educationLevel: 'SMA/MA', subject: 'IPA', grade: 'Kelas X', phase: 'E', semester: 'Ganjil',
      element: 'Pemahaman IPA', elementSource: 'ai_draft', topic: 'Ekosistem', subtopic: 'Interaksi', jpCount: 3, durationPerJP: 45, meetingCount: 1, totalMinutes: 135,
      learningOutcomes: cp, cpSource: 'ai_draft',
    },
  };
}

test('final export strips AI draft wording from CP text', () => {
  const result = prepareFinalExportRPP(baseRpp('Draft saran AI (bukan rumusan resmi pemerintah): Peserta didik mampu menganalisis ekosistem.'));
  assert.equal(result.identity.learningOutcomes, 'Peserta didik mampu menganalisis ekosistem.');
});

test('answer consistency catches a reversed trophic cascade key without adding a general quality-check pass', () => {
  const issues = validateQuestionAnswerConsistency({
    id: 'PG-5', type: 'PG', objectiveMeasured: 'TP2', indicator: 'Menganalisis dampak perubahan populasi.',
    question: 'Perhatikan jaring-jaring makanan berikut: Fitoplankton -> Zooplankton -> Ikan Kecil -> Ikan Besar. Jika populasi ikan besar ditangkap secara berlebihan oleh nelayan, kejadian dampak berantai yang mungkin terjadi adalah...',
    options: [
      'A. Populasi ikan kecil menurun drastis.',
      'B. Populasi fitoplankton menurun karena populasi ikan kecil meningkat dan memakan zooplankton.',
      'C. Populasi zooplankton meningkat pesat tanpa kendala.',
      'D. Daur air di perairan akan terhenti.',
      'E. Fitoplankton berkembang melimpah tanpa ada yang memakan.',
    ],
    correctAnswer: 'B. Populasi fitoplankton menurun karena populasi ikan kecil meningkat dan memakan zooplankton.',
  });
  assert.match(issues.join(' '), /bertentangan dengan arah dampak berantai/i);
});

test('answer consistency accepts a coherent simple trophic cascade key', () => {
  const issues = validateQuestionAnswerConsistency({
    id: 'PG-5', type: 'PG', objectiveMeasured: 'TP2', indicator: 'Menganalisis dampak perubahan populasi.',
    question: 'Perhatikan rantai makanan berikut: Fitoplankton -> Zooplankton -> Ikan Kecil -> Ikan Besar. Jika populasi ikan besar menurun drastis, dampak berantai yang mungkin terjadi adalah...',
    options: ['A. Fitoplankton meningkat karena ikan kecil meningkat dan zooplankton menurun.', 'B. Semua populasi menurun.', 'C. Tidak ada perubahan.', 'D. Energi berbalik arah.'],
    correctAnswer: 'A. Fitoplankton meningkat karena ikan kecil meningkat dan zooplankton menurun.',
  });
  assert.deepEqual(issues, []);
});

test('text normalizer fixes common teacher-document typos and the misleading 10-percent phrasing', () => {
  assert.equal(normalizeGeneratedText('Guru meluruskan mipsepsi dan peserta didik mengitung energi.'), 'Guru meluruskan miskonsepsi dan peserta didik menghitung energi.');
  assert.equal(
    normalizeGeneratedText('Energi mengalir satu arah dengan penurunan energi sekitar 10% pada setiap tingkatan.'),
    'Energi mengalir satu arah dengan sekitar 10% energi diteruskan ke tingkat trofik berikutnya.',
  );
});
