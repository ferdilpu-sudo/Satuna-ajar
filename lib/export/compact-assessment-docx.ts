import { Paragraph, Table, TextRun } from 'docx';
import { buildContentCard, DOCX_COLORS, DOCX_SPACING } from './docx-theme';
import type { RPPData } from '../../types/rpp';
import { getCompactDiagnostics, getCompactFormativeChecklist } from '../assessment-display';

function cardHeading(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, color: '1E40AF', font: 'Arial', size: 20 })],
    spacing: { after: 70 },
  });
}

export function buildCompactAssessmentParagraphs(rpp: RPPData): Array<Paragraph | Table> {
  const diagnostics = getCompactDiagnostics(rpp, 4);
  const checklist = getCompactFormativeChecklist(rpp, 4);
  const blocks: Array<Paragraph | Table> = [];

  if (diagnostics.length) {
    const content: Paragraph[] = [cardHeading('Pertanyaan Awal Ringkas')];
    diagnostics.forEach((item, index) => content.push(new Paragraph({
      children: [
        new TextRun({ text: `${index + 1}. ${item.question}`, font: 'Arial', size: 20, color: DOCX_COLORS.text }),
        ...(item.keyOrCriteria ? [new TextRun({ text: ` — Kriteria: ${item.keyOrCriteria}`, font: 'Arial', size: 19, color: DOCX_COLORS.muted })] : []),
      ],
      spacing: DOCX_SPACING.list,
    })));
    blocks.push(buildContentCard(content, { fill: DOCX_COLORS.white }));
    blocks.push(new Paragraph({ spacing: { after: 70 } }));
  }

  if (checklist.length) {
    const content: Paragraph[] = [cardHeading('Checklist Formatif Ringkas')];
    checklist.forEach((item) => content.push(new Paragraph({
      children: [new TextRun({ text: `☐ ${item}`, font: 'Arial', size: 20, color: DOCX_COLORS.text })],
      spacing: DOCX_SPACING.list,
    })));
    blocks.push(buildContentCard(content, { fill: DOCX_COLORS.white }));
    blocks.push(new Paragraph({ spacing: { after: 70 } }));
  }

  return blocks;
}
