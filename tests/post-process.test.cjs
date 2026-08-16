const assert = require('node:assert/strict');
const test = require('node:test');
const { buildRPPData } = require('../.tmp-tests/app/api/gemini/generate-rpp/post-process.js');
const { renderSourceBox } = require('../.tmp-tests/lib/export/source-section.js');

const identity = {
  teacherName: '', schoolName: '', academicYear: '2026/2027', educationLevel: 'SMP/MTs', subject: 'IPS', grade: 'Kelas IX', phase: 'D', semester: 'Ganjil', element: '', topic: 'Lembaga Keuangan', subtopic: '', jpCount: 3, durationPerJP: 40, meetingCount: 1, totalMinutes: 120, learningOutcomes: 'Peserta didik menganalisis peran lembaga keuangan dalam perekonomian.', cpSource: 'manual',
};
const dimensions = ['Penalaran Kritis','Kolaborasi','Kreativitas'].map((name) => ({ name, reason: 'relevan', indicator: `indikator ${name}`, activity: 'aktivitas', evidence: 'bukti' }));
const materialAnalysis = { title: 'Lembaga Keuangan', subtopics: [], coreConcepts: [], prerequisiteConcepts: [], keyTerms: [], keyFacts: [], targetSkills: [], authenticContext: '', potentialProducts: ['Infografis'], potentialActivities: [], potentialAssessments: [], detectedGrade: 'Kelas IX', detectedLevel: 'SMP/MTs', detectedPhase: 'D' };
const parsed = {
  selectedDimensions: dimensions,
  modelAndMethods: { model: 'Problem Based Learning', methods: ['Diskusi'], academicReason: 'Masalah autentik' },
  partnership: '', environment: { physicalSpace: 'Kelas', virtualSpace: '', learningCulture: 'Kolaboratif' }, digitalUse: [], facilities: { tools: [], infrastructure: [], learningSources: [] },
  learningObjectives: ['Menganalisis fungsi bank.', 'Mengevaluasi risiko lembaga tidak resmi.', 'Membuat infografis edukasi.'],
  successCriteria: [
    { objective: 'TP1', criteria: 'Tepat', assessmentEvidence: 'Soal sumatif S1' },
    { objective: 'TP2', criteria: 'Tepat', assessmentEvidence: 'Soal sumatif S2' },
    { objective: 'TP3', criteria: 'Produk sesuai tujuan', assessmentEvidence: 'Produk infografis dinilai dengan Rubrik Produk' },
  ], triggerQuestions: [], essentialMaterial: { coreConcept: 'Lembaga Keuangan', subConcepts: [], keyTerms: [], summary: '' },
  activities: [
    { stage: 'PENDAHULUAN', syntaxOrPrinciple: 'Apersepsi', description: 'Memahami masalah awal.', experience: 'MEMAHAMI', deepLearningBadges: ['Berkesadaran','Bermakna'], timeMinutes: 20 },
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'Orientasi masalah dan penyelidikan', description: 'Peserta didik menyelidiki dan membuat infografis.', experience: 'MENGAPLIKASI', deepLearningBadges: ['Bermakna','Menggembirakan'], timeMinutes: 80 },
    { stage: 'PENUTUP', syntaxOrPrinciple: 'Evaluasi', description: 'Refleksi hasil.', experience: 'MEREFLEKSI', deepLearningBadges: ['Berkesadaran'], timeMinutes: 20 },
  ],
  assessment: { diagnosticNonCognitive: [], diagnosticCognitive: [], formative: [], summativeQuestions: [
    { id: 'S1', type: 'PG', question: 'Apa fungsi bank?', options: ['A','B'], correctAnswer: 'A', indicator: 'fungsi bank', objectiveMeasured: '' },
    { id: 'S2', type: 'PG', question: 'Apa risiko rentenir?', options: ['A','B'], correctAnswer: 'B', indicator: 'risiko', objectiveMeasured: '' },
    { id: 'S3', type: 'Uraian', question: 'Buat gagasan infografis edukasi.', correctAnswer: 'Rubrik', indicator: 'produk', objectiveMeasured: '' },
  ]},
  performanceRubric: [], graduateProfileRubric: [], productRubric: [], studentReflectionQuestions: ['Apa yang dipelajari?'], teacherReflectionQuestions: ['Apakah tujuan tercapai?'], remedialActivities: [], enrichmentActivities: [],
};

test('post-process resolves model, rubrics, reflections, assessment mapping and time', () => {
  const rpp = buildRPPData({ parsed, identity, settings: { model: 'Auto', methods: ['Diskusi'], partners: ['Tidak Ada'], digitalTools: [] }, materialAnalysis, selectedDimensions: dimensions, outputConfig: { format: 'Lengkap', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: true, includeRemedialEnrichment: true, includeStudentReflection: true, includeTeacherReflection: true }, sourceFiles: ['IPS-KLS-IX.pdf'] });
  assert.equal(rpp.learningSettings.model, 'Problem Based Learning');
  assert.equal(rpp.graduateProfileRubric.length, 3);
  assert.ok(rpp.productRubric.length >= 4);
  assert.ok(rpp.studentReflectionQuestions.length >= 5);
  assert.ok(rpp.teacherReflectionQuestions.length >= 5);
  assert.equal(rpp.assessment.summativeQuestions.some((q) => ['PG','Uraian'].includes(q.type) && q.objectiveMeasured === 'TP3'), false);
  assert.equal(rpp.assessment.summativeQuestions.some((q) => q.type === 'Produk' && q.objectiveMeasured === 'TP3'), true);
  assert.equal(rpp.status, 'Selesai');
  assert.equal(rpp.activities.reduce((sum, item) => sum + item.timeMinutes, 0), 120);
});


test('typed-only material is labeled as USER_INPUT, not USER_FILE', () => {
  const rpp = buildRPPData({ parsed, identity, settings: { model: 'Auto', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis, selectedDimensions: dimensions, outputConfig: { format: 'Lengkap', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: true, includeRemedialEnrichment: false, includeStudentReflection: true, includeTeacherReflection: true }, sourceFiles: ['Materi Teks Pengguna'] });
  assert.equal(rpp.sourceType, 'USER_INPUT');
});


test('AI draft CP no longer blocks generated document readiness', () => {
  const draftIdentity = { ...identity, cpSource: 'ai_draft' };
  const rpp = buildRPPData({ parsed, identity: draftIdentity, settings: { model: 'Auto', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis, selectedDimensions: dimensions, outputConfig: { format: 'Lengkap', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: true, includeRemedialEnrichment: false, includeStudentReflection: true, includeTeacherReflection: true }, sourceFiles: ['IPS-KLS-IX.pdf'] });
  assert.equal(rpp.identity.cpSource, 'ai_draft');
  assert.equal(rpp.status, 'Selesai');
});

test('normalizes experience labels and removes DPL names from Deep Learning badges', () => {
  const mixedParsed = structuredClone(parsed);
  mixedParsed.activities = [
    { stage: 'PENDAHULUAN', syntaxOrPrinciple: 'Apersepsi', description: 'Memahami masalah awal.', experience: 'Memahami (Conceptual Understanding)', deepLearningBadges: ['Mindful Learning', 'Penalaran Kritis', 'Bermakna'], timeMinutes: 20 },
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'Orientasi masalah penyelidikan', description: 'Peserta didik menyelidiki masalah.', experience: 'Mengaplikasi (Critical Thinking)', deepLearningBadges: ['Kolaborasi', 'Joyful'], timeMinutes: 80 },
    { stage: 'PENUTUP', syntaxOrPrinciple: 'Evaluasi', description: 'Refleksi hasil.', experience: 'Merefleksi (Deep Reflection)', deepLearningBadges: ['Berkesadaran'], timeMinutes: 20 },
  ];
  const rpp = buildRPPData({ parsed: mixedParsed, identity, settings: { model: 'Problem Based Learning', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis, selectedDimensions: dimensions, outputConfig: { format: 'Ringkas', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: false, includeRemedialEnrichment: false, includeStudentReflection: false, includeTeacherReflection: false }, sourceFiles: ['Materi Teks Pengguna'] });
  assert.deepEqual(rpp.activities.map((item) => item.experience), ['MEMAHAMI', 'MENGAPLIKASI', 'MEREFLEKSI']);
  assert.equal(rpp.activities.some((item) => item.deepLearningBadges.includes('Penalaran Kritis') || item.deepLearningBadges.includes('Kolaborasi')), false);
  assert.ok(rpp.activities[0].deepLearningBadges.includes('Berkesadaran'));
  assert.ok(rpp.activities[1].deepLearningBadges.includes('Menggembirakan'));
});

test('post-process no longer runs a blocking Quality Check pass', () => {
  const factualParsed = structuredClone(parsed);
  factualParsed.learningObjectives = ['Menganalisis peristiwa pada tahun 1953.', ...parsed.learningObjectives.slice(1)];
  const sourceWithout1953 = { ...materialAnalysis, keyFacts: ['Materi membahas lembaga keuangan tanpa tahun spesifik.'], rawTextContext: 'Materi membahas fungsi bank dan LKBB.' };
  const rpp = buildRPPData({ parsed: factualParsed, identity, settings: { model: 'Problem Based Learning', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis: sourceWithout1953, selectedDimensions: dimensions, outputConfig: { format: 'Ringkas', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: false, includeRemedialEnrichment: false, includeStudentReflection: false, includeTeacherReflection: false }, sourceFiles: ['Materi Teks Pengguna'] });
  assert.equal(rpp.status, 'Selesai');
  assert.equal(Object.prototype.hasOwnProperty.call(rpp, 'qualityCheck'), false);
});

test('removes duplicated TP prefixes and repairs malformed apersepsi label', () => {
  const current = structuredClone(parsed);
  current.learningObjectives = ['TP1: TP1: Menganalisis fungsi bank.', 'TP2: Mengevaluasi risiko lembaga tidak resmi.', 'TP3: Membuat infografis edukasi.'];
  current.activities = [
    { stage: 'PENDAHULUAN', syntaxOrPrinciple: 'Orientasi dan ApersDynamic', description: 'Apersepsi awal.', experience: 'MEMAHAMI', deepLearningBadges: ['Berkesadaran'], timeMinutes: 15 },
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'Orientasi Peserta Didik pada Masalah & Pengorganisasian', description: 'Masalah dan kelompok.', experience: 'MEMAHAMI', deepLearningBadges: ['Bermakna'], timeMinutes: 15 },
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'Penyelidikan Mandiri dan Kelompok', description: 'Menyelidiki.', experience: 'MENGAPLIKASI', deepLearningBadges: ['Bermakna'], timeMinutes: 25 },
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'Pengembangan dan Penyajian Hasil Karya', description: 'Membuat karya.', experience: 'MENGAPLIKASI', deepLearningBadges: ['Menggembirakan'], timeMinutes: 25 },
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'Menganalisis dan mengevaluasi proses pemecahan masalah', description: 'Evaluasi pemecahan masalah.', experience: 'MEREFLEKSI', deepLearningBadges: ['Berkesadaran'], timeMinutes: 20 },
    { stage: 'PENUTUP', syntaxOrPrinciple: 'Sintaks 5 PBL: Menganalisis dan Mengevaluasi Proses Pemecahan Masalah', description: 'Refleksi, asesmen, dan tindak lanjut.', experience: 'MEREFLEKSI', deepLearningBadges: ['Berkesadaran'], timeMinutes: 20 },
  ];
  current.assessment.formative = [{ technique: 'Observasi', instrument: 'Lembar Observasi Kinerja Kelaborasi', timing: 'Inti', purpose: 'Memantau proses.' }];
  const rpp = buildRPPData({ parsed: current, identity, settings: { model: 'Problem Based Learning', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis, selectedDimensions: dimensions, outputConfig: { format: 'Ringkas', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: true, includeRemedialEnrichment: false, includeStudentReflection: false, includeTeacherReflection: false }, sourceFiles: ['Materi Teks Pengguna'] });
  assert.equal(rpp.learningObjectives[0], 'Menganalisis fungsi bank.');
  assert.equal(rpp.activities[0].syntaxOrPrinciple, 'Orientasi dan Apersepsi');
  assert.match(rpp.activities[1].syntaxOrPrinciple, /Tahap 1–2 PBL/);
  assert.match(rpp.activities[4].syntaxOrPrinciple, /Tahap 5 PBL/);
  assert.equal(rpp.activities[5].syntaxOrPrinciple, 'Refleksi, Asesmen, dan Tindak Lanjut');
  assert.equal(rpp.assessment.formative[0].instrument, 'Lembar Observasi Kinerja Kolaborasi');
  assert.ok(rpp.activities.some((item) => /Apersepsi/i.test(item.syntaxOrPrinciple)));
});

test('product TP can be covered by product evidence instead of a forced essay mapping', () => {
  const current = structuredClone(parsed);
  current.learningObjectives = ['Menganalisis fungsi bank.', 'Mengevaluasi risiko lembaga tidak resmi.', 'Membuat infografis edukasi.'];
  current.successCriteria = [
    { objective: 'TP1', criteria: 'Tepat', assessmentEvidence: 'Soal sumatif Q1' },
    { objective: 'TP2', criteria: 'Tepat', assessmentEvidence: 'Soal sumatif Q2' },
    { objective: 'TP3', criteria: 'Produk sesuai tujuan', assessmentEvidence: 'Produk infografis dinilai dengan Rubrik Produk' },
  ];
  current.assessment.summativeQuestions = [
    { id: 'Q1', type: 'PG', question: 'Apa fungsi bank?', options: ['A','B'], correctAnswer: 'A', indicator: 'fungsi bank', objectiveMeasured: 'TP1' },
    { id: 'Q2', type: 'Uraian', question: 'Jelaskan risiko lembaga tidak resmi.', correctAnswer: 'Risiko', indicator: 'risiko lembaga tidak resmi', objectiveMeasured: 'TP2' },
  ];
  const rpp = buildRPPData({ parsed: current, identity, settings: { model: 'Problem Based Learning', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis, selectedDimensions: dimensions, outputConfig: { format: 'Ringkas', pgCount: 1, essayCount: 1, includeLKPD: false, includeRubrics: true, includeRemedialEnrichment: false, includeStudentReflection: false, includeTeacherReflection: false }, sourceFiles: ['Materi Teks Pengguna'] });
  assert.equal(rpp.assessment.summativeQuestions.some((question) => question.objectiveMeasured === 'TP3'), false);
  assert.equal(rpp.status, 'Selesai');
});


test('reassigns a clearly mismatched written question to the stronger TP', () => {
  const { repairObjectiveMappings } = require('../.tmp-tests/app/api/gemini/generate-rpp/assessment-mapping.js');
  const objectives = [
    'Menganalisis hak dan batasan kebebasan berpendapat berdasarkan regulasi.',
    'Memverifikasi kebenaran informasi digital melalui teknik fact-checking.',
    'Merancang dan mengaplikasikan panduan etika berdigital netiket dalam karya edukatif anti-hoaks.',
  ];
  const questions = [{
    id: 'Q8', type: 'Uraian',
    question: 'Bagaimana penerapan etika berdigital (netiket) yang baik saat menyampaikan kritik di media sosial?',
    correctAnswer: 'Gunakan netiket yang santun dan bertanggung jawab.',
    indicator: 'Menerapkan etika berdigital dalam menyampaikan pendapat di media sosial.',
    objectiveMeasured: 'TP1',
  }];
  const result = repairObjectiveMappings(questions, objectives);
  assert.equal(result[0].objectiveMeasured, 'TP3');
});

test('leaves ambiguous assessment mapping as UNMAPPED instead of forcing a TP', () => {
  const { repairObjectiveMappings } = require('../.tmp-tests/app/api/gemini/generate-rpp/assessment-mapping.js');
  const objectives = ['Menganalisis hak warga negara.', 'Memverifikasi informasi digital.'];
  const questions = [{ id: 'Q1', type: 'PG', question: 'Apa jawaban yang benar?', correctAnswer: 'A', indicator: 'Menjawab dengan tepat', objectiveMeasured: '' }];
  const result = repairObjectiveMappings(questions, objectives);
  assert.equal(result[0].objectiveMeasured, 'UNMAPPED');
});

test('preserves grounded web research sources in generated RPP data', () => {
  const researchedMaterial = {
    ...materialAnalysis,
    webSources: [{ title: 'Sumber Resmi', url: 'https://example.go.id/materi', domain: 'example.go.id' }],
    webSearchQueries: ['materi lembaga keuangan kelas IX'],
  };
  const rpp = buildRPPData({ parsed, identity, settings: { model: 'Auto', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis: researchedMaterial, selectedDimensions: dimensions, outputConfig: { format: 'Ringkas', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: true, includeRemedialEnrichment: false, includeStudentReflection: true, includeTeacherReflection: true }, sourceFiles: ['Materi Teks Pengguna'] });
  assert.equal(rpp.researchSources.length, 1);
  assert.equal(rpp.researchSources[0].url, 'https://example.go.id/materi');
  assert.deepEqual(rpp.webSearchQueries, ['materi lembaga keuangan kelas IX']);
});

test('pedagogical blueprint locks objectives even if final Gemini response drifts', () => {
  const pedagogicalPlan = {
    resolvedModel: 'Problem Based Learning', modelReason: 'Masalah autentik',
    objectives: [
      { ref: 'TP1', objective: 'Menganalisis fungsi lembaga keuangan dalam perekonomian.', competencyVerb: 'Menganalisis', contentFocus: 'lembaga keuangan', evidenceType: 'WRITTEN', criteriaFocus: 'fungsi' },
      { ref: 'TP2', objective: 'Mengevaluasi risiko penggunaan lembaga keuangan tidak resmi.', competencyVerb: 'Mengevaluasi', contentFocus: 'lembaga keuangan', evidenceType: 'WRITTEN', criteriaFocus: 'risiko' },
      { ref: 'TP3', objective: 'Merancang infografis edukasi lembaga keuangan.', competencyVerb: 'Merancang', contentFocus: 'lembaga keuangan', evidenceType: 'PRODUCT', criteriaFocus: 'produk' },
    ],
    assessmentBlueprint: [
      { objectiveRef: 'TP1', primaryEvidenceType: 'WRITTEN', writtenAssessmentAllowed: true, instrumentHint: 'Tes' },
      { objectiveRef: 'TP2', primaryEvidenceType: 'WRITTEN', writtenAssessmentAllowed: true, instrumentHint: 'Tes' },
      { objectiveRef: 'TP3', primaryEvidenceType: 'PRODUCT', writtenAssessmentAllowed: false, instrumentHint: 'Produk' },
    ],
    activityBlueprint: [],
  };
  const drifted = structuredClone(parsed);
  drifted.learningObjectives = ['Membahas hal lain.', 'Membahas hal lain lagi.', 'Membahas topik di luar materi.'];
  const rpp = buildRPPData({ parsed: drifted, identity, settings: { model: 'Auto', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis, selectedDimensions: dimensions, outputConfig: { format: 'Ringkas', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: false, includeRemedialEnrichment: false, includeStudentReflection: false, includeTeacherReflection: false }, sourceFiles: ['Materi Teks Pengguna'], pedagogicalPlan });
  assert.equal(rpp.learningObjectives[0], pedagogicalPlan.objectives[0].objective);
  assert.equal(rpp.learningObjectives[2], pedagogicalPlan.objectives[2].objective);
  assert.equal(rpp.learningSettings.model, 'Problem Based Learning');
});

test('researchSources only contains grounded metadata, not URLs invented in learning source suggestions', () => {
  const researchedMaterial = { ...materialAnalysis, webSources: [{ title: 'Sumber Grounded', url: 'https://official.example/source', domain: 'official.example' }] };
  const current = structuredClone(parsed);
  current.facilities.learningSources = ['Saran video https://invented.example/video'];
  const rpp = buildRPPData({ parsed: current, identity, settings: { model: 'Auto', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis: researchedMaterial, selectedDimensions: dimensions, outputConfig: { format: 'Ringkas', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: false, includeRemedialEnrichment: false, includeStudentReflection: false, includeTeacherReflection: false }, sourceFiles: ['Materi Teks Pengguna'] });
  assert.deepEqual(rpp.researchSources.map((source) => source.url), ['https://official.example/source']);
});

test('ringkas output drops module-only sections even if parsed payload contains them', () => {
  const rpp = buildRPPData({ parsed, identity, settings: { model: 'Auto', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis, selectedDimensions: dimensions, outputConfig: { format: 'Ringkas', pgCount: 2, essayCount: 1, includeLKPD: true, includeRubrics: true, includeRemedialEnrichment: true, includeStudentReflection: true, includeTeacherReflection: true }, sourceFiles: ['Materi Teks Pengguna'] });
  assert.equal(rpp.studentWorksheet, undefined);
  assert.deepEqual(rpp.remedialActivities, []);
  assert.deepEqual(rpp.studentReflectionQuestions, []);
  assert.deepEqual(rpp.graduateProfileRubric, []);
});

test('text quality normalizes common generated wording issues', () => {
  const { cleanGeneratedTextFields } = require('../.tmp-tests/app/api/gemini/generate-rpp/text-quality.js');
  const cleaned = cleanGeneratedTextFields({ text: 'Analisis limbah limbah domestik dilakukan secara obyektif melalui Youtube dan Whatsapp dengan ide original.' });
  assert.equal(cleaned.text, 'Analisis limbah domestik dilakukan secara objektif melalui YouTube dan WhatsApp dengan ide orisinal.');
});


test('RPP Ringkas preserves AI learning sources and removes invented URLs', () => {
  const current = structuredClone(parsed);
  current.facilities.learningSources = [
    'Buku teks IPS Kelas IX yang digunakan sekolah',
    'Lingkungan sekitar sekolah sebagai sumber pengamatan',
    'Video tambahan https://invented.example/video',
  ];
  const rpp = buildRPPData({ parsed: current, identity, settings: { model: 'Auto', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis, selectedDimensions: dimensions, outputConfig: { format: 'Ringkas', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: false, includeRemedialEnrichment: false, includeStudentReflection: false, includeTeacherReflection: false }, sourceFiles: ['Materi Teks Pengguna'] });
  assert.deepEqual(rpp.facilities.learningSources, [
    'Buku teks IPS Kelas IX yang digunakan sekolah',
    'Lingkungan sekitar sekolah sebagai sumber pengamatan',
  ]);
});

test('RPP Ringkas gets conservative learning-source fallbacks when AI returns none', () => {
  const current = structuredClone(parsed);
  current.facilities.learningSources = [];
  const rpp = buildRPPData({ parsed: current, identity, settings: { model: 'Auto', methods: ['Diskusi'], partners: [], digitalTools: [] }, materialAnalysis, selectedDimensions: dimensions, outputConfig: { format: 'Ringkas', pgCount: 2, essayCount: 1, includeLKPD: false, includeRubrics: false, includeRemedialEnrichment: false, includeStudentReflection: false, includeTeacherReflection: false }, sourceFiles: ['Materi Teks Pengguna'] });
  assert.deepEqual(rpp.facilities.learningSources, [
    'Buku teks IPS Kelas IX yang digunakan sekolah',
    'Materi pendukung guru yang relevan dengan topik Lembaga Keuangan',
  ]);
  assert.match(renderSourceBox(rpp), /Sumber Belajar Lainnya:/);
  assert.match(renderSourceBox(rpp), /Buku teks IPS Kelas IX yang digunakan sekolah/);
});
