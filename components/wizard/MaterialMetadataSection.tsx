'use client';

import type { SchoolIdentity } from '../../types/rpp';

interface Props {
  subject: string;
  element: string;
  elementSource: NonNullable<SchoolIdentity['elementSource']>;
  topic: string;
  subtopic: string;
  analyzed: boolean;
  onElementChange: (value: string) => void;
  onVerifyElement: () => void;
  onTopicChange: (value: string) => void;
  onSubtopicChange: (value: string) => void;
}

const INPUT_CLASS = 'w-full rounded-xl border border-[#DDE3DC] bg-[#FBFCFA] p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white';

export default function MaterialMetadataSection(props: Props) {
  const elementSourceLabel = props.elementSource === 'file' ? 'Terdeteksi dari materi' : props.elementSource === 'ai_draft' ? 'Draft AI' : 'Input guru';
  const elementSourceClass = props.elementSource === 'ai_draft'
    ? 'border-amber-200 bg-amber-50 text-amber-700'
    : 'border-[#E1E6E0] bg-white text-slate-500';

  return (
    <div className="space-y-4 rounded-2xl border border-[#E1E6E0] bg-[#F8FAF7] p-4">
      <div>
        <p className="text-xs font-extrabold text-slate-800">Elemen, Topik & Subtopik Pembelajaran</p>
        <p className="mt-0.5 text-[11px] text-slate-500">
          {props.analyzed ? 'Sudah terisi dari hasil analisis. Tinjau lalu ubah bila perlu.' : 'Topik, subtopik, dan elemen akan terisi otomatis setelah materi dianalisis.'}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-700">Elemen CP / Capaian</span>
          <input type="text" value={props.element} onChange={(e) => props.onElementChange(e.target.value)} placeholder="Contoh: Pemahaman Konsep" className={INPUT_CLASS} />
          <span className={`block rounded-lg border px-2 py-1 text-[10px] font-semibold ${elementSourceClass}`}>Sumber Elemen: {elementSourceLabel}</span>
          {props.elementSource === 'ai_draft' && props.element.trim() ? (
            <button type="button" onClick={props.onVerifyElement} className="text-[10px] font-bold text-blue-700 hover:underline">Tandai Elemen sudah diverifikasi guru</button>
          ) : null}
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-700">Topik Utama <span className="text-rose-500">*</span></span>
          <input type="text" value={props.topic} onChange={(e) => props.onTopicChange(e.target.value)} placeholder="Contoh: Ekosistem & Lingkungan" className={INPUT_CLASS} />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-bold text-slate-700">Subtopik / Pokok Bahasan</span>
          <input type="text" value={props.subtopic} onChange={(e) => props.onSubtopicChange(e.target.value)} placeholder="Contoh: Rantai Makanan" className={INPUT_CLASS} />
        </label>
      </div>
    </div>
  );
}
