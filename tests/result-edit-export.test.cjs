const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const { prepareFinalExportRPP } = require('../.tmp-tests/lib/export/finalize.js');

const baseRpp = {
  id: 'rpp-1', createdAt: '2026-08-12', updatedAt: '2026-08-12', status: 'Draft', documentFormat: 'Ringkas',
  sensitiveWarningNote: 'Peringatan review internal',
  identity: {
    teacherName: 'Guru', schoolName: 'Sekolah', academicYear: '2026/2027', educationLevel: 'SMA/MA', subject: 'IPA', grade: 'Kelas X', phase: 'E', semester: 'Ganjil',
    element: 'Pemahaman IPA', elementSource: 'ai_draft', topic: 'Ekosistem', subtopic: 'Interaksi', jpCount: 3, durationPerJP: 45, meetingCount: 1, totalMinutes: 135,
    learningOutcomes: 'CP draft', cpSource: 'ai_draft', gradeAdaptationNote: 'Catatan adaptasi internal',
  },
  qualityCheck: { learningObjectivesAligned: true, assessmentAligned: true, graduateDimensionsRelevant: true, understandStagePresent: true, applyStagePresent: true, reflectStagePresent: true, mindfulPresent: true, meaningfulPresent: true, joyfulPresent: true, modelSyntaxValid: true, worksheetAligned: true, rubricAligned: true, timeAllocationValid: true, sourceGrounded: true, notes: ['CP perlu diverifikasi'], sensitiveWarningNote: 'Internal' },
};

test('final export copy removes review-only metadata without mutating stored draft', () => {
  const finalRpp = prepareFinalExportRPP(baseRpp);
  assert.equal(finalRpp.status, 'Selesai');
  assert.equal(finalRpp.sensitiveWarningNote, undefined);
  assert.equal(finalRpp.identity.elementSource, 'manual');
  assert.equal(finalRpp.identity.cpSource, 'manual');
  assert.equal(finalRpp.identity.gradeAdaptationNote, undefined);
  assert.equal(Object.prototype.hasOwnProperty.call(finalRpp, 'qualityCheck'), false);
  assert.equal(baseRpp.status, 'Draft');
  assert.equal(baseRpp.identity.cpSource, 'ai_draft');
});

test('DOCX and HTML export sources do not render review status or AI verification disclaimers', () => {
  const htmlExport = fs.readFileSync('lib/export.ts', 'utf8');
  const docxExport = fs.readFileSync('lib/export/docx-export.ts', 'utf8');
  const sourceDocx = fs.readFileSync('lib/export/source-docx.ts', 'utf8');
  const baseSections = fs.readFileSync('lib/export/base-sections.ts', 'utf8');
  const combined = [htmlExport, docxExport, sourceDocx, baseSections].join('\n');
  assert.doesNotMatch(combined, /STATUS: PERLU DITINJAU/);
  assert.doesNotMatch(combined, /Draft AI - Wajib diverifikasi Guru/);
  assert.doesNotMatch(combined, /perlu diverifikasi kembali oleh guru/i);
  assert.doesNotMatch(combined, /tetap perlu diverifikasi guru/i);
});

test('result detail uses the inline review editor instead of opening the modal', () => {
  const detail = fs.readFileSync('components/RPPDetailView.tsx', 'utf8');
  const header = fs.readFileSync('components/rpp-detail/RPPDetailHeader.tsx', 'utf8');
  assert.match(detail, /InlineRPPReviewEditor/);
  assert.match(detail, /startEditing/);
  assert.match(header, />Sunting</);
  assert.match(header, /Ekspor selalu berupa dokumen final/);
});
