import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  ShadingType,
  Table,
  TextRun,
} from 'docx';
import type { QuizQuestion } from '../../types/rpp';
import { formatChoiceOptions } from '../assessment-display';
import { buildContentCard, DOCX_COLORS, DOCX_SPACING } from './docx-theme';

export function buildQuestionCard(question: QuizQuestion, index: number): Array<Paragraph | Table> {
  const content: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: `Soal ${index + 1}`, bold: true, font: 'Arial', size: 21, color: '1D4ED8' })],
      spacing: { after: 70 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 5, color: 'DBEAFE', space: 4 } },
      keepNext: true,
    }),
    new Paragraph({
      children: [new TextRun({ text: question.question, font: 'Arial', size: 21, color: DOCX_COLORS.text })],
      alignment: AlignmentType.LEFT,
      spacing: DOCX_SPACING.body,
      keepNext: Boolean(question.options?.length),
    }),
  ];

  formatChoiceOptions(question.options).forEach((option) => content.push(new Paragraph({
    children: [new TextRun({ text: option, font: 'Arial', size: 20, color: DOCX_COLORS.text })],
    indent: { left: 260 },
    spacing: DOCX_SPACING.option,
  })));

  content.push(
    new Paragraph({
      children: [
        new TextRun({ text: 'Jawaban Benar / Kriteria: ', bold: true, font: 'Arial', size: 20, color: '1E40AF' }),
        new TextRun({ text: question.correctAnswer || '—', font: 'Arial', size: 20, color: DOCX_COLORS.text }),
      ],
      shading: { fill: DOCX_COLORS.softBlue, type: ShadingType.CLEAR },
      border: { left: { style: BorderStyle.SINGLE, size: 12, color: DOCX_COLORS.blue, space: 5 } },
      spacing: { before: 65, after: 65, line: 252 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Indikator: ', bold: true, font: 'Arial', size: 19, color: DOCX_COLORS.muted }),
        new TextRun({ text: question.indicator || '—', font: 'Arial', size: 19, color: DOCX_COLORS.muted }),
      ],
      spacing: { before: 45, after: 25, line: 252 },
    }),
  );

  return [
    buildContentCard(content, { fill: DOCX_COLORS.soft, accent: true }),
    new Paragraph({ spacing: { after: 90 } }),
  ];
}
