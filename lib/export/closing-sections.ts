import type { RPPData } from '../../types/rpp';
import { list, safe } from './format';

export function renderReflection(rpp: RPPData): string {
  return `<div class="section-header">K. REFLEKSI, REMEDIAL & PENGAYAAN</div><p><b>Refleksi Peserta Didik:</b></p><ul>${list(rpp.studentReflectionQuestions)}</ul><p><b>Refleksi Guru:</b></p><ul>${list(rpp.teacherReflectionQuestions)}</ul><p><b>Aktivitas Remedial:</b> ${safe(rpp.remedialActivities?.join('; '))}</p><p><b>Aktivitas Pengayaan:</b> ${safe(rpp.enrichmentActivities?.join('; '))}</p>`;
}

export function renderWorksheet(rpp: RPPData): string {
  const w = rpp.studentWorksheet;
  if (!w) return '';
  const tasks = w.investigationTasks?.map((task) => `<li>${safe(task)}<br/><br/><i>Jawaban: __________________________________________________</i></li>`).join('') || '';
  const guide = rpp.teacherAnswerGuide ? `<p style="margin-top:20px"><b>Panduan Jawaban Guru:</b></p><ul>${rpp.teacherAnswerGuide.expectedAnswers?.map((answer) => `<li><b>Jawaban yang Diharapkan:</b> ${safe(answer)}</li>`).join('')}${rpp.teacherAnswerGuide.misconceptionNotes?.map((note) => `<li><b>Catatan Miskonsepsi:</b> ${safe(note)}</li>`).join('')}</ul>` : '';
  return `<div class="section-header">L. LAMPIRAN: LEMBAR KERJA PESERTA DIDIK (LKPD)</div><div style="border:1px solid #cbd5e1;padding:15px;background:#fafafa"><h2 style="font-size:13pt;text-align:center">${safe(w.title)}</h2><p><b>Nama:</b> ____________________ &nbsp; <b>Kelas/Tanggal:</b> ____________________</p><p><b>A. Tujuan:</b></p><ul>${list(w.objectives)}</ul><p><b>B. Situasi Awal:</b> ${safe(w.stimulus)}</p><p><b>C. Rumusan Masalah:</b> ${safe(w.problemFormulation)}</p><p><b>D. Langkah Penyelidikan:</b></p><ol>${list(w.studySteps)}</ol><p><b>E. Tugas Penyelidikan & Solusi:</b></p><ol>${tasks}</ol><p><b>F. Kesimpulan:</b> ${safe(w.conclusionPrompt)}<br/><i>Jawaban: __________________________________________________</i></p></div>${guide}`;
}
