import { HeadingLevel, Paragraph, TextRun } from 'docx';
import { DOCX_SPACING } from './docx-theme';
import type { RPPData } from '../../types/rpp';
import { getCompactDiagnostics } from '../assessment-display';

export function buildModuleDiagnosticParagraphs(rpp: RPPData): Paragraph[] {
  const diagnostics = getCompactDiagnostics(rpp, 4);
  if (!diagnostics.length) return [];
  return [
    new Paragraph({ text: 'Pertanyaan Awal (Diagnostik)', heading: HeadingLevel.HEADING_3, spacing: { before: 160, after: 80 } }),
    ...diagnostics.map((item, index) => new Paragraph({
      children: [
        new TextRun({ text: `${index + 1}. ${item.question}` }),
        ...(item.keyOrCriteria ? [new TextRun({ text: `\nJawaban yang Diharapkan: ${item.keyOrCriteria}`, italics: true })] : []),
      ],
      spacing: DOCX_SPACING.body,
    })),
  ];
}
