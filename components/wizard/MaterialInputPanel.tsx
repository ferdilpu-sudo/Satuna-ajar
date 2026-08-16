import { FilePlus2, Globe2, Loader2, X } from 'lucide-react';
import StreamlineDuotoneIcon from '../icons/StreamlineDuotoneIcon';
import type { UploadedMaterialFile } from './types';

interface Props {
  typedMaterial: string;
  aiNotes: string;
  useWebResearch: boolean;
  uploadedFiles: UploadedMaterialFile[];
  isAnalyzing: boolean;
  onTypedMaterialChange: (value: string) => void;
  onAiNotesChange: (value: string) => void;
  onUseWebResearchChange: (value: boolean) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onAnalyze: () => void;
}

export default function MaterialInputPanel(props: Props) {
  const hasInput = props.typedMaterial.trim().length > 0 || props.uploadedFiles.length > 0;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-[#DDE3DC] bg-[#FBFCFA] focus-within:border-blue-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
        <label className="block px-4 pt-4">
          <span className="text-xs font-extrabold text-slate-800">Topik / Materi Pembelajaran</span>
          <span className="ml-1 text-[11px] font-normal text-slate-500">· wajib isi teks atau lampirkan file</span>
          <textarea
            value={props.typedMaterial}
            onChange={(event) => props.onTypedMaterialChange(event.target.value)}
            rows={7}
            placeholder="Contoh: Ekosistem dan interaksi lingkungan. Tempel ringkasan materi, poin penting, atau teks bahan ajar di sini..."
            className="mt-2 w-full resize-y bg-transparent pb-3 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400"
          />
        </label>

        {props.uploadedFiles.length > 0 && (
          <div className="space-y-2 border-t border-[#E6EAE5] px-3 py-3">
            {props.uploadedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between rounded-xl border border-[#E1E6E0] bg-white px-3 py-2 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-700">{file.name}</p>
                  <p className="text-[10px] text-slate-400">{formatFileSize(file.size)} · siap dianalisis</p>
                </div>
                <button type="button" aria-label={`Hapus ${file.name}`} onClick={() => props.onRemoveFile(index)} className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-[#E6EAE5] bg-white/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#DDE3DC] bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-blue-300 hover:bg-blue-50/40">
            <FilePlus2 className="h-4 w-4 text-blue-600" />
            Lampirkan file
            <span className="font-normal text-slate-400">opsional</span>
            <input type="file" multiple className="hidden" accept=".pdf,.docx,.txt,image/*" onChange={props.onFileUpload} />
          </label>
          <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-2 text-[11px] font-semibold text-slate-600">
            <input type="checkbox" checked={props.useWebResearch} onChange={(event) => props.onUseWebResearchChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
            <Globe2 className="h-4 w-4 text-blue-600" />
            Lengkapi dengan Riset Web Google
          </label>
        </div>
      </div>

      <button
        type="button"
        disabled={!hasInput || props.isAnalyzing}
        onClick={props.onAnalyze}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {props.isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <StreamlineDuotoneIcon name="magic" className="h-4 w-4" secondaryOpacity={0.28} />}
        {props.isAnalyzing ? 'Menganalisis materi...' : 'Analisis Materi & Isi Otomatis'}
      </button>
      <p className="text-center text-[11px] leading-5 text-slate-500">Analisis akan mengisi Topik, Subtopik, Elemen, dan CP secara otomatis untuk ditinjau.</p>

      <details className="rounded-xl border border-[#E1E6E0] bg-[#FBFCFA] px-3 py-2.5 text-xs">
        <summary className="cursor-pointer font-bold text-slate-600">Catatan tambahan untuk AI <span className="font-normal text-slate-400">(opsional)</span></summary>
        <textarea
          value={props.aiNotes}
          onChange={(event) => props.onAiNotesChange(event.target.value)}
          rows={2}
          placeholder="Contoh: Fokuskan pada konteks kehidupan sehari-hari."
          className="mt-2 w-full rounded-xl border border-[#DDE3DC] bg-white p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500"
        />
      </details>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
