import { AlignmentType, HeadingLevel, Paragraph, TextRun } from 'docx';
import type { RPPData } from '../../types/rpp';
import { assessmentExecutionSummary } from '../assessment-execution-display';
import { DOCX_SPACING } from './docx-theme';

export function buildModuleAssessmentExecutionParagraphs(rpp: RPPData): Paragraph[] {
  const summary = assessmentExecutionSummary(rpp.assessment.executionPlan);
  if (!summary) return [];
  return [
    new Paragraph({ text: 'Soal yang Dikerjakan pada Pertemuan Ini', heading: HeadingLevel.HEADING_3, spacing: { before: 140, after: 60 } }),
    new Paragraph({ children: [
      new TextRun({ text: summary }),
      new TextRun({ text: ` Dari ${rpp.assessment.executionPlan?.availableMinutes || 0} menit waktu penutup, sekitar ${rpp.assessment.executionPlan?.reservedClosingMinutes || 0} menit digunakan untuk refleksi dan penutupan.`, italics: true }),
    ], alignment: AlignmentType.JUSTIFIED, spacing: DOCX_SPACING.body }),
  ];
}
