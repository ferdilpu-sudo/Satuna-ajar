const assert = require('node:assert/strict');
const test = require('node:test');

const { inferEvidenceTypeFromObjective } = require('../.tmp-tests/lib/validation/pedagogy.js');
const { getObjectiveEvidenceGroups } = require('../.tmp-tests/lib/validation/assessment.js');
const { structureSuccessCriterionEvidence } = require('../.tmp-tests/lib/validation/evidence-structure.js');
const { assessModuleScope, moduleAuthenticObjectiveLimit, moduleObjectiveLimit } = require('../.tmp-tests/lib/validation/scope-feasibility.js');
const { buildAssessmentExecutionPlan } = require('../.tmp-tests/lib/validation/assessment-execution.js');
const { syncModuleAssessmentActivities } = require('../.tmp-tests/app/api/gemini/generate-rpp/assessment-activity-sync.js');

test('module scope budget caps short modules before generation', () => {
  assert.equal(moduleObjectiveLimit(135), 3);
  assert.equal(moduleAuthenticObjectiveLimit(135), 2);
  const objectives = [
    { ref: 'TP1', objective: 'Menganalisis interaksi ekosistem.', competencyVerb: 'Menganalisis', contentFocus: 'interaksi', evidenceType: 'WRITTEN', criteriaFocus: 'analisis' },
    { ref: 'TP2', objective: 'Mengonstruksi model jaring-jaring makanan.', competencyVerb: 'Mengonstruksi', contentFocus: 'energi', evidenceType: 'PRODUCT', criteriaFocus: 'model' },
    { ref: 'TP3', objective: 'Menganalisis daur nitrogen.', competencyVerb: 'Menganalisis', contentFocus: 'nitrogen', evidenceType: 'WRITTEN', criteriaFocus: 'analisis' },
    { ref: 'TP4', objective: 'Merancang solusi konservasi.', competencyVerb: 'Merancang', contentFocus: 'konservasi', evidenceType: 'PRODUCT', criteriaFocus: 'solusi' },
  ];
  const result = assessModuleScope(objectives, 135);
  assert.equal(result.feasible, false);
  assert.equal(result.maxObjectives, 3);
});

test('observation modality recognizes based-on-observation phrasing', () => {
  assert.equal(
    inferEvidenceTypeFromObjective('Menganalisis pola interaksi berdasarkan hasil observasi lingkungan.'),
    'OBSERVATION',
  );
  assert.equal(
    inferEvidenceTypeFromObjective('Mengidentifikasi komponen berdasarkan data pengamatan lapangan.'),
    'OBSERVATION',
  );
});

test('mixed authentic evidence is structurally split into primary and supporting evidence', () => {
  const criterion = structureSuccessCriterionEvidence({
    objective: 'TP2',
    criteria: 'Model akurat.',
    assessmentEvidence: 'Produk model jaring-jaring makanan/piramida energi dan jawaban tes pendukung (PG-2, UR-2).',
  }, 'PRODUCT');

  assert.deepEqual(criterion.primaryEvidence, ['Produk model jaring-jaring makanan/piramida energi']);
  assert.deepEqual(criterion.supportingEvidence, ['PG-2', 'UR-2']);
});

test('assessment mapping does not repeat supporting question refs inside primary evidence', () => {
  const groups = getObjectiveEvidenceGroups({
    objectives: ['Mengonstruksi model jaring-jaring makanan berdasarkan data lingkungan.'],
    questions: [
      { id: 'PG-2', type: 'PG', question: 'Produsen berada pada tingkat trofik...', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', indicator: 'Mengidentifikasi produsen.', objectiveMeasured: 'TP1', evidenceRole: 'SUPPORTING', plannedCompetency: 'UNDERSTAND' },
      { id: 'UR-2', type: 'Uraian', question: 'Jelaskan aliran energi.', correctAnswer: 'Energi mengalir.', indicator: 'Menjelaskan aliran energi.', objectiveMeasured: 'TP1', evidenceRole: 'SUPPORTING', plannedCompetency: 'UNDERSTAND' },
    ],
    successCriteria: [{
      objective: 'TP1', criteria: 'Model akurat.', assessmentEvidence: 'Produk model dan tes pendukung (PG-2, UR-2).',
      primaryEvidence: ['Produk model'], supportingEvidence: ['PG-2', 'UR-2'],
    }],
  });
  assert.deepEqual(groups.primary.get('TP1'), ['Produk model']);
  assert.deepEqual([...(groups.supporting.get('TP1') || [])].sort(), ['PG-2', 'UR-2']);
});

test('source export keeps the natural Sumber Belajar Lainnya heading', () => {
  const fs = require('node:fs');
  const sourceDocx = fs.readFileSync('lib/export/source-docx.ts', 'utf8');
  const sourceHtml = fs.readFileSync('lib/export/source-section.ts', 'utf8');
  assert.match(sourceDocx, /Sumber Belajar Lainnya:/);
  assert.match(sourceHtml, /Sumber Belajar Lainnya:/);
});

test('module DOCX prints diagnostic questions under the assessment plan', () => {
  const fs = require('node:fs');
  const exportSource = fs.readFileSync('lib/export/docx-export.ts', 'utf8');
  const diagnosticSource = fs.readFileSync('lib/export/module-diagnostics-docx.ts', 'utf8');
  assert.match(exportSource, /buildModuleDiagnosticParagraphs\(rpp\)/);
  assert.match(diagnosticSource, /getCompactDiagnostics\(rpp, 4\)/);
});


test('module assessment execution selects a realistic subset and keeps the full bank', () => {
  const questions = [
    { id: 'PG-1', type: 'PG', question: 'Q1', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP1', evidenceRole: 'SUPPORTING' },
    { id: 'PG-2', type: 'PG', question: 'Q2', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP2', evidenceRole: 'PRIMARY' },
    { id: 'PG-3', type: 'PG', question: 'Q3', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP3', evidenceRole: 'SUPPORTING' },
    { id: 'PG-4', type: 'PG', question: 'Q4', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP1', evidenceRole: 'SUPPORTING' },
    { id: 'PG-5', type: 'PG', question: 'Q5', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP2', evidenceRole: 'PRIMARY' },
    { id: 'UR-1', type: 'Uraian', question: 'U1', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP1', evidenceRole: 'SUPPORTING' },
    { id: 'UR-2', type: 'Uraian', question: 'U2', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP2', evidenceRole: 'PRIMARY' },
    { id: 'UR-3', type: 'Uraian', question: 'U3', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP3', evidenceRole: 'SUPPORTING' },
  ];
  const activities = [
    { stage: 'PENDAHULUAN', syntaxOrPrinciple: 'Apersepsi', description: 'Pembukaan.', experience: 'MEMAHAMI', timeMinutes: 15 },
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'PBL', description: 'Penyelidikan.', experience: 'MENGAPLIKASI', timeMinutes: 105 },
    { stage: 'PENUTUP', syntaxOrPrinciple: 'Evaluasi', description: 'Peserta didik mengerjakan tes sumatif dan refleksi.', experience: 'MEREFLEKSI', timeMinutes: 15 },
  ];
  const plan = buildAssessmentExecutionPlan(questions, activities);
  assert.equal(plan.availableMinutes, 15);
  assert.equal(plan.questionBudgetMinutes, 10);
  assert.equal(plan.estimatedQuestionMinutes <= plan.questionBudgetMinutes, true);
  assert.equal(plan.fullQuestionBankIds.length, 8);
  assert.equal(plan.selectedQuestionIds.length, 3);
  assert.equal(plan.selectedQuestionIds.filter((id) => id.startsWith('PG-')).length, 2);
  assert.equal(plan.selectedQuestionIds.filter((id) => id.startsWith('UR-')).length, 1);
  assert.equal(plan.feasible, true);
});

test('module activities explicitly schedule diagnostics and selected summative questions', () => {
  const activities = [
    { stage: 'PENDAHULUAN', syntaxOrPrinciple: 'Apersepsi', description: 'Guru membuka pembelajaran.', experience: 'MEMAHAMI', timeMinutes: 15 },
    { stage: 'PENUTUP', syntaxOrPrinciple: 'Evaluasi', description: 'Peserta didik mengerjakan tes sumatif dan refleksi.', experience: 'MEREFLEKSI', timeMinutes: 15 },
  ];
  const synced = syncModuleAssessmentActivities(activities, 4, {
    availableMinutes: 15, reservedClosingMinutes: 5, questionBudgetMinutes: 10, estimatedQuestionMinutes: 10,
    selectedQuestionIds: ['PG-1', 'PG-2', 'PG-3', 'UR-2'], fullQuestionBankIds: ['PG-1', 'PG-2', 'PG-3', 'PG-4', 'PG-5', 'UR-1', 'UR-2', 'UR-3'], feasible: true,
  });
  assert.match(synced[0].description, /memberikan 4 pertanyaan diagnostik singkat/i);
  assert.match(synced[1].description, /mengerjakan evaluasi singkat yang telah dipilih/i);
  assert.match(synced[1].description, /sekitar 10 menit/i);
  assert.match(synced[1].description, /latihan atau pertemuan berikutnya/i);
  assert.doesNotMatch(synced[1].description, /PG-1/);
});

test('assessment execution uses the actual closing duration even before the activity mentions summative assessment', () => {
  const questions = [
    { id: 'PG-1', type: 'PG', question: 'Q1', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP1', evidenceRole: 'PRIMARY' },
    { id: 'PG-2', type: 'PG', question: 'Q2', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP2', evidenceRole: 'PRIMARY' },
    { id: 'PG-3', type: 'PG', question: 'Q3', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP3', evidenceRole: 'PRIMARY' },
    { id: 'UR-1', type: 'Uraian', question: 'U1', correctAnswer: 'A', indicator: 'I', objectiveMeasured: 'TP1', evidenceRole: 'PRIMARY' },
  ];
  const activities = [
    { stage: 'PENDAHULUAN', syntaxOrPrinciple: 'Apersepsi', description: 'Pembukaan.', experience: 'MEMAHAMI', timeMinutes: 15 },
    { stage: 'KEGIATAN INTI', syntaxOrPrinciple: 'PjBL', description: 'Kegiatan proyek.', experience: 'MENGAPLIKASI', timeMinutes: 105 },
    { stage: 'PENUTUP', syntaxOrPrinciple: 'Refleksi', description: 'Refleksi dan umpan balik.', experience: 'MEREFLEKSI', timeMinutes: 15 },
  ];
  const plan = buildAssessmentExecutionPlan(questions, activities);
  assert.equal(plan.availableMinutes, 15);
  assert.equal(plan.reservedClosingMinutes, 5);
  assert.equal(plan.questionBudgetMinutes, 10);
});

test('module DOCX prints assessment execution plan before diagnostics', () => {
  const fs = require('node:fs');
  const exportSource = fs.readFileSync('lib/export/docx-export.ts', 'utf8');
  const executionSource = fs.readFileSync('lib/export/module-assessment-execution-docx.ts', 'utf8');
  assert.match(exportSource, /buildModuleAssessmentExecutionParagraphs\(rpp\)/);
  assert.match(executionSource, /Soal yang Dikerjakan pada Pertemuan Ini/);
});


test('proposal or action-plan evidence is recognized as the primary product for a design objective', () => {
  const criterion = structureSuccessCriterionEvidence({
    objective: 'TP3',
    criteria: 'Solusi sesuai masalah lokal.',
    assessmentEvidence: 'Draft proposal/rancangan aksi konservasi ekosistem lokal.',
  }, 'PRODUCT');
  const groups = getObjectiveEvidenceGroups({
    objectives: ['Merancang solusi untuk mengatasi masalah kerusakan lingkungan lokal berdasarkan prinsip ekologis.'],
    questions: [],
    successCriteria: [criterion],
  });
  assert.deepEqual(groups.primary.get('TP1'), ['Draft proposal/rancangan aksi konservasi ekosistem lokal']);
});

test('existing diagnostic sentence is rewritten with the count instead of duplicated', () => {
  const activities = [
    {
      stage: 'PENDAHULUAN', syntaxOrPrinciple: 'Persiapan',
      description: 'Guru membuka pembelajaran. Guru memberikan asesmen diagnostik kognitif singkat via Google Forms (5 menit) untuk mengukur prasyarat.',
      experience: 'MEMAHAMI', timeMinutes: 15,
    },
    { stage: 'PENUTUP', syntaxOrPrinciple: 'Refleksi', description: 'Refleksi.', experience: 'MEREFLEKSI', timeMinutes: 15 },
  ];
  const synced = syncModuleAssessmentActivities(activities, 4);
  assert.match(synced[0].description, /memberikan 4 pertanyaan diagnostik singkat melalui Google Forms/i);
  assert.equal((synced[0].description.match(/4 pertanyaan/gi) || []).length, 1);
  assert.doesNotMatch(synced[0].description, /mengawali pembelajaran dengan 4 pertanyaan/i);
});
