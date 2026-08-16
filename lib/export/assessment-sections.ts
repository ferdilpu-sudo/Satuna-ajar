import type { QuizQuestion, RPPData, RubricItem } from '../../types/rpp';
import { getObjectiveEvidenceGroups } from '../validation/assessment';
import { formatChoiceOptions, getCompactDiagnostics, getCompactFormativeChecklist } from '../assessment-display';
import { safe } from './format';
import { assessmentExecutionSummary } from '../assessment-execution-display';

function rubricTable(title: string, rubrics?: RubricItem[]): string {
  if (!rubrics?.length) return '';
  const rows = rubrics.map((r) => `<tr><td><b>${safe(r.aspect)}</b><br/>${safe(r.indicator)}</td><td>${safe(r.levels.score1)}</td><td>${safe(r.levels.score2)}</td><td>${safe(r.levels.score3)}</td><td>${safe(r.levels.score4)}</td></tr>`).join('');
  return `<p><b>${title}</b></p><table class="data-table"><thead><tr><th>Aspek & Indikator</th><th>Skor 1</th><th>Skor 2</th><th>Skor 3</th><th>Skor 4</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function questionItem(question: QuizQuestion): string {
  return `<li>${safe(question.question)}<br/>${question.options?.length ? `<span>${formatChoiceOptions(question.options).map((option) => safe(option)).join('<br/>')}</span><br/>` : ''}<b>Kunci:</b> ${safe(question.correctAnswer)}<br/><b>Indikator:</b> ${safe(question.indicator)}</li>`;
}

function assessmentMapping(rpp: RPPData): string {
  const evidence = getObjectiveEvidenceGroups({
    objectives: rpp.learningObjectives, questions: rpp.assessment.summativeQuestions, successCriteria: rpp.successCriteria,
    productRubric: rpp.productRubric, performanceRubric: rpp.performanceRubric,
  });
  const rows = rpp.learningObjectives.map((objective, index) => {
    const ref = `TP${index + 1}`;
    const primary = safe((evidence.primary.get(ref) || []).join('; '), 'Belum terpetakan');
    const supporting = safe((evidence.supporting.get(ref) || []).join('; '), '—');
    return `<tr><td>${ref}</td><td>${safe(objective)}</td><td><b>Bukti Utama:</b> ${primary}<br/><b>Bukti Pendukung:</b> ${supporting}</td></tr>`;
  }).join('');
  return `<p><b>Pemetaan Asesmen ke Tujuan Pembelajaran</b></p><table class="data-table"><thead><tr><th>TP</th><th>Tujuan Pembelajaran</th><th>Soal / Bukti Asesmen</th></tr></thead><tbody>${rows}</tbody></table>`;
}


function compactRingkasInstruments(rpp: RPPData): string {
  const diagnostic = getCompactDiagnostics(rpp, 4);
  const checklist = getCompactFormativeChecklist(rpp, 4);
  const diagnosticHtml = diagnostic.length
    ? `<p><b>Pertanyaan Awal Ringkas</b></p><ol>${diagnostic.map((item) => `<li>${safe(item.question)}${item.keyOrCriteria ? ` <i>(Kriteria: ${safe(item.keyOrCriteria)})</i>` : ''}</li>`).join('')}</ol>`
    : '';
  const checklistHtml = checklist.length
    ? `<p><b>Catatan Pengamatan Ringkas</b></p><ul>${checklist.map((item) => `<li>□ ${safe(item)}</li>`).join('')}</ul>`
    : '';
  return `${diagnosticHtml}${checklistHtml}`;
}

export function renderAssessmentPlanTable(rpp: RPPData): string {
  const diagnostic = [...(rpp.assessment?.diagnosticNonCognitive || []), ...(rpp.assessment?.diagnosticCognitive || [])];
  const diagnosticTopics = [...new Set(diagnostic.map((item) => item.aspectOrTopic).filter(Boolean))].join(', ');
  const formative = rpp.assessment?.formative || [];
  const formativeTechniques = [...new Set(formative.map((item) => item.technique).filter(Boolean))].join(', ');
  const formativeInstruments = [...new Set(formative.map((item) => item.instrument).filter(Boolean))].join(', ');
  const pgCount = rpp.assessment?.summativeQuestions?.filter((q) => q.type === 'PG').length || 0;
  const essayCount = rpp.assessment?.summativeQuestions?.filter((q) => q.type === 'Uraian').length || 0;
  const productTaskCount = rpp.assessment?.summativeQuestions?.filter((q) => q.type === 'Produk').length || 0;
  const performanceTaskCount = rpp.assessment?.summativeQuestions?.filter((q) => q.type === 'Kinerja').length || 0;
  const evidenceText = (rpp.successCriteria || []).map((item) => item.assessmentEvidence).join(' ');
  const hasProduct = productTaskCount > 0 || /produk|karya|poster|infografis|kartu|portofolio/i.test(evidenceText);
  const hasPerformance = performanceTaskCount > 0 || /unjuk kerja|praktik|demonstrasi|presentasi/i.test(evidenceText);
  const authenticTechnique = [hasPerformance ? 'unjuk kerja' : '', hasProduct ? 'penilaian produk' : ''].filter(Boolean).join(' + ');
  const sumTechnique = authenticTechnique ? `Tes tertulis + ${authenticTechnique}` : 'Tes tertulis / evaluasi hasil belajar';
  const sumInstrument = `${rpp.documentFormat === 'Lengkap' ? 'Kumpulan soal: ' : ''}${pgCount} soal pilihan ganda + ${essayCount} soal uraian${productTaskCount ? ` + ${productTaskCount} tugas produk` : hasProduct ? ' + bukti/rubrik produk' : ''}${performanceTaskCount ? ` + ${performanceTaskCount} tugas kinerja` : hasPerformance ? ' + rubrik kinerja' : ''}`;

  const executionSummary = rpp.documentFormat === 'Lengkap' ? assessmentExecutionSummary(rpp.assessment.executionPlan) : '';
  return `<table class="data-table"><thead><tr><th width="20%">Jenis Asesmen</th><th width="35%">Teknik</th><th width="45%">Instrumen / Bentuk</th></tr></thead><tbody>
<tr><td><b>Diagnostik</b></td><td>${diagnostic.length ? 'Tanya jawab / kuis awal' : 'Belum dirancang'}</td><td>${diagnostic.length ? `${diagnostic.length} pertanyaan${diagnosticTopics ? ` · ${safe(diagnosticTopics)}` : ''}` : 'Belum tersedia'}</td></tr>
<tr><td><b>Formatif</b></td><td>${safe(formativeTechniques, 'Belum dirancang')}</td><td>${safe(formativeInstruments, 'Belum tersedia')}</td></tr>
<tr><td><b>Sumatif</b></td><td>${safe(sumTechnique)}</td><td>${safe(sumInstrument)}</td></tr>
</tbody></table>${executionSummary ? `<p><b>Soal yang Dikerjakan pada Pertemuan Ini:</b> ${safe(executionSummary)}</p>` : ''}`;
}

export function renderAssessment(rpp: RPPData, includeQuestions = true): string {
  const planTable = renderAssessmentPlanTable(rpp);
  if (rpp.documentFormat === 'Ringkas') {
    let html = `<div class="section-header">D. RENCANA ASESMEN</div>${planTable}${compactRingkasInstruments(rpp)}`;
    if (includeQuestions && rpp.assessment?.summativeQuestions?.length) {
      const questions = rpp.assessment.summativeQuestions.map(questionItem).join('');
      html += `<div class="section-header">E. INSTRUMEN SUMATIF & PEMETAAN TP</div><p><b>Daftar Instrumen / Tugas Evaluasi:</b></p><ol>${questions}</ol>${assessmentMapping(rpp)}`;
    }
    return html;
  }

  const diagnostic = [...(rpp.assessment?.diagnosticNonCognitive || []), ...(rpp.assessment?.diagnosticCognitive || [])].map((d) => `<li><b>${safe(d.category)}:</b> ${safe(d.question)}${d.keyOrCriteria ? ` <i>(Kunci/Kriteria: ${safe(d.keyOrCriteria)})</i>` : ''}</li>`).join('');
  const formative = rpp.assessment?.formative?.map((f) => `<li><b>${safe(f.technique)}:</b> ${safe(f.instrument)} (${safe(f.timing)}) - ${safe(f.purpose)}</li>`).join('') || '';
  const questions = rpp.assessment?.summativeQuestions?.map(questionItem).join('') || '';
  return `<div class="section-header">I. ASESMEN PEMBELAJARAN</div><p><b>Perencanaan Asesmen:</b></p>${planTable}<p><b>1. Asesmen Diagnostik Detail</b></p><ul>${diagnostic}</ul><p><b>2. Asesmen Formatif Detail</b></p><ul>${formative}</ul><p><b>3. Instrumen Sumatif</b></p><ol>${questions}</ol>${assessmentMapping(rpp)}`;
}

export function renderRubrics(rpp: RPPData): string {
  return `<div class="section-header">J. RUBRIK PENILAIAN</div>${rubricTable('Rubrik Kinerja Keterampilan', rpp.performanceRubric)}${rubricTable('Rubrik Dimensi Profil Lulusan', rpp.graduateProfileRubric)}${rubricTable('Rubrik Produk', rpp.productRubric)}${rpp.productRubric?.length ? '<p><i>Nilai Produk = (Jumlah Skor / Skor Maksimal) × 100</i></p>' : ''}`;
}
