'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import StreamlineDuotoneIcon from '../icons/StreamlineDuotoneIcon';
import TrialUsageCard from './TrialUsageCard';
import type { LearningSettings, OutputConfig, SchoolIdentity, SelectedDimension } from '../../types/rpp';
import { formatPhase } from '../../lib/validation';

interface Props { output: OutputConfig; identity: SchoolIdentity; settings: LearningSettings; dimensions: SelectedDimension[]; errors: string[]; onOutputChange: (output: OutputConfig) => void; onBack: () => void; onGenerate: () => void; }
const SELECT = 'w-full rounded-xl border border-[#DDE3DC] bg-[#FBFCFA] p-2.5 text-sm text-slate-800 focus:border-blue-500 focus:bg-white';

export default function OutputStep({ output, identity, settings, dimensions, errors, onOutputChange, onBack, onGenerate }: Props) {
  const documentName = output.format === 'Ringkas' ? 'RPP' : 'Modul Ajar';
  const [trialExhausted, setTrialExhausted] = useState(false);
  const documentDetail = output.format === 'Ringkas' ? 'RPP Ringkas' : 'Modul Ajar Lengkap';
  return (
    <section className="space-y-6 rounded-2xl border border-[#DDE3DC] bg-white p-5 shadow-sm sm:p-6">
      <div><h2 className="text-lg font-extrabold text-slate-900">Output & Generate</h2><p className="mt-1 text-sm text-slate-500">Tinjau konfigurasi {documentName} dan data yang akan digunakan sebelum generasi.</p></div>
      {errors.length > 0 && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"><b>Generate belum dapat dilakukan:</b><ul className="mt-1 list-disc pl-5">{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">Jenis dokumen</p>
        <p className="mt-1 text-base font-extrabold text-slate-900">{documentDetail}</p>
        <p className="mt-1 text-xs text-slate-500">Jenis dokumen dipilih pada langkah pertama. Gunakan stepper jika ingin mengubah pilihan.</p>
      </div>
      <div className="grid gap-3 text-xs sm:grid-cols-2">
        <Select label="Soal Pilihan Ganda" value={String(output.pgCount)} options={['5','10','15','20']} onChange={(value) => onOutputChange({ ...output, pgCount: Number(value) })} />
        <Select label="Soal Uraian" value={String(output.essayCount)} options={['0','3','5','10']} onChange={(value) => onOutputChange({ ...output, essayCount: Number(value) })} />
      </div>
      {output.format === 'Lengkap' ? <div className="grid gap-2 text-xs sm:grid-cols-2">{[
        ['includeLKPD','Buat LKPD'],['includeRubrics','Buat Rubrik Lengkap'],['includeRemedialEnrichment','Remedial & Pengayaan'],['includeStudentReflection','Refleksi Peserta Didik'],['includeTeacherReflection','Refleksi Guru'],
      ].map(([key,label]) => <label key={key} className="flex min-h-11 items-center justify-between rounded-xl border border-[#E1E6E0] bg-[#FBFCFA] p-3 text-slate-700"><span className="font-semibold">{label}</span><input type="checkbox" className="accent-blue-600" checked={Boolean(output[key as keyof OutputConfig])} onChange={(e) => onOutputChange({ ...output, [key]: e.target.checked })} /></label>)}</div> : <div className="rounded-xl border border-[#E1E6E0] bg-[#FBFCFA] p-3 text-xs leading-5 text-slate-600"><b>RPP Ringkas</b> memakai schema inti: TP & KKTP, langkah pembelajaran, asesmen, dan pemetaan TP. Komponen modul seperti LKPD lengkap, rubrik DPL, refleksi terpisah, serta remedial/pengayaan hanya dibuat pada Modul Ajar.</div>}
      <TrialUsageCard onExhaustedChange={setTrialExhausted} />
      <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-xs">
        <h3 className="flex items-center gap-2 font-extrabold text-blue-800"><StreamlineDuotoneIcon name="document" className="h-4 w-4" />Data yang Akan Digunakan</h3>
        <div className="grid gap-2 sm:grid-cols-3"><Summary label="Penyusun / Sekolah" value={`${identity.teacherName || 'Belum diisi'} / ${identity.schoolName || 'Belum diisi'}`} /><Summary label="Mapel" value={identity.subject || 'Belum diisi'} /><Summary label="Kelas / Fase" value={`${identity.grade || '-'} / ${formatPhase(identity.phase)} (${identity.educationLevel || '-'})`} /><Summary label={`Topik / Elemen · ${identity.elementSource === 'file' ? 'Materi' : identity.elementSource === 'ai_draft' ? 'Draft AI' : 'Guru'}`} value={`${identity.topic || '-'} / ${identity.element || 'Belum diisi'}`} /><Summary label="Model" value={settings.model === 'Auto' ? 'Rekomendasi AI' : settings.model} /><Summary label="Dimensi" value={`${dimensions.length} dimensi terpilih`} /></div>
        <div className="rounded-xl border border-white bg-white/80 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">CP · {identity.cpSource === 'file' ? 'Dokumen' : identity.cpSource === 'ai_draft' ? 'Draft AI' : 'Manual'}</p><p className="mt-1 leading-5 text-slate-700">{identity.learningOutcomes || 'Belum diisi'}</p></div>
      </div>
      <div className="flex justify-between border-t border-[#E6EAE5] pt-4"><button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#DDE3DC] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Kembali</button><button type="button" disabled={errors.length > 0 || trialExhausted} onClick={onGenerate} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-700"><StreamlineDuotoneIcon name="magic" className="h-4 w-4" />{trialExhausted ? 'Trial Selesai' : `Generate ${documentName}`}</button></div>
    </section>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="block space-y-1.5"><span className="font-bold text-slate-700">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white bg-white/80 p-3"><span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span><span className="mt-1 block font-semibold leading-5 text-slate-700">{value}</span></div>; }
