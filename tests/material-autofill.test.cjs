const assert = require('node:assert/strict');
const test = require('node:test');
const { buildMaterialAutofill } = require('../.tmp-tests/components/wizard/material-autofill.js');

const identity = {
  teacherName: 'Guru', schoolName: 'Sekolah', academicYear: '2026/2027', educationLevel: 'SMA/MA', subject: 'IPA',
  grade: 'Kelas X', phase: 'E', semester: 'Ganjil', element: '', topic: '', subtopic: '',
  jpCount: 3, durationPerJP: 45, meetingCount: 1, totalMinutes: 135, learningOutcomes: '', cpSource: 'manual',
};
const baseAnalysis = {
  title: 'Ekosistem', subtopics: ['Komponen Biotik dan Abiotik'], coreConcepts: [], prerequisiteConcepts: [],
  keyTerms: [], keyFacts: [], targetSkills: [], authenticContext: '', potentialProducts: [], potentialActivities: [], potentialAssessments: [],
};

test('autofills element, topic, subtopic and detected CP after material analysis', () => {
  const result = buildMaterialAutofill(identity, {
    ...baseAnalysis,
    detectedElement: 'Pemahaman IPA',
    generatedElement: 'Saran elemen AI',
    detectedCP: 'CP dari dokumen pengguna.',
    generatedCP: 'Draft CP AI.',
  });
  assert.equal(result.element, 'Pemahaman IPA');
  assert.equal(result.elementSource, 'file');
  assert.equal(result.topic, 'Ekosistem');
  assert.equal(result.subtopic, 'Komponen Biotik dan Abiotik');
  assert.equal(result.learningOutcomes, 'CP dari dokumen pengguna.');
  assert.equal(result.cpSource, 'file');
});

test('uses AI draft element and CP when source does not contain them', () => {
  const result = buildMaterialAutofill(identity, {
    ...baseAnalysis,
    generatedElement: 'Pemahaman IPA dan Keterampilan Proses',
    generatedCP: 'Peserta didik menganalisis interaksi ekosistem.',
  });
  assert.equal(result.element, 'Pemahaman IPA dan Keterampilan Proses');
  assert.equal(result.elementSource, 'ai_draft');
  assert.equal(result.learningOutcomes, 'Peserta didik menganalisis interaksi ekosistem.');
  assert.equal(result.cpSource, 'ai_draft');
});

test('preserves teacher-entered element, topic and CP', () => {
  const result = buildMaterialAutofill({
    ...identity,
    element: 'Elemen Manual',
    topic: 'Topik Manual',
    learningOutcomes: 'CP resmi yang diisi guru.',
    cpSource: 'manual',
  }, {
    ...baseAnalysis,
    detectedElement: 'Elemen File',
    generatedElement: 'Elemen AI',
    detectedCP: 'CP file',
    generatedCP: 'CP AI',
  });
  assert.equal(result.element, 'Elemen Manual');
  assert.equal(result.elementSource, 'manual');
  assert.equal(result.topic, 'Topik Manual');
  assert.equal(result.learningOutcomes, 'CP resmi yang diisi guru.');
  assert.equal(result.cpSource, 'manual');
});


test('autofill keeps full multi-subtopic text without export-style truncation', () => {
  const longSubtopics = [
    'Komponen Penyusun dan Tingkatan Organisasi Ekosistem',
    'Interaksi Antarkomponen, Rantai Makanan, dan Aliran Energi',
    'Daur Biogeokimia dan Keseimbangan Ekosistem',
    'Perubahan Ekosistem, Konservasi, dan Pembangunan Berkelanjutan',
  ];
  const result = buildMaterialAutofill(identity, { ...baseAnalysis, subtopics: longSubtopics });
  assert.equal(result.subtopic, longSubtopics.join('; '));
  assert.equal(result.subtopic.includes('...'), false);
});


test('autofill repairs legacy truncated subtopic values from older builds', () => {
  const analysis = {
    ...baseAnalysis,
    subtopics: ['Komponen Ekosistem', 'Aliran Energi', 'Daur Biogeokimia', 'Keseimbangan Ekosistem dan Dampak Aktivitas Manusia'],
  };
  const full = analysis.subtopics.join('; ');
  const truncated = `${full.slice(0, 80)}...`;
  const result = buildMaterialAutofill({ ...identity, subtopic: truncated }, analysis);
  assert.equal(result.subtopic, full);
});
