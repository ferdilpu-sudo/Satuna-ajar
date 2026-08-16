'use client';

import { useState } from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import type { RPPData } from '../types/rpp';
import { exportRPPToDocx, printRPPToPDF } from '../lib/export';
import { getCombinedResearchSources } from '../lib/export/source-section';
import { formatPhase } from '../lib/validation';
import AssessmentRubricsSection from './rpp-detail/AssessmentRubricsSection';
import CompactAssessmentSection from './rpp-detail/CompactAssessmentSection';
import LearningActivitiesSection from './rpp-detail/LearningActivitiesSection';
import RPPDetailHeader from './rpp-detail/RPPDetailHeader';
import RPPOutline from './rpp-detail/RPPOutline';
import ResearchSourcesPanel from './rpp-detail/ResearchSourcesPanel';
import InlineRPPReviewEditor from './rpp-editor/InlineRPPReviewEditor';

interface Props { rppData: RPPData; onBack: () => void; onSave: (rpp: RPPData) => void; }

export default function RPPDetailView({ rppData, onBack, onSave }: Props) {
  const [currentRPP, setCurrentRPP] = useState(rppData);
  const [isSaved, setIsSaved] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSnapshot, setEditSnapshot] = useState<RPPData | null>(null);
  const isRingkas = currentRPP.documentFormat === 'Ringkas';

  const save = () => {
    onSave(currentRPP);
    setIsSaved(true);
    window.setTimeout(() => setIsSaved(false), 2500);
  };

  const startEditing = () => {
    setEditSnapshot(structuredClone(currentRPP));
    setIsEditing(true);
  };

  const saveEdits = () => {
    const updated = { ...currentRPP, updatedAt: new Date().toISOString() };
    setCurrentRPP(updated);
    onSave(updated);
    setEditSnapshot(null);
    setIsEditing(false);
    setIsSaved(true);
    window.setTimeout(() => setIsSaved(false), 2500);
  };

  const cancelEdits = () => {
    if (editSnapshot) setCurrentRPP(editSnapshot);
    setEditSnapshot(null);
    setIsEditing(false);
  };

  const updateDraft = (updated: RPPData) => {
    setCurrentRPP({ ...updated, updatedAt: new Date().toISOString() });
  };

  const regenerate = async (sectionKey: string) => {
    setRegeneratingSection(sectionKey);
    try {
      const response = await fetch('/api/gemini/regenerate-section', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sectionKey, fullRPP: currentRPP }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal meregenerasi bagian.');
      if (data.newSectionData) setCurrentRPP((previous) => ({ ...previous, [sectionKey]: data.newSectionData, updatedAt: new Date().toISOString(), status: 'Draft' }));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Gagal meregenerasi bagian RPP.');
    } finally {
      setRegeneratingSection(null);
    }
  };

  const { identity, selectedDimensions, learningSettings } = currentRPP;
  const title = isRingkas ? 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP)' : 'MODUL AJAR KURIKULUM MERDEKA';
  const subtitle = isRingkas ? 'KURIKULUM MERDEKA · PEMBELAJARAN MENDALAM (DEEP LEARNING)' : 'PENDEKATAN PEMBELAJARAN MENDALAM (DEEP LEARNING)';

  return (
    <div className="space-y-5 pb-12">
      <RPPDetailHeader rpp={currentRPP} isSaved={isSaved} isEditing={isEditing} onBack={onBack} onEdit={startEditing} onSave={save} onDoc={() => exportRPPToDocx(currentRPP)} onPrint={() => printRPPToPDF(currentRPP)} />

      {isEditing ? <InlineRPPReviewEditor rpp={currentRPP} onChange={updateDraft} onSave={saveEdits} onCancel={cancelEdits} /> : null}

      <div className="space-y-3 xl:hidden"><ResearchSourcesPanel rpp={currentRPP} /></div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_260px] 2xl:grid-cols-[180px_minmax(0,1fr)_280px]">
        <div className="hidden 2xl:block"><RPPOutline isRingkas={isRingkas} /></div>

        <main className="min-w-0">
          <article className="mx-auto max-w-[900px] space-y-8 rounded-2xl border border-[#D7DDD6] bg-white p-5 text-xs leading-relaxed text-slate-800 shadow-[0_12px_40px_rgba(40,55,45,0.08)] sm:p-8 sm:text-sm lg:p-10">
            <header className="border-b-2 border-slate-800 pb-5 text-center">
              <h1 className="text-xl font-black uppercase tracking-tight text-slate-950 sm:text-2xl">{title}</h1>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-blue-700 sm:text-sm">{subtitle}</p>
            </header>

            {currentRPP.sensitiveWarningNote && <div className="rounded-r-xl border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-900"><p className="font-bold">⚠️ Peringatan Regulasi / Peraturan Hukum</p><p className="mt-1 text-xs">{currentRPP.sensitiveWarningNote}</p></div>}

            <section id="rpp-identitas" className="scroll-mt-24 space-y-3">
              <SectionTitle>{isRingkas ? 'A. IDENTITAS RPP' : 'A. IDENTITAS MODUL'}</SectionTitle>
              <table className="w-full border-collapse text-xs"><tbody>{[
                ['Nama Penyusun / Tahun', `${identity.teacherName} / ${identity.academicYear}`],
                ['Satuan Pendidikan', identity.schoolName],
                ['Mata Pelajaran / Kelas / Fase', `${identity.subject} / ${identity.grade} / ${formatPhase(identity.phase)}`],
                ['Elemen / Topik / Subtopik', `${identity.element || 'Belum diisi'} / ${identity.topic} / ${identity.subtopic || '-'}`],
                ['Alokasi Waktu', identity.meetingCount > 1 ? `${identity.meetingCount} Pertemuan (${identity.jpCount} JP × ${identity.durationPerJP} menit = ${identity.jpCount * identity.durationPerJP} menit/pertemuan, Total = ${identity.totalMinutes} menit)` : `${identity.jpCount} JP × ${identity.durationPerJP} menit = ${identity.totalMinutes} menit`],
                ['Capaian Pembelajaran (CP)', identity.learningOutcomes],
              ].map(([label, value]) => <tr key={label} className="border border-slate-200"><td className="w-1/3 bg-slate-50 p-2.5 font-bold">{label}</td><td className="p-2.5">{value}</td></tr>)}</tbody></table>
              {identity.elementSource === 'ai_draft' ? <p className="italic text-amber-700">Elemen Draft AI — verifikasi sebelum dokumen digunakan.</p> : null}
              {identity.cpSource === 'ai_draft' ? <p className="italic text-amber-700">CP Draft AI — verifikasi dengan dokumen resmi sebelum digunakan.</p> : null}
            </section>

            {!isRingkas && (
              <>
                <section id="rpp-dimensi" className="scroll-mt-24 space-y-3">
                  <SectionTitle>B. DIMENSI PROFIL LULUSAN TERPILIH</SectionTitle>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="bg-slate-800 text-white">
                          <th className="p-2.5">Dimensi</th>
                          <th className="p-2.5">Alasan & Indikator</th>
                          <th className="p-2.5">Aktivitas</th>
                          <th className="p-2.5">Bukti</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDimensions.map((dimension) => (
                          <tr key={dimension.name} className="border-b border-slate-200">
                            <td className="p-2.5 font-bold">{dimension.name}</td>
                            <td className="p-2.5"><b>Alasan:</b> {dimension.reason}<br/><b>Indikator:</b> {dimension.indicator}</td>
                            <td className="p-2.5">{dimension.activity}</td>
                            <td className="p-2.5">{dimension.evidence}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section id="rpp-model" className="scroll-mt-24 space-y-2">
                  <SectionTitle>C. MODEL DAN METODE PEMBELAJARAN</SectionTitle>
                  <p><b>Model Pembelajaran:</b> {learningSettings.resolvedModel || learningSettings.model}</p>
                  <p><b>Metode Pembelajaran:</b> {learningSettings.methods.join(', ')}</p>
                  <p><b>Pendekatan:</b> Pembelajaran Mendalam (Deep Learning)</p>
                  <p className="rounded-lg bg-blue-50 p-2.5 text-blue-950"><b>Alasan Pemilihan Model:</b> {learningSettings.modelRecommendationReason || 'Disesuaikan dengan karakteristik materi dan target kompetensi.'}</p>
                </section>

                <section id="rpp-sarana" className="scroll-mt-24 space-y-2">
                  <SectionTitle>D. SARANA, PRASARANA & LINGKUNGAN BELAJAR</SectionTitle>
                  <p><b>Mitra Pembelajaran:</b> {currentRPP.partnership || 'Tidak memerlukan mitra eksternal secara khusus.'}</p>
                  <p><b>Ruang Fisik:</b> {currentRPP.environment?.physicalSpace || 'Ruang kelas berorientasi diskusi & kerja kelompok'}</p>
                  <p><b>Ruang Virtual / Perangkat Digital:</b> {currentRPP.environment?.virtualSpace || 'Platform pembelajaran digital pendukung'}</p>
                  <p><b>Budaya Belajar:</b> {currentRPP.environment?.learningCulture || 'Kolaboratif, bernalar kritis, dan berkesadaran'}</p>
                  {currentRPP.digitalUse?.length ? (
                    <div>
                      <p className="font-bold">Pemanfaatan Digital:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        {currentRPP.digitalUse.map((d, idx) => (
                          <li key={idx}><b>{d.tool}:</b> {d.purpose}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <p><b>Sarana & Prasarana:</b> {[...(currentRPP.facilities?.tools || []), ...(currentRPP.facilities?.infrastructure || [])].join(', ') || 'Alat tulis, papan tulis, media pembelajaran'}</p>
                </section>
              </>
            )}

            <section id="rpp-tujuan" className="scroll-mt-24 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <SectionTitle>{isRingkas ? 'B. TUJUAN PEMBELAJARAN & KKTP' : 'E. TUJUAN PEMBELAJARAN & KKTP'}</SectionTitle>
                <button type="button" onClick={() => regenerate('learningObjectives')} disabled={regeneratingSection === 'learningObjectives'} className="flex shrink-0 items-center gap-1 text-xs font-bold text-blue-700">
                  {regeneratingSection === 'learningObjectives' ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}Buat Ulang TP
                </button>
              </div>
              <ol className="list-decimal space-y-1 pl-5">{currentRPP.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}</ol>
              <CriteriaTable rpp={currentRPP} />
            </section>

            {!isRingkas && (
              <section id="rpp-materi" className="scroll-mt-24 space-y-2">
                <SectionTitle>F. PERTANYAAN PEMANTIK & MATERI ESENSIAL</SectionTitle>
                {currentRPP.triggerQuestions?.length ? (
                  <div>
                    <p className="font-bold">Pertanyaan Pemantik:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      {currentRPP.triggerQuestions.map((q, idx) => <li key={idx}>{q}</li>)}
                    </ul>
                  </div>
                ) : null}
                <p><b>Konsep Inti:</b> {currentRPP.essentialMaterial?.coreConcept}</p>
                <p><b>Ringkasan Materi Esensial:</b> {currentRPP.essentialMaterial?.summary}</p>
              </section>
            )}

            <div id="rpp-kegiatan" className="scroll-mt-24">
              <LearningActivitiesSection
                activities={currentRPP.activities}
                totalMinutes={identity.totalMinutes}
                regenerating={regeneratingSection === 'activities'}
                onRegenerate={() => regenerate('activities')}
                sectionTitle={isRingkas ? 'C. LANGKAH-LANGKAH PEMBELAJARAN MENDALAM' : 'G. LANGKAH-LANGKAH PEMBELAJARAN MENDALAM'}
              />
            </div>

            <div id="rpp-asesmen" className="scroll-mt-24">
              {isRingkas ? <CompactAssessmentSection rpp={currentRPP} /> : <AssessmentRubricsSection rpp={currentRPP} />}
            </div>

            {!isRingkas && currentRPP.studentWorksheet ? (
              <section id="rpp-lkpd" className="scroll-mt-24 space-y-3">
                <SectionTitle>L. LAMPIRAN LKPD</SectionTitle>
                <div className="rounded-xl border-2 border-blue-100 bg-slate-50 p-5">
                  <h3 className="text-center font-black text-slate-900 text-base">{currentRPP.studentWorksheet.title}</h3>
                  <p className="mt-2"><b>Tujuan:</b> {currentRPP.studentWorksheet.objectives.join('; ')}</p>
                  <p><b>Situasi Awal:</b> {currentRPP.studentWorksheet.stimulus}</p>
                  <p><b>Rumusan Masalah:</b> {currentRPP.studentWorksheet.problemFormulation}</p>
                  <p className="font-bold mt-2">Langkah Penyelidikan:</p>
                  <ol className="list-decimal pl-5 mb-3">{currentRPP.studentWorksheet.studySteps?.map((step, idx) => <li key={idx}>{step}</li>)}</ol>
                  <p className="font-bold">Tugas Penyelidikan:</p>
                  <ol className="list-decimal pl-5">{currentRPP.studentWorksheet.investigationTasks.map((task) => <li key={task} className="mb-3">{task}<div className="mt-1.5 border border-dashed border-slate-300 bg-white p-3 text-slate-400 italic">[Ruang Jawaban Peserta Didik]</div></li>)}</ol>
                  {currentRPP.studentWorksheet.conclusionPrompt && <p className="mt-2"><b>Pertanyaan Kesimpulan:</b> {currentRPP.studentWorksheet.conclusionPrompt}</p>}
                </div>
              </section>
            ) : null}

            <section id="rpp-sumber" className="scroll-mt-24 space-y-3">
              <SectionTitle>{isRingkas ? 'F. SUMBER MATERI & CATATAN GURU' : 'N. SUMBER MATERI & CATATAN GURU'}</SectionTitle>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3 text-xs text-slate-800">
                <p><b>Sumber Utama:</b> {currentRPP.sourcesUsed?.length ? currentRPP.sourcesUsed.join(', ') : 'Materi Teks Pengguna'}</p>
                
                {getCombinedResearchSources(currentRPP).length > 0 ? (
                  <div>
                    <p className="font-bold text-slate-900 mb-1.5">Sumber Riset Web:</p>
                    <ol className="list-decimal space-y-2 pl-5">
                      {getCombinedResearchSources(currentRPP).map((source, idx) => (
                        <li key={`${source.url}-${idx}`}>
                          <div className="font-bold text-slate-900">{source.title}</div>
                          {source.domain && <div className="text-[11px] text-slate-500">{source.domain}</div>}
                          <div>
                            <a href={source.url} target="_blank" rel="noreferrer" className="text-blue-700 underline hover:text-blue-800 font-mono text-[11px] break-all">
                              {source.url}
                            </a>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Tidak ada sumber web tambahan yang tersimpan.</p>
                )}

                {(currentRPP.facilities?.learningSources || []).filter((s) => !s.toLowerCase().includes('http://') && !s.toLowerCase().includes('https://') && !s.toLowerCase().includes('www.')).length > 0 && (
                  <div>
                    <p className="font-bold text-slate-900 mb-1">Sumber Belajar Lainnya:</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {currentRPP.facilities.learningSources
                        .filter((s) => !s.toLowerCase().includes('http://') && !s.toLowerCase().includes('https://') && !s.toLowerCase().includes('www.'))
                        .map((s, idx) => <li key={idx}>{s}</li>)}
                    </ul>
                  </div>
                )}

                <p className="border-t border-slate-200 pt-2.5 text-[11px] italic text-slate-500">
                  {getCombinedResearchSources(currentRPP).length > 0
                    ? 'Tautan riset web berasal dari grounding Google Search dan rujukan pembelajaran. Guru tetap perlu memverifikasi isi sebelum digunakan.'
                    : 'Dokumen ini dibuat di Satuna Ajar. Tinjau kembali isi sebelum digunakan dalam pembelajaran.'}
                </p>
              </div>
            </section>
          </article>
        </main>

        <div className="hidden space-y-3 xl:block"><ResearchSourcesPanel rpp={currentRPP} /></div>
      </div>
    </div>
  );
}

function CriteriaTable({ rpp }: { rpp: RPPData }) {
  const criteria = rpp.successCriteria?.length ? rpp.successCriteria : rpp.learningObjectives.map((_, index) => ({ objective: `TP${index + 1}`, criteria: 'Belum dirancang', assessmentEvidence: 'Belum dirancang' }));
  return <table className="w-full border-collapse text-xs [&_th]:border [&_th]:border-slate-300 [&_th]:bg-slate-800 [&_th]:p-2 [&_th]:text-white [&_td]:border [&_td]:border-slate-300 [&_td]:p-2"><thead><tr><th>TP</th><th>KKTP</th><th>Bukti / Asesmen</th></tr></thead><tbody>{criteria.map((item, index) => <tr key={`${item.objective}-${index}`}><td>{item.objective}</td><td>{item.criteria}</td><td>{item.assessmentEvidence}</td></tr>)}</tbody></table>;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 border-l-4 border-blue-600 bg-slate-100 px-3 py-1.5 font-bold text-slate-900">{children}</div>;
}
