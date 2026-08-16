import { AlignmentType, ExternalHyperlink, Paragraph, Table, TextRun } from 'docx';
import type { RPPData } from '../../types/rpp';
import { getCombinedResearchSources } from './source-section';
import { buildContentCard, DOCX_COLORS, DOCX_SPACING } from './docx-theme';

export function buildSourceParagraphs(rpp: RPPData): Array<Paragraph | Table> {
  const paragraphs: Paragraph[] = [
    new Paragraph({
      children: [
        new TextRun({ text: 'Sumber Utama: ', bold: true, color: '1E40AF' }),
        new TextRun({ text: rpp.sourcesUsed?.join(', ') || 'Materi Teks Pengguna' }),
      ],
      alignment: AlignmentType.JUSTIFIED,
      spacing: DOCX_SPACING.body,
    }),
  ];

  const combinedSources = getCombinedResearchSources(rpp);
  if (combinedSources.length) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: 'Sumber Riset Web:', bold: true, color: '1E40AF' })],
      spacing: { before: 110, after: 70 },
    }));

    combinedSources.forEach((source, index) => {
      const children: Array<TextRun | ExternalHyperlink> = [
        new TextRun({ text: `${index + 1}. ${source.title}`, bold: true }),
      ];
      if (source.domain) children.push(new TextRun({ text: `\n${source.domain}`, color: DOCX_COLORS.muted, size: 18 }));
      children.push(new TextRun({ text: '\n' }));
      children.push(new ExternalHyperlink({
        link: source.url,
        children: [new TextRun({ text: source.url, color: '1D4ED8', underline: {}, size: 19 })],
      }));
      paragraphs.push(new Paragraph({ children, spacing: DOCX_SPACING.body }));
    });
  }

  const learningSources = (rpp.facilities?.learningSources || []).filter(
    (source) => !/https?:\/\/|www\./i.test(source),
  );
  if (learningSources.length) {
    paragraphs.push(new Paragraph({
      children: [new TextRun({ text: 'Sumber Belajar Lainnya:', bold: true, color: '1E40AF' })],
      spacing: { before: 110, after: 70 },
    }));
    learningSources.forEach((source) => paragraphs.push(new Paragraph({
      children: [new TextRun({ text: `• ${source}` })],
      spacing: DOCX_SPACING.list,
    })));
  }

  return [buildContentCard(paragraphs, { fill: DOCX_COLORS.soft })];
}
