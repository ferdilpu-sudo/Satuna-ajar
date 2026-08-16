import type { RPPData } from '../../types/rpp';
import { formatPhase } from '../validation';
import { escapeHtml, list, safe, stripObjectivePrefix } from './format';

export function renderIdentity(rpp: RPPData): string {
  const i = rpp.identity;
  const isRingkas = rpp.documentFormat === 'Ringkas';
  const headerTitle = isRingkas ? 'A. IDENTITAS RPP' : 'A. IDENTITAS MODUL';
  const timeString = i.meetingCount > 1
    ? `${i.meetingCount} Pertemuan (${i.jpCount} JP × ${i.durationPerJP} menit = ${i.jpCount * i.durationPerJP} menit/pertemuan, Total = ${i.totalMinutes} menit)`
    : `${i.jpCount} JP × ${i.durationPerJP} menit = ${i.totalMinutes} menit`;

  return `<div class="section-header">${headerTitle}</div><table class="data-table">
<tr><td width="30%"><b>Nama Penyusun / Tahun</b></td><td>${safe(i.teacherName, 'Belum diisi')} / ${safe(i.academicYear, 'Belum diisi')}</td></tr>
<tr><td><b>Satuan Pendidikan</b></td><td>${safe(i.schoolName, 'Belum diisi')}</td></tr>
<tr><td><b>Mata Pelajaran</b></td><td>${safe(i.subject)}</td></tr>
<tr><td><b>Kelas / Fase / Semester</b></td><td>${safe(i.grade)} / ${escapeHtml(formatPhase(i.phase))} / Semester ${safe(i.semester)}</td></tr>
<tr><td><b>Elemen / Topik / Subtopik</b></td><td>${safe(i.element, 'Belum diisi')} / ${safe(i.topic)} / ${safe(i.subtopic)}</td></tr>
<tr><td><b>Alokasi Waktu</b></td><td>${timeString}</td></tr>
<tr><td><b>Capaian Pembelajaran (CP)</b></td><td>${safe(i.learningOutcomes)}</td></tr>
</table>`;
}

export function renderDimensions(rpp: RPPData): string {
  const rows = rpp.selectedDimensions.map((d) => `<tr><td><b>${safe(d.name)}</b></td><td><b>Alasan:</b> ${safe(d.reason)}<br/><b>Indikator:</b> ${safe(d.indicator)}</td><td>${safe(d.activity)}</td><td>${safe(d.evidence)}</td></tr>`).join('');
  return `<div class="section-header">B. DIMENSI PROFIL LULUSAN TERPILIH</div><table class="data-table"><thead><tr><th>Dimensi</th><th>Alasan & Indikator</th><th>Kegiatan</th><th>Bukti Belajar</th></tr></thead><tbody>${rows}</tbody></table>`;
}

export function renderFramework(rpp: RPPData): string {
  const model = rpp.learningSettings.resolvedModel || rpp.learningSettings.model;
  return `<div class="section-header">C. MODEL DAN METODE PEMBELAJARAN</div>
<p><b>Model Pembelajaran:</b> ${safe(model)}</p><p><b>Metode Pembelajaran:</b> ${safe(rpp.learningSettings.methods?.join(', '))}</p>
<p><b>Pendekatan:</b> Pembelajaran Mendalam (Deep Learning)</p><p><b>Alasan Pemilihan Model:</b> ${safe(rpp.learningSettings.modelRecommendationReason, 'Disesuaikan dengan karakteristik materi dan target kompetensi.')}</p>
<div class="section-header">D. MITRA & LINGKUNGAN PEMBELAJARAN</div><p><b>Mitra Pembelajaran:</b> ${safe(rpp.partnership, 'Tidak memerlukan mitra eksternal secara khusus.')}</p>
<p><b>Ruang Fisik:</b> ${safe(rpp.environment?.physicalSpace)}</p><p><b>Ruang Virtual:</b> ${safe(rpp.environment?.virtualSpace)}</p><p><b>Budaya Belajar:</b> ${safe(rpp.environment?.learningCulture)}</p>
<div class="section-header">E. PEMANFAATAN DIGITAL & SARANA PRASARANA</div><ul>${rpp.digitalUse?.map((d) => `<li><b>${safe(d.tool)}:</b> ${safe(d.purpose)}</li>`).join('') || '<li>Tanpa perangkat digital khusus.</li>'}</ul>
<p><b>Sarana & Prasarana:</b> ${safe(rpp.facilities?.tools?.join(', '))} | ${safe(rpp.facilities?.infrastructure?.join(', '))}</p><p><b>Sumber Belajar:</b> ${safe(rpp.facilities?.learningSources?.join(', '))}</p>`;
}

export function renderObjectives(rpp: RPPData): string {
  const isRingkas = rpp.documentFormat === 'Ringkas';
  const sectionTitle = isRingkas ? 'B. TUJUAN PEMBELAJARAN & KKTP' : 'F. TUJUAN PEMBELAJARAN & KRITERIA KETERCAPAIAN';
  
  const criteriaRows = (rpp.successCriteria?.length ? rpp.successCriteria : rpp.learningObjectives.map((_, idx) => ({
    objective: `TP${idx + 1}`,
    criteria: 'Belum dirancang',
    assessmentEvidence: 'Belum dirancang',
  }))).map((s) => `<tr><td><b>${safe(s.objective)}</b></td><td>${safe(s.criteria)}</td><td>${safe(s.assessmentEvidence)}</td></tr>`).join('');

  if (isRingkas) {
    return `<div class="section-header">${sectionTitle}</div>
<p><b>1. Tujuan Pembelajaran (TP):</b></p>
<ol>${list(rpp.learningObjectives.map(stripObjectivePrefix))}</ol>
<p><b>2. Kriteria Ketercapaian Tujuan Pembelajaran (KKTP):</b></p>
<table class="data-table"><thead><tr><th width="30%">Tujuan Pembelajaran (TP)</th><th width="45%">Kriteria Ketercapaian (KKTP)</th><th width="25%">Bukti Belajar / Asesmen</th></tr></thead><tbody>${criteriaRows}</tbody></table>`;
  }

  return `<div class="section-header">${sectionTitle}</div><ol>${list(rpp.learningObjectives.map(stripObjectivePrefix))}</ol>
<table class="data-table"><thead><tr><th width="30%">Tujuan Pembelajaran (TP)</th><th width="45%">Kriteria Ketercapaian (KKTP)</th><th width="25%">Bukti Belajar / Asesmen</th></tr></thead><tbody>${criteriaRows}</tbody></table>
<div class="section-header">G. PERTANYAAN PEMANTIK & MATERI ESENSIAL</div><p><b>Pertanyaan Pemantik:</b></p><ul>${list(rpp.triggerQuestions)}</ul><p><b>Konsep Inti:</b> ${safe(rpp.essentialMaterial?.coreConcept)}</p><p><b>Ringkasan:</b> ${safe(rpp.essentialMaterial?.summary)}</p>`;
}
