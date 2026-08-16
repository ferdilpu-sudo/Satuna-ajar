import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TextRun,
} from 'docx';
import type { RPPData } from '../../types/rpp';
import { stripObjectivePrefix } from './format';
import { buildSourceParagraphs } from './source-docx';
import { buildCompactAssessmentParagraphs } from './compact-assessment-docx';
import { buildModuleDiagnosticParagraphs } from './module-diagnostics-docx';
import { buildModuleAssessmentExecutionParagraphs } from './module-assessment-execution-docx';
import { DOCX_SPACING, DOCX_STYLES, titleDivider } from './docx-theme';
import { buildQuestionCard } from './question-docx';
import {
  buildActivitiesTable,
  buildAssessmentMappingTable,
  buildAssessmentPlanTable,
  buildCriteriaTable,
  buildDimensionsTable,
  buildIdentityTable,
  buildRubricBlocks,
} from './docx-tables';

const heading = (text: string) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 260, after: 120 },
  keepNext: true,
});

const subheading = (text: string) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_3,
  spacing: { before: 150, after: 70 },
  keepNext: true,
});

function labelParagraph(label: string, value: string): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, font: 'Arial', size: 21 }),
      new TextRun({ text: value || '—', font: 'Arial', size: 21 }),
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: DOCX_SPACING.body,
  });
}

function buildSummativeBlocks(rpp: RPPData): Array<Paragraph | Table> {
  return (rpp.assessment?.summativeQuestions || []).flatMap((question, index) => buildQuestionCard(question, index));
}

function titleBlock(title: string, subtitle: string): Paragraph[] {
  return [
    new Paragraph({ text: title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 } }),
    new Paragraph({
      children: [new TextRun({ text: subtitle, bold: true, font: 'Arial', size: 20, color: '2563EB' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 90 },
    }),
    titleDivider(),
  ];
}

function buildRingkas(rpp: RPPData): Array<Paragraph | Table> {
  return [
    ...titleBlock('RENCANA PELAKSANAAN PEMBELAJARAN (RPP)', 'KURIKULUM MERDEKA · PEMBELAJARAN MENDALAM (DEEP LEARNING)'),
    heading('A. IDENTITAS RPP'), buildIdentityTable(rpp),
    heading('B. TUJUAN PEMBELAJARAN & KRITERIA KETERCAPAIAN'),
    ...(rpp.learningObjectives || []).map((objective, index) => labelParagraph(`TP${index + 1}`, stripObjectivePrefix(objective))),
    buildCriteriaTable(rpp),
    heading('C. LANGKAH-LANGKAH PEMBELAJARAN MENDALAM'), buildActivitiesTable(rpp),
    heading('D. RENCANA ASESMEN'), buildAssessmentPlanTable(rpp), ...buildCompactAssessmentParagraphs(rpp),
    heading('E. INSTRUMEN SUMATIF & PEMETAAN TP'), ...buildSummativeBlocks(rpp),
    subheading('Tabel Pemetaan Asesmen ke Tujuan Pembelajaran'), buildAssessmentMappingTable(rpp),
    heading('F. SUMBER MATERI'), ...buildSourceParagraphs(rpp),
  ];
}

function buildModule(rpp: RPPData): Array<Paragraph | Table> {
  return [
    ...titleBlock('MODUL AJAR KURIKULUM MERDEKA', 'PENDEKATAN PEMBELAJARAN MENDALAM (DEEP LEARNING)'),
    heading('A. IDENTITAS MODUL'), buildIdentityTable(rpp),
    heading('B. DIMENSI PROFIL LULUSAN TERPILIH'), buildDimensionsTable(rpp),
    heading('C. MODEL DAN METODE PEMBELAJARAN'),
    labelParagraph('Model Pembelajaran', rpp.learningSettings.resolvedModel || rpp.learningSettings.model),
    labelParagraph('Metode Pembelajaran', (rpp.learningSettings.methods || []).join(', ')),
    labelParagraph('Alasan Pemilihan Model', rpp.learningSettings.modelRecommendationReason || 'Disesuaikan dengan kompetensi.'),
    heading('D. SARANA, PRASARANA & LINGKUNGAN BELAJAR'),
    labelParagraph('Mitra Pembelajaran', rpp.partnership || 'Tidak memerlukan mitra eksternal secara khusus.'),
    labelParagraph('Ruang Fisik', rpp.environment?.physicalSpace || 'Ruang kelas berorientasi kerja kelompok.'),
    labelParagraph('Ruang Virtual / Perangkat Digital', rpp.environment?.virtualSpace || 'Platform pembelajaran digital.'),
    heading('E. TUJUAN PEMBELAJARAN & KKTP'),
    ...(rpp.learningObjectives || []).map((objective, index) => labelParagraph(`TP${index + 1}`, stripObjectivePrefix(objective))),
    buildCriteriaTable(rpp),
    heading('F. PERTANYAAN PEMANTIK & MATERI ESENSIAL'), subheading('Pertanyaan Pemantik'),
    ...(rpp.triggerQuestions || []).map((q) => new Paragraph({ text: `• ${q}`, spacing: DOCX_SPACING.list })),
    labelParagraph('Konsep Inti', rpp.essentialMaterial?.coreConcept || ''),
    labelParagraph('Ringkasan Materi Esensial', rpp.essentialMaterial?.summary || ''),
    heading('G. LANGKAH-LANGKAH PEMBELAJARAN MENDALAM'), buildActivitiesTable(rpp),
    heading('H. RENCANA ASESMEN'), buildAssessmentPlanTable(rpp), ...buildModuleAssessmentExecutionParagraphs(rpp), ...buildModuleDiagnosticParagraphs(rpp),
    heading('I. RUBRIK PENILAIAN'),
    ...buildRubricBlocks('Rubrik Kinerja Keterampilan', rpp.performanceRubric),
    ...buildRubricBlocks('Rubrik Dimensi Profil Lulusan', rpp.graduateProfileRubric),
    ...buildRubricBlocks('Rubrik Produk Karya', rpp.productRubric),
    heading('J. REFLEKSI PESERTA DIDIK & GURU'), subheading('Refleksi Peserta Didik'),
    ...(rpp.studentReflectionQuestions || []).map((q) => new Paragraph({ text: `• ${q}`, spacing: DOCX_SPACING.list })),
    subheading('Refleksi Guru'), ...(rpp.teacherReflectionQuestions || []).map((q) => new Paragraph({ text: `• ${q}`, spacing: DOCX_SPACING.list })),
    heading('K. PROGRAM REMEDIAL & PENGAYAAN'),
    labelParagraph('Program Remedial', (rpp.remedialActivities || []).join('; ') || 'Bimbingan perorangan.'),
    labelParagraph('Program Pengayaan', (rpp.enrichmentActivities || []).join('; ') || 'Pendalaman materi.'),
    ...buildWorksheet(rpp),
    heading('M. SOAL SUMATIF, KUNCI JAWABAN & PEMETAAN TP'), ...buildSummativeBlocks(rpp),
    subheading('Tabel Pemetaan Asesmen ke Tujuan Pembelajaran'), buildAssessmentMappingTable(rpp),
    heading('N. SUMBER MATERI'), ...buildSourceParagraphs(rpp),
  ];
}

function buildWorksheet(rpp: RPPData): Paragraph[] {
  const w = rpp.studentWorksheet;
  if (!w) return [heading('L. LAMPIRAN LKPD'), new Paragraph({ text: 'LKPD dapat dicetak atau disusun terpisah sesuai kebutuhan.', spacing: DOCX_SPACING.body })];
  return [
    heading('L. LAMPIRAN LKPD'), subheading(w.title || 'Lembar Kerja Peserta Didik'),
    labelParagraph('Tujuan', (w.objectives || []).join('; ')), labelParagraph('Situasi Awal', w.stimulus || ''), labelParagraph('Rumusan Masalah', w.problemFormulation || ''),
    ...(w.investigationTasks || []).flatMap((task, index) => [
      new Paragraph({ children: [new TextRun({ text: `${index + 1}. ${task}`, font: 'Arial', size: 21 })], spacing: { before: 70, after: 60, line: 276 } }),
      new Paragraph({ children: [new TextRun({ text: '[Ruang Jawaban Peserta Didik]', italics: true, color: '64748B', font: 'Arial', size: 19 })], spacing: { after: 100, line: 252 } }),
    ]),
  ];
}

export async function generateDocxBlob(rpp: RPPData): Promise<Blob> {
  const children = rpp.documentFormat === 'Ringkas' ? buildRingkas(rpp) : buildModule(rpp);
  const doc = new Document({
    styles: DOCX_STYLES,
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 900, right: 850, bottom: 900, left: 850, header: 450, footer: 450 },
        },
      },
      children,
    }],
  });
  return Packer.toBlob(doc);
}
