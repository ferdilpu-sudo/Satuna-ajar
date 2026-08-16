import {
  AlignmentType,
  BorderStyle,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  VerticalAlignTable,
  WidthType,
} from 'docx';

export const DOCX_COLORS = {
  blue: '2563EB',
  dark: '1E293B',
  text: '1F2937',
  muted: '64748B',
  border: 'CBD5E1',
  soft: 'F8FAFC',
  softBlue: 'EFF6FF',
  paleBorder: 'E2E8F0',
  white: 'FFFFFF',
};

export const DOCX_CONTENT_WIDTH = 10000;

// Word uses twentieths of a point for paragraph spacing and 240 units for single line spacing.
export const DOCX_SPACING = {
  body: { after: 120, line: 276 }, // 6 pt after, 1.15 lines
  compact: { after: 60, line: 252 },
  cell: { after: 30, line: 246 },
  list: { after: 60, line: 276 },
  option: { after: 35, line: 276 },
} as const;

const border = { style: BorderStyle.SINGLE, size: 4, color: DOCX_COLORS.border };
const tableBorders = {
  top: border,
  bottom: border,
  left: border,
  right: border,
  insideHorizontal: border,
  insideVertical: border,
};

export const DOCX_STYLES = {
  default: {
    document: {
      run: { font: 'Arial', size: 21, color: DOCX_COLORS.text },
      paragraph: { spacing: DOCX_SPACING.body },
    },
  },
  paragraphStyles: [
    {
      id: 'Title', name: 'Title', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { font: 'Arial', size: 34, bold: true, color: '0F172A' },
      paragraph: { spacing: { before: 80, after: 80 }, alignment: AlignmentType.CENTER, outlineLevel: 0 },
    },
    {
      id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { font: 'Arial', size: 24, bold: true, color: '0F172A' },
      paragraph: {
        spacing: { before: 260, after: 120 }, outlineLevel: 1,
        shading: { fill: DOCX_COLORS.soft, type: ShadingType.CLEAR },
        border: { left: { style: BorderStyle.SINGLE, size: 22, color: DOCX_COLORS.blue, space: 5 } },
      },
    },
    {
      id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { font: 'Arial', size: 22, bold: true, color: '1E40AF' },
      paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 },
    },
  ],
};


export function buildContentCard(
  paragraphs: Paragraph[],
  options: { fill?: string; accent?: boolean } = {},
): Table {
  const cardBorder = { style: BorderStyle.SINGLE, size: 4, color: DOCX_COLORS.paleBorder };
  return new Table({
    width: { size: DOCX_CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths: [DOCX_CONTENT_WIDTH],
    layout: TableLayoutType.FIXED,
    borders: {
      top: cardBorder, bottom: cardBorder, left: cardBorder, right: cardBorder,
      insideHorizontal: cardBorder, insideVertical: cardBorder,
    },
    margins: { top: 120, bottom: 120, left: 150, right: 150 },
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: DOCX_CONTENT_WIDTH, type: WidthType.DXA },
        verticalAlign: VerticalAlignTable.TOP,
        shading: { fill: options.fill || DOCX_COLORS.soft, type: ShadingType.CLEAR },
        borders: options.accent ? { left: { style: BorderStyle.SINGLE, size: 14, color: DOCX_COLORS.blue } } : undefined,
        children: paragraphs.length ? paragraphs : [textParagraph('—')],
      })],
    })],
  });
}

export function titleDivider(): Paragraph {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: DOCX_COLORS.dark, space: 1 } },
    spacing: { after: 150 },
  });
}

interface CellOptions {
  bold?: boolean;
  header?: boolean;
  label?: boolean;
  width: number;
  alignment?: typeof AlignmentType[keyof typeof AlignmentType];
}

export function textParagraph(text: string, options: { bold?: boolean; italics?: boolean; color?: string; size?: number } = {}): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text || '—', font: 'Arial', size: options.size || 20, bold: options.bold, italics: options.italics, color: options.color || DOCX_COLORS.text })],
    spacing: DOCX_SPACING.compact,
  });
}

export function richCell(paragraphs: Paragraph[], options: CellOptions): TableCell {
  const fill = options.header ? DOCX_COLORS.dark : options.label ? DOCX_COLORS.soft : DOCX_COLORS.white;
  return new TableCell({
    width: { size: options.width, type: WidthType.DXA },
    verticalAlign: VerticalAlignTable.TOP,
    shading: { fill, type: ShadingType.CLEAR },
    children: paragraphs.length ? paragraphs : [textParagraph('—')],
  });
}

export function simpleCell(text: string, options: CellOptions): TableCell {
  const color = options.header ? DOCX_COLORS.white : DOCX_COLORS.text;
  return richCell([
    new Paragraph({
      alignment: options.alignment || AlignmentType.LEFT,
      children: [new TextRun({ text: text || '—', font: 'Arial', size: options.header ? 19 : 20, bold: options.bold || options.header, color })],
      spacing: DOCX_SPACING.cell,
    }),
  ], options);
}

export function tableRow(cells: TableCell[], header = false): TableRow {
  return new TableRow({ children: cells, tableHeader: header, cantSplit: true });
}

export function fixedTable(rows: TableRow[], columnWidths: number[]): Table {
  return new Table({
    width: { size: DOCX_CONTENT_WIDTH, type: WidthType.DXA },
    columnWidths,
    layout: TableLayoutType.FIXED,
    borders: tableBorders,
    margins: { top: 90, bottom: 90, left: 120, right: 120 },
    rows,
  });
}
