const assert = require('node:assert/strict');
const test = require('node:test');
const {
  formatPhase,
  validateBeforeGeneration,
  validateCPAlignment,
  validateElementLooksLikeTopic,
  validateElementSubjectAlignment,
  findUnsupportedFactAnchors,
  validateGradeLevelPhase,
  validateModelSyntax,
} = require('../.tmp-tests/lib/validation.js');

const baseIdentity = {
  teacherName: '', schoolName: '', academicYear: '2026/2027', educationLevel: 'SMP/MTs', subject: 'Ilmu Pengetahuan Sosial (IPS)',
  grade: 'Kelas IX', phase: 'D', semester: 'Ganjil', element: '', topic: 'Lembaga Keuangan', subtopic: '',
  jpCount: 3, durationPerJP: 40, meetingCount: 1, totalMinutes: 120,
  learningOutcomes: 'Peserta didik menganalisis peran lembaga keuangan bank dan bukan bank dalam perekonomian.', cpSource: 'manual',
};
const analysis = {
  title: 'Lembaga Keuangan', subtopics: [], coreConcepts: [], prerequisiteConcepts: [], keyTerms: [], keyFacts: [], targetSkills: [],
  authenticContext: '', potentialProducts: [], potentialActivities: [], potentialAssessments: [], detectedGrade: 'Kelas IX', detectedLevel: 'SMP/MTs', detectedPhase: 'D', detectedSubject: 'IPS',
};

test('blocks SMA with Kelas IX', () => {
  const issues = validateGradeLevelPhase('SMA/MA', 'Kelas IX', 'D');
  assert.ok(issues.some((issue) => issue.field === 'grade' && issue.severity === 'error'));
});
test('blocks unresolved source grade mismatch', () => {
  const result = validateBeforeGeneration({ ...baseIdentity, grade: 'Kelas VII' }, analysis);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((issue) => issue.message.includes('Kelas IX')));
});
test('allows source grade adaptation after explicit note', () => {
  const result = validateBeforeGeneration({ ...baseIdentity, grade: 'Kelas VII', gradeAdaptationNote: 'Diadaptasi oleh pengguna.' }, analysis);
  assert.equal(result.errors.some((issue) => issue.message.includes('Materi sumber terdeteksi')), false);
});
test('detects ecosystem CP on financial topic', () => {
  assert.equal(validateCPAlignment('Peserta didik menganalisis ekosistem dan rantai makanan.', 'IPS', 'Lembaga Keuangan').isAligned, false);
});
test('detects IPA element on IPS subject', () => {
  assert.equal(validateElementSubjectAlignment('Ilmu Pengetahuan Sosial (IPS)', 'Pemahaman IPA & Keterampilan Proses').isAligned, false);
});
test('formats phase exactly once', () => {
  assert.equal(formatPhase('Fase D'), 'Fase D');
  assert.equal(formatPhase('D'), 'Fase D');
});

test('warns when element looks like a topic name', () => {
  const result = validateElementLooksLikeTopic('Pemahaman Kemerdekaan Indonesia', 'Latar Belakang Proklamasi Kemerdekaan Indonesia');
  assert.equal(result.looksLikeTopic, true);
});

test('flags generated date/regulation anchors that are absent from source material', () => {
  const issues = findUnsupportedFactAnchors(
    { ...analysis, keyFacts: ['Peristiwa terjadi pada 17 Agustus 1945.'], rawTextContext: 'Proklamasi dibacakan 17 Agustus 1945.' },
    ['Peristiwa terjadi pada 17 Agustus 1945 dan diperkuat UU No. 11 Tahun 1953.']
  );
  assert.ok(issues.includes('uu:11:1953'));
  assert.equal(issues.includes('1945'), false);
});

test('accepts product evidence as TP assessment without forcing a written question', () => {
  const { allObjectivesHaveAssessmentEvidence } = require('../.tmp-tests/lib/validation.js');
  const objectives = ['Membilang benda 1 sampai 20.', 'Membandingkan dua kumpulan benda.', 'Membuat Kartu Angka dan Gambar.'];
  const result = allObjectivesHaveAssessmentEvidence({
    objectives,
    questions: [
      { id: 'Q1', type: 'PG', question: 'Membilang benda.', correctAnswer: 'A', indicator: 'membilang', objectiveMeasured: 'TP1' },
      { id: 'Q2', type: 'PG', question: 'Membandingkan jumlah benda.', correctAnswer: 'B', indicator: 'membandingkan', objectiveMeasured: 'TP2' },
    ],
    successCriteria: [
      { objective: 'TP1', criteria: 'Tepat', assessmentEvidence: 'Observasi membilang' },
      { objective: 'TP2', criteria: 'Tepat', assessmentEvidence: 'LKPD perbandingan' },
      { objective: 'TP3', criteria: 'Tepat', assessmentEvidence: 'Produk Kartu Angka dinilai dengan Rubrik Produk' },
    ],
  });
  assert.equal(result, true);
});

test('flags a written question that expands beyond detected number range', () => {
  const { validateAssessmentScope } = require('../.tmp-tests/lib/validation.js');
  const result = validateAssessmentScope({
    objectives: ['Peserta didik mampu membilang angka 1 sampai 20.'],
    topic: 'Mengenal dan Membilang Angka 1 sampai 20',
    questions: [{ id: 'Q1', type: 'PG', question: 'Apa arti angka 0?', correctAnswer: 'Kosong', indicator: 'Memahami angka 0', objectiveMeasured: 'TP1' }],
  });
  assert.equal(result.isAligned, false);
  assert.ok(result.issues.some((issue) => issue.includes('di luar rentang')));
});


test('does not count PBL syntax placed only in PENUTUP as a valid core model stage', () => {
  const activities = [
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'Sintaks 1–2 PBL: Orientasi dan Mengorganisasikan', description: '', experience: 'MEMAHAMI', timeMinutes: 30 },
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'Sintaks 3 PBL: Membimbing Penyelidikan', description: '', experience: 'MENGAPLIKASI', timeMinutes: 30 },
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'Sintaks 4 PBL: Mengembangkan dan Menyajikan Hasil Karya', description: '', experience: 'MENGAPLIKASI', timeMinutes: 30 },
    { stage: 'PENUTUP', syntaxOrPrinciple: 'Sintaks 5 PBL: Menganalisis dan Mengevaluasi Proses Pemecahan Masalah', description: '', experience: 'MEREFLEKSI', timeMinutes: 30 },
  ];
  assert.equal(validateModelSyntax('Problem Based Learning', activities), false);
});

test('deduplicates product evidence when detailed success criterion already includes product rubric', () => {
  const { getObjectiveEvidenceMap } = require('../.tmp-tests/lib/validation.js');
  const evidence = getObjectiveEvidenceMap({
    objectives: ['Merancang produk infografis anti-hoaks.'],
    questions: [],
    successCriteria: [{ objective: 'TP1', criteria: 'Tepat', assessmentEvidence: 'Produk infografis anti-hoaks dan rubrik penilaian produk.' }],
    productRubric: [{ aspect: 'Konten', indicator: 'Tepat', levels: { score1: '1', score2: '2', score3: '3', score4: '4' } }],
  });
  assert.deepEqual(evidence.get('TP1'), ['Produk infografis anti-hoaks dan rubrik penilaian produk.']);
});

test('extracts and deduplicates grounded Google Search source links', () => {
  const { extractWebGrounding } = require('../.tmp-tests/lib/gemini-grounding.js');
  const result = extractWebGrounding({
    candidates: [{ groundingMetadata: {
      webSearchQueries: ['CP Pendidikan Pancasila Fase E', 'CP Pendidikan Pancasila Fase E'],
      groundingChunks: [
        { web: { title: 'Kemendikdasmen', uri: 'https://example.go.id/cp' } },
        { web: { title: 'Kemendikdasmen duplicate', uri: 'https://example.go.id/cp' } },
        { web: { title: 'BPK', uri: 'https://peraturan.example.go.id/uu' } },
      ],
    } }],
  });
  assert.equal(result.sources.length, 2);
  assert.equal(result.sources[0].url, 'https://example.go.id/cp');
  assert.equal(result.sources[0].domain, 'example.go.id');
  assert.deepEqual(result.queries, ['CP Pendidikan Pancasila Fase E']);
});

test('P3: rejects written-only evidence for product TP and falls back to product rubric evidence', () => {
  const { getObjectiveEvidenceMap } = require('../.tmp-tests/lib/validation.js');
  const evidence = getObjectiveEvidenceMap({
    objectives: ['Menganalisis teori.', 'Membuat produk poster digital.'],
    questions: [
      { id: 'Q1', type: 'PG', question: 'Teori', correctAnswer: 'A', indicator: 'teori', objectiveMeasured: 'TP1' },
      { id: 'Q2', type: 'Uraian', question: 'Soal spesifik TP2', correctAnswer: 'B', indicator: 'poster', objectiveMeasured: 'TP2' },
    ],
    successCriteria: [
      { objective: 'TP1', criteria: 'Tepat', assessmentEvidence: 'Soal Q1' },
      { objective: 'TP2', criteria: 'Tepat', assessmentEvidence: 'Soal Q2' },
    ],
    productRubric: [{ aspect: 'Kreativitas', indicator: 'Tepat', levels: { score1: '1', score2: '2', score3: '3', score4: '4' } }],
  });
  assert.deepEqual(evidence.get('TP2'), ['Produk + Rubrik Produk']);
  assert.equal(evidence.get('TP2').includes('Soal Q2'), false);
});

test('P4: normalizes away fabricated numerical group sizes', () => {
  const { cleanGeneratedTextFields } = require('../.tmp-tests/app/api/gemini/generate-rpp/text-quality.js');
  const cleaned = cleanGeneratedTextFields({
    activity: 'Membentuk kelompok kecil (4-5 orang) untuk berdiskusi.',
    note: 'Setiap kelompok beranggotakan 4-5 peserta didik.',
  });
  assert.equal(cleaned.activity, 'Membentuk kelompok kecil untuk berdiskusi.');
  assert.equal(cleaned.note, 'Setiap kelompok beranggotakan beberapa peserta didik.');
});

test('P2: final source box stays clean when webSources is empty', () => {
  const { renderSourceBox } = require('../.tmp-tests/lib/export/source-section.js');
  const dummyRPP = {
    documentFormat: 'Lengkap',
    sourcesUsed: ['Materi Teks Pengguna'],
    researchSources: [],
    facilities: { learningSources: ['Buku Teks Utama'] },
  };
  const html = renderSourceBox(dummyRPP);
  assert.equal(html.includes('grounding Google Search'), false);
  assert.equal(html.includes('perlu diverifikasi'), false);
  assert.equal(html.includes('RPP Deep Learning Generator'), false);
});

test('P2: final source box renders grounded web sources without review disclaimer', () => {
  const { renderSourceBox } = require('../.tmp-tests/lib/export/source-section.js');
  const dummyRPP = {
    documentFormat: 'Lengkap',
    sourcesUsed: ['Materi Teks Pengguna'],
    researchSources: [{ title: 'UUD NRI 1945', url: 'https://jdih.go.id/uud1945', domain: 'jdih.go.id' }],
    facilities: { learningSources: ['Buku Teks Utama'] },
  };
  const html = renderSourceBox(dummyRPP);
  assert.equal(html.includes('Sumber Riset Web:'), true);
  assert.equal(html.includes('https://jdih.go.id/uud1945'), true);
  assert.equal(html.includes('grounding Google Search'), false);
  assert.equal(html.includes('perlu diverifikasi'), false);
});


test('semantic validator rejects an off-topic TP even when TP exists', () => {
  const { validateObjectiveAlignment } = require('../.tmp-tests/lib/validation.js');
  const result = validateObjectiveAlignment(
    ['Menganalisis interaksi komponen ekosistem.', 'Membuat poster rantai makanan.', 'Menjelaskan fungsi bank dan koperasi.'],
    'Peserta didik menganalisis interaksi komponen ekosistem dan aliran energi.',
    'Ekosistem',
    { ...analysis, title: 'Ekosistem', coreConcepts: ['komponen biotik dan abiotik', 'rantai makanan'], keyTerms: ['ekosistem', 'energi'] },
  );
  assert.equal(result.isAligned, false);
  assert.ok(result.issues.some((issue) => issue.includes('TP3')));
});

test('written PG does not count as primary evidence for a product TP', () => {
  const { allObjectivesHaveAssessmentEvidence } = require('../.tmp-tests/lib/validation.js');
  const result = allObjectivesHaveAssessmentEvidence({
    objectives: ['Merancang infografis solusi pelestarian ekosistem.'],
    questions: [{ id: 'PG-1', type: 'PG', question: 'Apa arti ekosistem?', correctAnswer: 'A', indicator: 'Menjelaskan ekosistem', objectiveMeasured: 'TP1' }],
    successCriteria: [],
    productRubric: [],
  });
  assert.equal(result, false);
});

test('pedagogical plan requires product evidence for a creation objective', () => {
  const { validatePedagogicalPlan } = require('../.tmp-tests/lib/validation.js');
  const result = validatePedagogicalPlan({
    resolvedModel: 'Problem Based Learning', modelReason: 'Kontekstual',
    objectives: [{ ref: 'TP1', objective: 'Merancang infografis solusi ekosistem.', competencyVerb: 'Merancang', contentFocus: 'ekosistem', evidenceType: 'PRODUCT', criteriaFocus: 'solusi' },
      { ref: 'TP2', objective: 'Menganalisis interaksi ekosistem.', competencyVerb: 'Menganalisis', contentFocus: 'interaksi', evidenceType: 'WRITTEN', criteriaFocus: 'analisis' },
      { ref: 'TP3', objective: 'Menjelaskan aliran energi ekosistem.', competencyVerb: 'Menjelaskan', contentFocus: 'energi', evidenceType: 'WRITTEN', criteriaFocus: 'konsep' }],
    assessmentBlueprint: [{ objectiveRef: 'TP1', primaryEvidenceType: 'WRITTEN', writtenAssessmentAllowed: true, instrumentHint: 'Tes' },
      { objectiveRef: 'TP2', primaryEvidenceType: 'WRITTEN', writtenAssessmentAllowed: true, instrumentHint: 'Tes' },
      { objectiveRef: 'TP3', primaryEvidenceType: 'WRITTEN', writtenAssessmentAllowed: true, instrumentHint: 'Tes' }],
    activityBlueprint: [],
  });
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.includes('PRODUCT')));
});

test('recognizes mengkonstruksi as CREATE competency alias', () => {
  const { competencyGroup } = require('../.tmp-tests/lib/validation.js');
  assert.equal(competencyGroup('Mengkonstruksi model jaring-jaring makanan.'), 'CREATE');
});

test('deterministic assessment blueprint marks written slots for product TP as SUPPORTING', () => {
  const { buildAssessmentItemBlueprint } = require('../.tmp-tests/app/api/gemini/generate-rpp/assessment-blueprint.js');
  const objectives = [
    { ref: 'TP1', objective: 'Menganalisis keterkaitan komponen ekosistem.', competencyVerb: 'Menganalisis', contentFocus: 'komponen ekosistem', evidenceType: 'WRITTEN', criteriaFocus: 'analisis' },
    { ref: 'TP2', objective: 'Mengonstruksi model jaring-jaring makanan.', competencyVerb: 'Mengonstruksi', contentFocus: 'jaring-jaring makanan', evidenceType: 'PRODUCT', criteriaFocus: 'model' },
    { ref: 'TP3', objective: 'Merancang solusi konservasi ekosistem.', competencyVerb: 'Merancang', contentFocus: 'solusi konservasi', evidenceType: 'PRODUCT', criteriaFocus: 'solusi' },
  ];
  const blueprint = [
    { objectiveRef: 'TP1', primaryEvidenceType: 'WRITTEN', writtenAssessmentAllowed: true, instrumentHint: 'Tes' },
    { objectiveRef: 'TP2', primaryEvidenceType: 'PRODUCT', writtenAssessmentAllowed: false, instrumentHint: 'Produk' },
    { objectiveRef: 'TP3', primaryEvidenceType: 'PRODUCT', writtenAssessmentAllowed: false, instrumentHint: 'Produk' },
  ];
  const items = buildAssessmentItemBlueprint(objectives, blueprint, 5, 3);
  assert.equal(items.length, 8);
  assert.deepEqual(items.slice(0, 3).map((item) => [item.id, item.objectiveRef, item.role, item.competency]), [
    ['PG-1', 'TP1', 'PRIMARY', 'ANALYZE'],
    ['PG-2', 'TP2', 'SUPPORTING', 'ANALYZE'],
    ['PG-3', 'TP3', 'SUPPORTING', 'ANALYZE'],
  ]);
});

test('plan-aware assessment validator accepts supporting analytical question for a CREATE TP', () => {
  const { validateAssessmentScope } = require('../.tmp-tests/lib/validation.js');
  const objectives = ['Merancang solusi konservasi ekosistem lokal.'];
  const plan = {
    resolvedModel: 'Project Based Learning', modelReason: '',
    objectives: [{ ref: 'TP1', objective: objectives[0], competencyVerb: 'Merancang', contentFocus: 'solusi konservasi ekosistem', evidenceType: 'PRODUCT', criteriaFocus: 'solusi' }],
    assessmentBlueprint: [{ objectiveRef: 'TP1', primaryEvidenceType: 'PRODUCT', writtenAssessmentAllowed: false, instrumentHint: 'Produk' }],
    assessmentItems: [{ id: 'PG-1', questionType: 'PG', objectiveRef: 'TP1', role: 'SUPPORTING', competency: 'ANALYZE', contentFocus: 'solusi konservasi ekosistem' }],
    activityBlueprint: [],
  };
  const result = validateAssessmentScope({
    objectives,
    topic: 'Ekosistem',
    pedagogicalPlan: plan,
    questions: [{
      id: 'PG-1', type: 'PG',
      question: 'Suatu sungai tercemar dan populasi ikan menurun. Dampak ekologi manakah yang paling logis?',
      options: ['A', 'B', 'C', 'D'], correctAnswer: 'A',
      indicator: 'Menganalisis dampak gangguan ekosistem sebagai dasar penyusunan solusi konservasi.',
      objectiveMeasured: 'TP1', evidenceRole: 'SUPPORTING', plannedCompetency: 'ANALYZE',
    }],
  });
  assert.equal(result.isAligned, true);
});

test('supporting written item does not count as primary TP evidence', () => {
  const { getObjectiveEvidenceMap } = require('../.tmp-tests/lib/validation.js');
  const evidence = getObjectiveEvidenceMap({
    objectives: ['Merancang solusi konservasi ekosistem lokal.'],
    questions: [{
      id: 'PG-1', type: 'PG', question: 'Analisis dampak pencemaran.', options: ['A','B','C','D'],
      correctAnswer: 'A', indicator: 'Menganalisis dampak pencemaran.', objectiveMeasured: 'TP1', evidenceRole: 'SUPPORTING', plannedCompetency: 'ANALYZE',
    }],
    successCriteria: [{ objective: 'TP1', criteria: 'Solusi tepat', assessmentEvidence: 'Produk poster solusi konservasi dan Rubrik Produk' }],
  });
  assert.deepEqual(evidence.get('TP1'), ['Produk poster solusi konservasi dan Rubrik Produk']);
});

test('assessment alignment locks IDs, target TP and drops unplanned extra questions', () => {
  const { alignQuestionsToAssessmentPlan } = require('../.tmp-tests/app/api/gemini/generate-rpp/assessment-mapping.js');
  const items = [
    { id: 'PG-1', questionType: 'PG', objectiveRef: 'TP1', role: 'PRIMARY', competency: 'ANALYZE', contentFocus: 'ekosistem' },
    { id: 'UR-1', questionType: 'Uraian', objectiveRef: 'TP2', role: 'SUPPORTING', competency: 'ANALYZE', contentFocus: 'jaring makanan' },
  ];
  const aligned = alignQuestionsToAssessmentPlan([
    { id: 'Q-OLD', type: 'PG', question: 'Analisis ekosistem', options: ['A','B','C','D'], correctAnswer: 'A', indicator: 'Menganalisis ekosistem', objectiveMeasured: 'TP9' },
    { id: 'EXTRA', type: 'PG', question: 'Extra', options: ['A','B','C','D'], correctAnswer: 'A', indicator: 'Extra', objectiveMeasured: 'TP9' },
    { id: 'ANY', type: 'Uraian', question: 'Analisis jaring makanan', correctAnswer: '...', indicator: 'Menganalisis jaring makanan', objectiveMeasured: 'TP1' },
  ], items);
  assert.equal(aligned.length, 2);
  assert.deepEqual(aligned.map((q) => [q.id, q.objectiveMeasured, q.evidenceRole]), [
    ['PG-1', 'TP1', 'PRIMARY'],
    ['UR-1', 'TP2', 'SUPPORTING'],
  ]);
});

test('plan completeness flags a missing expected assessment slot', () => {
  const { validateAssessmentScope } = require('../.tmp-tests/lib/validation.js');
  const plan = {
    resolvedModel: 'Problem Based Learning', modelReason: '',
    objectives: [{ ref: 'TP1', objective: 'Menganalisis ekosistem.', competencyVerb: 'Menganalisis', contentFocus: 'ekosistem', evidenceType: 'WRITTEN', criteriaFocus: '' }],
    assessmentBlueprint: [{ objectiveRef: 'TP1', primaryEvidenceType: 'WRITTEN', writtenAssessmentAllowed: true, instrumentHint: 'Tes' }],
    assessmentItems: [
      { id: 'PG-1', questionType: 'PG', objectiveRef: 'TP1', role: 'PRIMARY', competency: 'ANALYZE', contentFocus: 'ekosistem' },
      { id: 'UR-1', questionType: 'Uraian', objectiveRef: 'TP1', role: 'PRIMARY', competency: 'ANALYZE', contentFocus: 'ekosistem' },
    ],
    activityBlueprint: [],
  };
  const result = validateAssessmentScope({
    objectives: ['Menganalisis ekosistem.'], topic: 'Ekosistem', pedagogicalPlan: plan,
    questions: [{ id: 'PG-1', type: 'PG', question: 'Analisis hubungan dalam ekosistem.', options: ['A','B','C','D'], correctAnswer: 'A', indicator: 'Menganalisis hubungan ekosistem.', objectiveMeasured: 'TP1', evidenceRole: 'PRIMARY', plannedCompetency: 'ANALYZE' }],
  });
  assert.equal(result.isAligned, false);
  assert.ok(result.issues.some((issue) => issue.includes('UR-1')));
});

test('normalizes PBL abbreviation to PjBL for Project Based Learning', () => {
  const { normalizeModelSyntaxLabels } = require('../.tmp-tests/app/api/gemini/generate-rpp/post-process-helpers.js');
  const result = normalizeModelSyntaxLabels([
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'Sintaks 1 PBL: Pertanyaan Mendasar', description: '', experience: 'MEMAHAMI', timeMinutes: 20 },
  ], 'Project Based Learning');
  assert.equal(result[0].syntaxOrPrinciple, 'Sintaks 1 PjBL: Pertanyaan Mendasar');
});

test('repair target finder isolates only invalid or missing planned assessment items', () => {
  const { findAssessmentRepairTargets } = require('../.tmp-tests/app/api/gemini/generate-rpp/assessment-repair-logic.js');
  const plan = {
    resolvedModel: 'Problem Based Learning', modelReason: '',
    objectives: [
      { ref: 'TP1', objective: 'Menganalisis keterkaitan komponen ekosistem.', competencyVerb: 'Menganalisis', contentFocus: 'komponen ekosistem', evidenceType: 'WRITTEN', criteriaFocus: '' },
      { ref: 'TP2', objective: 'Merancang solusi konservasi ekosistem.', competencyVerb: 'Merancang', contentFocus: 'solusi konservasi', evidenceType: 'PRODUCT', criteriaFocus: '' },
    ],
    assessmentBlueprint: [
      { objectiveRef: 'TP1', primaryEvidenceType: 'WRITTEN', writtenAssessmentAllowed: true, instrumentHint: 'Tes' },
      { objectiveRef: 'TP2', primaryEvidenceType: 'PRODUCT', writtenAssessmentAllowed: false, instrumentHint: 'Produk' },
    ],
    assessmentItems: [
      { id: 'PG-1', questionType: 'PG', objectiveRef: 'TP1', role: 'PRIMARY', competency: 'ANALYZE', contentFocus: 'komponen ekosistem' },
      { id: 'PG-2', questionType: 'PG', objectiveRef: 'TP2', role: 'SUPPORTING', competency: 'ANALYZE', contentFocus: 'solusi konservasi' },
      { id: 'UR-1', questionType: 'Uraian', objectiveRef: 'TP1', role: 'PRIMARY', competency: 'ANALYZE', contentFocus: 'komponen ekosistem' },
    ],
    activityBlueprint: [],
  };
  const context = {
    pedagogicalPlan: plan,
    identity: { topic: 'Ekosistem', subtopic: 'Komponen Ekosistem' },
    materialAnalysis: { title: 'Ekosistem', coreConcepts: ['komponen ekosistem'], keyTerms: ['biotik', 'abiotik'], keyFacts: [], subtopics: [], targetSkills: [], potentialProducts: [], potentialActivities: [], potentialAssessments: [], prerequisiteConcepts: [], authenticContext: '', detectedGrade: '', detectedLevel: '', detectedPhase: '', detectedSubject: '' },
  };
  const targets = findAssessmentRepairTargets(context, [
    { id: 'PG-1', type: 'PG', question: 'Komponen abiotik adalah...', options: ['A','B','C','D'], correctAnswer: 'A', indicator: 'Mengidentifikasi komponen abiotik.', objectiveMeasured: 'TP1', evidenceRole: 'PRIMARY', plannedCompetency: 'ANALYZE' },
    { id: 'PG-2', type: 'PG', question: 'Sungai tercemar. Dampak apa yang paling logis?', options: ['A','B','C','D'], correctAnswer: 'A', indicator: 'Menganalisis dampak gangguan ekosistem sebagai dasar solusi konservasi.', objectiveMeasured: 'TP2', evidenceRole: 'SUPPORTING', plannedCompetency: 'ANALYZE' },
  ]);
  assert.deepEqual(targets.map((target) => target.item.id).sort(), ['PG-1', 'UR-1']);
});

test('repair replacement merge preserves valid items and locks replacement metadata to blueprint', () => {
  const { mergeAssessmentReplacements } = require('../.tmp-tests/app/api/gemini/generate-rpp/assessment-repair-logic.js');
  const plan = {
    resolvedModel: 'Problem Based Learning', modelReason: '', objectives: [], assessmentBlueprint: [], activityBlueprint: [],
    assessmentItems: [
      { id: 'PG-1', questionType: 'PG', objectiveRef: 'TP1', role: 'PRIMARY', competency: 'ANALYZE', contentFocus: 'ekosistem' },
      { id: 'UR-1', questionType: 'Uraian', objectiveRef: 'TP2', role: 'SUPPORTING', competency: 'ANALYZE', contentFocus: 'jaring makanan' },
    ],
  };
  const current = [
    { id: 'PG-1', type: 'PG', question: 'Lama', options: ['A','B','C','D'], correctAnswer: 'A', indicator: 'Mengidentifikasi', objectiveMeasured: 'TP9' },
    { id: 'UR-1', type: 'Uraian', question: 'Tetap', correctAnswer: 'Jawab', indicator: 'Menganalisis jaring makanan', objectiveMeasured: 'TP2' },
  ];
  const merged = mergeAssessmentReplacements(current, [
    { id: 'PG-1', type: 'PG', question: 'Baru', options: ['A','B','C','D'], correctAnswer: 'B', indicator: 'Menganalisis ekosistem', objectiveMeasured: 'TP7' },
  ], plan);
  assert.equal(merged[0].question, 'Baru');
  assert.equal(merged[0].objectiveMeasured, 'TP1');
  assert.equal(merged[0].evidenceRole, 'PRIMARY');
  assert.equal(merged[1].question, 'Tetap');
});

test('cognitive demand is inferred from question stem, not a flattering indicator label', () => {
  const { inferQuestionCognitiveDemand } = require('../.tmp-tests/lib/validation/question-semantics.js');
  const question = {
    id: 'PG-1', type: 'PG',
    question: 'Tanaman anggrek menempel pada pohon mangga. Pola interaksi yang terjadi adalah...',
    options: ['Mutualisme', 'Komensalisme', 'Parasitisme', 'Predasi'],
    correctAnswer: 'Komensalisme', indicator: 'Menganalisis pola interaksi antarkomponen biotik.', objectiveMeasured: 'TP1',
  };
  assert.equal(inferQuestionCognitiveDemand(question), 'UNDERSTAND');
});

test('primary ANALYZE item is rejected when stem only asks identification despite ANALYZE indicator', () => {
  const { validateAssessmentScope } = require('../.tmp-tests/lib/validation.js');
  const plan = {
    resolvedModel: 'Project Based Learning', modelReason: '',
    objectives: [{ ref: 'TP1', objective: 'Menganalisis interaksi komponen biotik dan abiotik dalam ekosistem lokal.', competencyVerb: 'Menganalisis', contentFocus: 'interaksi komponen biotik abiotik ekosistem lokal', evidenceType: 'WRITTEN', criteriaFocus: '' }],
    assessmentBlueprint: [{ objectiveRef: 'TP1', primaryEvidenceType: 'WRITTEN', writtenAssessmentAllowed: true, instrumentHint: 'Tes' }],
    assessmentItems: [{ id: 'PG-1', questionType: 'PG', objectiveRef: 'TP1', role: 'PRIMARY', competency: 'ANALYZE', contentFocus: 'interaksi komponen biotik abiotik ekosistem lokal' }],
    activityBlueprint: [],
  };
  const result = validateAssessmentScope({
    objectives: plan.objectives.map((item) => item.objective), topic: 'Ekosistem', pedagogicalPlan: plan,
    questions: [{ id: 'PG-1', type: 'PG', question: 'Anggrek menempel pada pohon mangga. Pola interaksi yang terjadi adalah...', options: ['A','B','C','D'], correctAnswer: 'B', indicator: 'Menganalisis interaksi ekosistem.', objectiveMeasured: 'TP1', evidenceRole: 'PRIMARY', plannedCompetency: 'ANALYZE' }],
  });
  assert.equal(result.isAligned, false);
  assert.ok(result.issues.some((issue) => issue.includes('level kompetensi utama')));
});

test('primary item is rejected when question drifts from planned content focus even when indicator mentions the TP', () => {
  const { validateAssessmentScope } = require('../.tmp-tests/lib/validation.js');
  const plan = {
    resolvedModel: 'Project Based Learning', modelReason: '',
    objectives: [{ ref: 'TP1', objective: 'Menganalisis interaksi komponen biotik dan abiotik dalam ekosistem lokal.', competencyVerb: 'Menganalisis', contentFocus: 'interaksi komponen biotik abiotik ekosistem lokal', evidenceType: 'WRITTEN', criteriaFocus: '' }],
    assessmentBlueprint: [{ objectiveRef: 'TP1', primaryEvidenceType: 'WRITTEN', writtenAssessmentAllowed: true, instrumentHint: 'Tes' }],
    assessmentItems: [{ id: 'UR-1', questionType: 'Uraian', objectiveRef: 'TP1', role: 'PRIMARY', competency: 'ANALYZE', contentFocus: 'interaksi komponen biotik abiotik ekosistem lokal' }],
    activityBlueprint: [],
  };
  const result = validateAssessmentScope({
    objectives: plan.objectives.map((item) => item.objective), topic: 'Ekosistem', pedagogicalPlan: plan,
    questions: [{ id: 'UR-1', type: 'Uraian', question: 'Jelaskan bagaimana deforestasi dapat merusak daur karbon global dan memicu perubahan iklim!', correctAnswer: '...', indicator: 'Menganalisis dampak terhadap komponen abiotik ekosistem.', objectiveMeasured: 'TP1', evidenceRole: 'PRIMARY', plannedCompetency: 'ANALYZE' }],
  });
  assert.equal(result.isAligned, false);
  assert.ok(result.issues.some((issue) => issue.includes('bergeser dari fokus konten')));
});

test('evidence groups keep primary and supporting assessment evidence separate', () => {
  const { getObjectiveEvidenceGroups } = require('../.tmp-tests/lib/validation.js');
  const groups = getObjectiveEvidenceGroups({
    objectives: ['Mengonstruksi model jaring-jaring makanan dan piramida ekologi.'],
    questions: [{ id: 'PG-1', type: 'PG', question: 'Jika energi produsen 10.000 kJ, berapa energi pada konsumen tingkat II?', options: ['A','B','C','D'], correctAnswer: 'B', indicator: 'Menghitung transfer energi.', objectiveMeasured: 'TP1', evidenceRole: 'SUPPORTING', plannedCompetency: 'ANALYZE' }],
    successCriteria: [{ objective: 'TP1', criteria: 'Model akurat', assessmentEvidence: 'Produk infografis jaring-jaring makanan dan piramida ekologi.' }],
  });
  assert.deepEqual(groups.primary.get('TP1'), ['Produk infografis jaring-jaring makanan dan piramida ekologi.']);
  assert.deepEqual(groups.supporting.get('TP1'), ['PG-1']);
});


test('normalizes 10 percent terminology to a non-absolute transfer-energy phrasing', () => {
  const { normalizeGeneratedText } = require('../.tmp-tests/app/api/gemini/generate-rpp/text-quality.js');
  assert.equal(normalizeGeneratedText('Gunakan hukum 10% dalam piramida energi.'), 'Gunakan prinsip perpindahan energi sekitar 10% dalam piramida energi.');
  assert.equal(normalizeGeneratedText('Sesuai aturan 10 persen, energi berkurang.'), 'Sesuai prinsip perpindahan energi sekitar 10%, energi berkurang.');
});
