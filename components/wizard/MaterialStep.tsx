import { AlertCircle, ArrowLeft, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import StreamlineDuotoneIcon from '../icons/StreamlineDuotoneIcon';
import type { MaterialAnalysis, SchoolIdentity } from '../../types/rpp';
import GoogleSearchAttribution from '../GoogleSearchAttribution';
import MaterialInputPanel from './MaterialInputPanel';
import MaterialMetadataSection from './MaterialMetadataSection';
import type { GradeConflict, UploadedMaterialFile } from './types';

interface Props {
  identityLabel: string; subject: string; element: string; elementSource: NonNullable<SchoolIdentity['elementSource']>; topic: string; subtopic: string;
  typedMaterial: string; aiNotes: string; useWebResearch: boolean; uploadedFiles: UploadedMaterialFile[];
  isAnalyzing: boolean; analysisResult: MaterialAnalysis | null; analysisError: string | null; gradeConflict: GradeConflict | null;
  learningOutcomes: string; cpSource: SchoolIdentity['cpSource']; validationMessages: string[]; canContinue: boolean;
  onElementChange: (value: string) => void; onVerifyElement: () => void; onTopicChange: (value: string) => void; onSubtopicChange: (value: string) => void;
  onTypedMaterialChange: (value: string) => void; onAiNotesChange: (value: string) => void; onUseWebResearchChange: (value: boolean) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void; onRemoveFile: (index: number) => void;
  onLearningOutcomesChange: (value: string) => void; onUseDetectedCP: () => void; onUseGeneratedCP: () => void;
  onAnalyze: () => void; onUseDetectedGrade: () => void; onKeepCurrentGrade: () => void; onBack: () => void; onContinue: () => void;
}

const TEXTAREA = 'w-full rounded-xl border border-[#DDE3DC] bg-[#FBFCFA] p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white';

export default function MaterialStep(props: Props) {
  return (
    <section className="space-y-6 rounded-2xl border border-[#DDE3DC] bg-white p-5 shadow-sm sm:p-6">
      <div>
        <div className="flex items-center gap-2"><StreamlineDuotoneIcon name="template" className="h-5 w-5 text-blue-600" /><h2 className="text-lg font-extrabold text-slate-900">Materi, Elemen & CP</h2></div>
        <p className="mt-1 text-sm text-slate-500">Target: <b className="text-slate-700">{props.identityLabel}</b>. Ketik materi utama dan lampirkan file bila diperlukan.</p>
      </div>

      <MaterialInputPanel
        typedMaterial={props.typedMaterial}
        aiNotes={props.aiNotes}
        useWebResearch={props.useWebResearch}
        uploadedFiles={props.uploadedFiles}
        isAnalyzing={props.isAnalyzing}
        onTypedMaterialChange={props.onTypedMaterialChange}
        onAiNotesChange={props.onAiNotesChange}
        onUseWebResearchChange={props.onUseWebResearchChange}
        onFileUpload={props.onFileUpload}
        onRemoveFile={props.onRemoveFile}
        onAnalyze={props.onAnalyze}
      />

      {props.analysisError && <AnalysisError message={props.analysisError} isAnalyzing={props.isAnalyzing} onRetry={props.onAnalyze} />}
      {props.analysisResult && <AnalysisResult analysis={props.analysisResult} conflict={props.gradeConflict} onUseDetectedGrade={props.onUseDetectedGrade} onKeepCurrentGrade={props.onKeepCurrentGrade} />}

      <MaterialMetadataSection
        subject={props.subject}
        element={props.element}
        elementSource={props.elementSource}
        topic={props.topic}
        subtopic={props.subtopic}
        analyzed={Boolean(props.analysisResult)}
        onElementChange={props.onElementChange}
        onVerifyElement={props.onVerifyElement}
        onTopicChange={props.onTopicChange}
        onSubtopicChange={props.onSubtopicChange}
      />

      <CPSection analysis={props.analysisResult} value={props.learningOutcomes} source={props.cpSource} onChange={props.onLearningOutcomesChange} onUseDetected={props.onUseDetectedCP} onUseGenerated={props.onUseGeneratedCP} />

      {props.validationMessages.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><b>Lengkapi sebelum lanjut:</b><ul className="mt-1 list-disc pl-5">{props.validationMessages.map((message) => <li key={message}>{message}</li>)}</ul></div>}

      <div className="flex flex-col gap-3 border-t border-[#E6EAE5] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={props.onBack} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#DDE3DC] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Kembali ke Identitas</button>
        <button type="button" disabled={!props.canContinue} onClick={props.onContinue} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-blue-700">Lanjut ke Pembelajaran<ArrowRight className="h-4 w-4" /></button>
      </div>
    </section>
  );
}

function AnalysisError({ message, isAnalyzing, onRetry }: { message: string; isAnalyzing: boolean; onRetry: () => void }) {
  const isQuota = message.includes('kuota') || message.includes('rate limit');
  return <div className={`flex flex-col gap-2.5 rounded-xl border p-4 text-xs ${isQuota ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-rose-200 bg-rose-50 text-rose-800'}`}><div className="flex items-start gap-2.5"><AlertCircle className={`h-4 w-4 shrink-0 ${isQuota ? 'text-amber-600' : 'text-rose-600'}`} /><div className="space-y-1"><p className="font-bold">{isQuota ? 'Batas Kuota Penggunaan AI' : 'Gagal Menganalisis Materi'}</p><p className="leading-5">{message}</p></div></div>{isQuota && <div className="flex items-center justify-between border-t border-amber-200/60 pt-2.5"><span className="text-[11px] font-semibold text-amber-800">Tunggu 1–2 menit lalu coba lagi.</span><button type="button" onClick={onRetry} disabled={isAnalyzing} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 font-bold text-white hover:bg-amber-700 disabled:opacity-50">{isAnalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <StreamlineDuotoneIcon name="magic" className="h-3.5 w-3.5" />}Coba Lagi</button></div>}</div>;
}

function CPSection({ analysis, value, source, onChange, onUseDetected, onUseGenerated }: { analysis: MaterialAnalysis | null; value: string; source: SchoolIdentity['cpSource']; onChange: (value: string) => void; onUseDetected: () => void; onUseGenerated: () => void }) {
  return <div className="space-y-2 rounded-2xl border border-[#E1E6E0] bg-[#F8FAF7] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-extrabold text-slate-800">Capaian Pembelajaran (CP)</p><p className="mt-0.5 text-[11px] text-slate-500">Setelah analisis, CP dari dokumen diprioritaskan. Jika tidak tersedia, Draft AI terisi otomatis dan wajib diverifikasi.</p></div><div className="flex flex-wrap gap-2">{analysis?.detectedCP && <button type="button" onClick={onUseDetected} className="rounded-lg border border-blue-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-50">Gunakan CP Materi</button>}{analysis?.generatedCP && <button type="button" onClick={onUseGenerated} className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-blue-700"><StreamlineDuotoneIcon name="magic" className="mr-1 inline h-3.5 w-3.5" />Gunakan Draft AI</button>}</div></div><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} placeholder="CP akan terisi otomatis setelah analisis materi, atau dapat diisi manual." className={TEXTAREA} /><p className={`rounded-lg border p-2 text-[11px] font-semibold ${source === 'ai_draft' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-[#E1E6E0] bg-white text-slate-500'}`}>Sumber CP: {source === 'file' ? 'Dokumen pengguna' : source === 'ai_draft' ? 'Draft AI — wajib diverifikasi dengan sumber resmi' : 'Input manual pengguna'}</p></div>;
}

function AnalysisResult({ analysis, conflict, onUseDetectedGrade, onKeepCurrentGrade }: { analysis: MaterialAnalysis; conflict: GradeConflict | null; onUseDetectedGrade: () => void; onKeepCurrentGrade: () => void }) {
  return <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-xs"><div className="flex items-center justify-between gap-3"><span className="flex items-center gap-2 font-extrabold text-slate-800"><StreamlineDuotoneIcon name="magic" className="h-4 w-4 text-blue-600" />Hasil Analisis Materi</span><span className="rounded-full bg-white px-2.5 py-1 font-bold text-blue-700">Elemen & CP terisi otomatis</span></div><div className="grid gap-2 sm:grid-cols-2"><Analysis label="Topik" value={analysis.title} /><Analysis label="Subtopik" value={analysis.subtopics?.join(', ')} /><Analysis label="Elemen" value={analysis.detectedElement || analysis.generatedElement} /><Analysis label="Sasaran Terdeteksi" value={[analysis.detectedLevel, analysis.detectedGrade, analysis.detectedPhase].filter(Boolean).join(' · ') || 'Tidak terdeteksi'} /></div>{analysis.webSources?.length ? <div className="rounded-xl border border-white bg-white/90 p-3"><p className="font-extrabold text-slate-800">Sumber Riset Web ({analysis.webSources.length})</p><div className="mt-2 space-y-1.5">{analysis.webSources.slice(0, 5).map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-lg px-2 py-1.5 text-blue-700 hover:bg-blue-50"><ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="min-w-0"><span className="block truncate font-bold">{source.title}</span><span className="block truncate text-[10px] text-slate-500">{source.domain || source.url}</span></span></a>)}</div></div> : null}{analysis.searchEntryPointHtml ? <GoogleSearchAttribution html={analysis.searchEntryPointHtml} /> : null}{conflict && <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800"><p className="flex gap-2 font-bold"><AlertCircle className="h-4 w-4" />Konflik sasaran materi</p><p>Sumber terdeteksi untuk <b>{conflict.detectedGrade}</b> ({conflict.detectedLevel}), sedangkan identitas perangkat menggunakan <b>{conflict.formGrade || 'kelas belum diisi'}</b>.</p><div className="flex flex-wrap gap-2"><button type="button" onClick={onUseDetectedGrade} className="rounded-lg bg-amber-600 px-3 py-1.5 font-bold text-white">Gunakan kelas sumber</button><button type="button" onClick={onKeepCurrentGrade} className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-bold">Adaptasi ke kelas target</button></div></div>}</div>;
}

function Analysis({ label, value }: { label: string; value?: string }) { return <div className="rounded-xl border border-white bg-white/80 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 leading-5 text-slate-700">{value || '-'}</p></div>; }
