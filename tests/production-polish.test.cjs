const assert = require('node:assert/strict');
const test = require('node:test');

const {
  inferEvidenceTypeFromObjective,
} = require('../.tmp-tests/lib/validation/pedagogy.js');
const {
  getObjectiveEvidenceGroups,
} = require('../.tmp-tests/lib/validation/assessment.js');
const {
  normalizeQuestionIndicator,
  isQuestionContentAligned,
} = require('../.tmp-tests/lib/validation/question-semantics.js');
const {
  buildAssessmentItemBlueprint,
} = require('../.tmp-tests/app/api/gemini/generate-rpp/assessment-blueprint.js');
const {
  buildMaterialAutofill,
} = require('../.tmp-tests/components/wizard/material-autofill.js');
const {
  getCompactDiagnostics,
  getCompactFormativeChecklist,
} = require('../.tmp-tests/lib/assessment-display.js');
const {
  normalizeGeneratedText,
} = require('../.tmp-tests/app/api/gemini/generate-rpp/text-quality.js');

test('observation modality becomes authentic primary evidence instead of written evidence', () => {
  const objective = 'Mengidentifikasi komponen biotik dan abiotik melalui observasi lapangan.';
  assert.equal(inferEvidenceTypeFromObjective(objective), 'OBSERVATION');

  const objectives = [{
    ref: 'TP1', objective, competencyVerb: 'Mengidentifikasi', contentFocus: 'komponen ekosistem',
    evidenceType: 'OBSERVATION', criteriaFocus: 'ketepatan observasi',
  }];
  const blueprint = [{
    objectiveRef: 'TP1', primaryEvidenceType: 'OBSERVATION', writtenAssessmentAllowed: false,
    instrumentHint: 'Lembar observasi lapangan',
  }];
  const items = buildAssessmentItemBlueprint(objectives, blueprint, 1, 1);
  assert.ok(items.every((item) => item.role === 'SUPPORTING'));
  assert.equal(inferEvidenceTypeFromObjective('Merancang solusi berdasarkan observasi lapangan.'), 'PRODUCT');
});

test('indicator is downgraded when it overclaims the actual question demand', () => {
  const question = {
    id: 'PG-1', type: 'PG',
    question: 'Solusi berkelanjutan yang paling tepat untuk mengatasi ledakan hama adalah...',
    options: ['A', 'B', 'C', 'D'], correctAnswer: 'C',
    indicator: 'Peserta didik dapat merumuskan solusi berbasis keseimbangan ekosistem.',
    objectiveMeasured: 'TP3',
  };
  const normalized = normalizeQuestionIndicator(question);
  assert.match(normalized.indicator, /menilai solusi/i);
  assert.doesNotMatch(normalized.indicator, /merumuskan/i);
});

test('material autofill summarizes multiple analyzed subtopics instead of taking only the first one', () => {
  const identity = {
    teacherName: 'Guru', schoolName: 'Sekolah', academicYear: '2026/2027', educationLevel: 'SMA/MA', subject: 'IPA',
    grade: 'Kelas X', phase: 'E', semester: 'Ganjil', element: '', topic: '', subtopic: '', jpCount: 3,
    durationPerJP: 45, meetingCount: 1, totalMinutes: 135, learningOutcomes: '', cpSource: 'manual',
  };
  const analysis = {
    title: 'Ekosistem',
    subtopics: ['Komponen Biotik dan Abiotik', 'Aliran Energi', 'Daur Biogeokimia', 'Keseimbangan Lingkungan'],
    coreConcepts: [], prerequisiteConcepts: [], keyTerms: [], keyFacts: [], targetSkills: [], authenticContext: '',
    potentialProducts: [], potentialActivities: [], potentialAssessments: [], generatedElement: 'Pemahaman IPA', generatedCP: 'Draft CP',
  };
  const result = buildMaterialAutofill(identity, analysis);
  assert.equal(result.subtopic, 'Komponen Biotik dan Abiotik; Aliran Energi; Daur Biogeokimia; Keseimbangan Lingkungan');
});

test('ringkas assessment helpers expose real diagnostic questions and compact formative criteria', () => {
  const rpp = {
    assessment: {
      diagnosticNonCognitive: [],
      diagnosticCognitive: [
        { category: 'Kognitif', aspectOrTopic: 'Ekosistem', question: 'Apa perbedaan komponen biotik dan abiotik?', keyOrCriteria: 'Memberi contoh keduanya.' },
        { category: 'Kognitif', aspectOrTopic: 'Energi', question: 'Dari mana sumber energi utama ekosistem?', keyOrCriteria: 'Matahari.' },
      ],
      formative: [{ technique: 'Observasi', instrument: 'Lembar observasi', timing: 'Proses', purpose: 'Memantau keterlibatan.' }],
      summativeQuestions: [],
    },
    successCriteria: [
      { objective: 'TP1', criteria: 'Peserta didik mampu mengidentifikasi komponen biotik dan abiotik secara tepat.', assessmentEvidence: 'Lembar observasi.' },
      { objective: 'TP2', criteria: 'Mampu menyusun model aliran energi secara akurat.', assessmentEvidence: 'Infografis.' },
    ],
  };
  assert.equal(getCompactDiagnostics(rpp, 4).length, 2);
  assert.deepEqual(getCompactFormativeChecklist(rpp, 4), [
    'mengidentifikasi komponen biotik dan abiotik secara tepat.',
    'menyusun model aliran energi secara akurat.',
    'Memantau keterlibatan.',
    'Lembar observasi',
  ]);
});


test('scientific investigation is treated as performance and keeps investigation evidence as primary', () => {
  const objective = 'Melakukan penyelidikan ilmiah mengenai dampak aktivitas manusia terhadap daur biogeokimia.';
  assert.equal(inferEvidenceTypeFromObjective(objective), 'PERFORMANCE');

  const groups = getObjectiveEvidenceGroups({
    objectives: [objective],
    questions: [{
      id: 'PG-1', type: 'PG', question: 'Dampak eutrofikasi yang paling mungkin adalah...', options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'B', indicator: 'Menganalisis dampak eutrofikasi.', objectiveMeasured: 'TP1', evidenceRole: 'SUPPORTING',
      plannedCompetency: 'ANALYZE',
    }],
    successCriteria: [{
      objective: 'TP1', criteria: 'Penyelidikan dilakukan sistematis.', assessmentEvidence: 'Lembar Observasi Kinerja Penyelidikan Lapangan',
    }],
  });

  assert.deepEqual(groups.primary.get('TP1'), ['Lembar Observasi Kinerja Penyelidikan Lapangan']);
  assert.deepEqual(groups.supporting.get('TP1'), ['PG-1']);
});

test('primary science question is rejected when it shifts from energy flow to biogeochemical cycling', () => {
  const question = {
    id: 'PG-5', type: 'PG',
    question: 'Jika populasi dekomposer menurun, dampak langsung terhadap daur materi ekosistem adalah...',
    options: ['A', 'B', 'C', 'D'], correctAnswer: 'A',
    indicator: 'Menganalisis peran pengurai dalam daur biogeokimia.', objectiveMeasured: 'TP1',
  };
  assert.equal(
    isQuestionContentAligned(question, 'keterkaitan komponen biotik dan abiotik serta aliran energi dalam ekosistem lokal', 'PRIMARY'),
    false,
  );
});

test('text normalization uses around ten percent for transfer efficiency phrasing', () => {
  assert.equal(
    normalizeGeneratedText('Menganalisis efisiensi transfer energi 10 persen antar tingkat trofik.'),
    'Menganalisis perpindahan energi sekitar 10% antar tingkat trofik.',
  );
  assert.equal(
    normalizeGeneratedText('Energi yang berpindah sekitar 10 persen pada tiap tingkat trofik.'),
    'Energi yang berpindah sekitar 10% pada tiap tingkat trofik.',
  );
});


test('final text quality removes duplicate words and repairs high-confidence wording slips', () => {
  assert.equal(normalizeGeneratedText('Lembar Lembar Observasi dan originalitas ide ide solusi.'), 'Lembar Observasi dan orisinalitas ide solusi.');
  assert.equal(normalizeGeneratedText('Kerusakan vegetasi menolak penyerapan karbon.'), 'Kerusakan vegetasi menurunkan penyerapan karbon.');
  assert.equal(normalizeGeneratedText('Menjaga keberlangsung daur materi dan enceng gondok.'), 'Menjaga keberlangsungan daur materi dan eceng gondok.');
});
