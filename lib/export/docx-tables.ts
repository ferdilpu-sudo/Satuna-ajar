import { Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';
import type { RPPData, RubricItem } from '../../types/rpp';
import { formatPhase } from '../validation';
import { getObjectiveEvidenceGroups } from '../validation/assessment';
import { activityStageLabel, stripObjectivePrefix } from './format';
import { fixedTable, richCell, simpleCell, tableRow, textParagraph, DOCX_COLORS, DOCX_CONTENT_WIDTH, DOCX_SPACING } from './docx-theme';

export function buildIdentityTable(rpp: RPPData): Table {
  const i = rpp.identity;
  const meetingCount = Math.max(1, i.meetingCount || 1);
  const meetingMinutes = i.jpCount * i.durationPerJP;
  const time = meetingCount > 1
    ? `${meetingCount} Pertemuan (${i.jpCount} JP × ${i.durationPerJP} menit = ${meetingMinutes} menit/pertemuan, Total = ${i.totalMinutes} menit)`
    : `${i.jpCount} JP × ${i.durationPerJP} menit = ${i.totalMinutes} menit`;
  const rows = [
    ['Nama Penyusun / Tahun', `${i.teacherName || 'Belum diisi'} / ${i.academicYear || 'Belum diisi'}`],
    ['Satuan Pendidikan', i.schoolName || 'Belum diisi'],
    ['Mata Pelajaran', i.subject || 'Belum diisi'],
    ['Kelas / Fase / Semester', `${i.grade} / ${formatPhase(i.phase)} / Semester ${i.semester}`],
    ['Elemen / Topik / Subtopik', `${i.element || 'Belum diisi'} / ${i.topic} / ${i.subtopic || 'Belum diisi'}`],
    ['Alokasi Waktu', time],
    ['Capaian Pembelajaran (CP)', i.learningOutcomes || 'Belum diisi'],
  ];
  return fixedTable(rows.map(([label, value]) => tableRow([
    simpleCell(label, { width: 3000, bold: true, label: true }),
    simpleCell(value, { width: 7000 }),
  ])), [3000, 7000]);
}

export function buildCriteriaTable(rpp: RPPData): Table {
  const items = rpp.successCriteria?.length ? rpp.successCriteria : rpp.learningObjectives.map((_, index) => ({
    objective: `TP${index + 1}`, criteria: 'Belum dirancang', assessmentEvidence: 'Belum dirancang',
  }));
  const widths = [1100, 5000, 3900];
  const rows = [
    tableRow(['TP', 'Kriteria Ketercapaian', 'Bukti / Asesmen'].map((text, index) => simpleCell(text, { width: widths[index], header: true })), true),
    ...items.map((item) => tableRow([
      simpleCell(item.objective, { width: widths[0], bold: true, label: true }),
      simpleCell(item.criteria, { width: widths[1] }),
      simpleCell(item.assessmentEvidence, { width: widths[2] }),
    ])),
  ];
  return fixedTable(rows, widths);
}

export function buildDimensionsTable(rpp: RPPData): Table {
  const widths = [2200, 7800];
  const rows: TableRow[] = [tableRow([
    simpleCell('Dimensi', { width: widths[0], header: true }),
    simpleCell('Cara Dikembangkan', { width: widths[1], header: true }),
  ], true)];
  (rpp.selectedDimensions || []).forEach((item) => rows.push(tableRow([
    simpleCell(item.name, { width: widths[0], bold: true, label: true }),
    richCell([
      labeled('Alasan', item.reason), labeled('Indikator', item.indicator),
      labeled('Kegiatan', item.activity), labeled('Bukti Belajar', item.evidence),
    ], { width: widths[1] }),
  ])));
  return fixedTable(rows, widths);
}

export function buildActivitiesTable(rpp: RPPData): Table {
  const widths = [2600, 7400];
  const rows: TableRow[] = [tableRow([
    simpleCell('Tahap, Waktu & Alur', { width: widths[0], header: true }),
    simpleCell('Deskripsi Kegiatan & Deep Learning', { width: widths[1], header: true }),
  ], true)];
  const meetings = Math.max(1, rpp.identity.meetingCount || 1);
  for (let meeting = 1; meeting <= meetings; meeting++) {
    const items = rpp.activities.filter((activity) => (activity.meetingNumber || 1) === meeting);
    if (!items.length) continue;
    if (meetings > 1) {
      const total = items.reduce((sum, item) => sum + item.timeMinutes, 0);
      rows.push(tableRow([new TableCell({ columnSpan: 2, width: { size: DOCX_CONTENT_WIDTH, type: WidthType.DXA }, shading: { fill: DOCX_COLORS.softBlue, type: ShadingType.CLEAR }, children: [textParagraph(`PERTEMUAN ${meeting} · ${total} Menit`, { bold: true, color: '1D4ED8' })] })]));
    }
    items.forEach((activity) => {
      const principles = (activity.deepLearningBadges || []).filter((badge) => ['Berkesadaran', 'Bermakna', 'Menggembirakan'].includes(badge)).join(', ') || '—';
      rows.push(tableRow([
        richCell([
          textParagraph(activityStageLabel(activity.stage), { bold: true }),
          textParagraph(`${activity.timeMinutes} menit`, { color: DOCX_COLORS.muted }),
          textParagraph(activity.syntaxOrPrinciple, { bold: true, color: '1D4ED8' }),
        ], { width: widths[0], label: true }),
        richCell([
          textParagraph(activity.description),
          labeled('Pengalaman', activity.experience),
          labeled('Prinsip', principles),
          ...(activity.scaffoldingNotes ? [labeled('Dukungan Guru', activity.scaffoldingNotes, true)] : []),
        ], { width: widths[1] }),
      ]));
    });
  }
  return fixedTable(rows, widths);
}

export function buildAssessmentPlanTable(rpp: RPPData): Table {
  const diagnostic = [...(rpp.assessment?.diagnosticNonCognitive || []), ...(rpp.assessment?.diagnosticCognitive || [])];
  const formative = rpp.assessment?.formative || [];
  const techniques = [...new Set(formative.map((item) => item.technique).filter(Boolean))].join(', ') || 'Belum dirancang';
  const instruments = [...new Set(formative.map((item) => item.instrument).filter(Boolean))].join(', ') || 'Belum tersedia';
  const pg = rpp.assessment.summativeQuestions.filter((q) => q.type === 'PG').length;
  const essay = rpp.assessment.summativeQuestions.filter((q) => q.type === 'Uraian').length;
  const evidence = rpp.successCriteria.map((item) => item.assessmentEvidence).join(' ');
  const authentic = /produk|karya|poster|infografis|portofolio|unjuk kerja|praktik|demonstrasi|presentasi/i.test(evidence);
  const rows = [
    ['Diagnostik', diagnostic.length ? 'Tanya jawab / kuis awal' : 'Belum dirancang', diagnostic.length ? `${diagnostic.length} pertanyaan diagnostik` : 'Belum tersedia'],
    ['Formatif', techniques, instruments],
    ['Sumatif', authentic ? 'Tes tertulis + penilaian produk/kinerja' : 'Tes tertulis', `${rpp.documentFormat === 'Lengkap' ? 'Kumpulan soal: ' : ''}${pg} pilihan ganda + ${essay} uraian${authentic ? ' + rubrik produk/kinerja' : ''}`],
  ];
  const widths = [1800, 3400, 4800];
  return fixedTable([
    tableRow(['Jenis Asesmen', 'Teknik', 'Instrumen / Bentuk'].map((text, i) => simpleCell(text, { width: widths[i], header: true })), true),
    ...rows.map((row) => tableRow(row.map((text, i) => simpleCell(text, { width: widths[i], label: i === 0, bold: i === 0 })))),
  ], widths);
}

export function buildRubricBlocks(title: string, rubrics?: RubricItem[]): Array<Paragraph | Table> {
  if (!rubrics?.length) return [];
  const widths = [2300, 7700];
  const blocks: Array<Paragraph | Table> = [new Paragraph({ children: [new TextRun({ text: title, bold: true, font: 'Arial', size: 22, color: '1E40AF' })], spacing: { before: 140, after: 70 } })];
  rubrics.forEach((item) => {
    const rows = [
      tableRow([simpleCell('Aspek & Indikator', { width: widths[0], header: true }), richCell([
        textParagraph(item.aspect, { bold: true, color: DOCX_COLORS.white, size: 19 }),
        textParagraph(item.indicator, { color: DOCX_COLORS.white, size: 18 }),
      ], { width: widths[1], header: true })], true),
      tableRow([simpleCell('Skor 1', { width: widths[0], bold: true, label: true }), simpleCell(item.levels.score1, { width: widths[1] })]),
      tableRow([simpleCell('Skor 2', { width: widths[0], bold: true, label: true }), simpleCell(item.levels.score2, { width: widths[1] })]),
      tableRow([simpleCell('Skor 3', { width: widths[0], bold: true, label: true }), simpleCell(item.levels.score3, { width: widths[1] })]),
      tableRow([simpleCell('Skor 4', { width: widths[0], bold: true, label: true }), simpleCell(item.levels.score4, { width: widths[1] })]),
    ];
    blocks.push(fixedTable(rows, widths));
    blocks.push(new Paragraph({ spacing: { after: 60 } }));
  });
  return blocks;
}

export function buildAssessmentMappingTable(rpp: RPPData): Table {
  const evidence = getObjectiveEvidenceGroups({ objectives: rpp.learningObjectives, questions: rpp.assessment.summativeQuestions, successCriteria: rpp.successCriteria, productRubric: rpp.productRubric, performanceRubric: rpp.performanceRubric });
  const widths = [1100, 4400, 4500];
  const rows: TableRow[] = [tableRow(['TP', 'Tujuan Pembelajaran', 'Soal / Bukti Asesmen'].map((text, i) => simpleCell(text, { width: widths[i], header: true })), true)];
  rpp.learningObjectives.forEach((objective, index) => {
    const ref = `TP${index + 1}`;
    rows.push(tableRow([
      simpleCell(ref, { width: widths[0], bold: true, label: true }),
      simpleCell(stripObjectivePrefix(objective), { width: widths[1] }),
      richCell([
        labeled('Bukti Utama', (evidence.primary.get(ref) || []).join('; ') || 'Belum terpetakan'),
        labeled('Bukti Pendukung', (evidence.supporting.get(ref) || []).join('; ') || '—'),
      ], { width: widths[2] }),
    ]));
  });
  return fixedTable(rows, widths);
}

function labeled(label: string, value: string, italics = false): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({ text: `${label}: `, bold: true, font: 'Arial', size: 20, color: DOCX_COLORS.text }),
      new TextRun({ text: value || '—', font: 'Arial', size: 20, color: DOCX_COLORS.text, italics }),
    ],
    spacing: DOCX_SPACING.compact,
  });
}
