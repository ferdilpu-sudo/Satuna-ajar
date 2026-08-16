import StreamlineDuotoneIcon, { type StreamlineIconName } from '../icons/StreamlineDuotoneIcon';
import type { LearningSettings, MaterialAnalysis, OutputConfig, SchoolIdentity, SelectedDimension } from '../../types/rpp';
import { formatPhase } from '../../lib/validation';

interface Props {
  analysis: MaterialAnalysis | null;
  identity: SchoolIdentity;
  settings: LearningSettings;
  dimensions: SelectedDimension[];
  output: OutputConfig;
  documentTypeSelected: boolean;
  errors: string[];
}

export default function WizardSummaryPanel({ analysis, identity, settings, dimensions, output, documentTypeSelected, errors }: Props) {
  return (
    <aside className="sticky top-24 space-y-3">
      <div className="rounded-2xl border border-[#DDE3DC] bg-white p-4 shadow-sm">
        <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400">Ringkasan</p>
        <div className="mt-3 space-y-3">
          <Summary icon="profile" label="Target" value={identity.grade ? `${identity.subject || 'Mapel belum diisi'} · ${identity.grade} · ${formatPhase(identity.phase)}` : 'Belum lengkap'} ready={Boolean(identity.subject && identity.grade && identity.phase)} />
          <Summary icon="template" label="Materi" value={analysis?.title || identity.topic || 'Belum dianalisis'} ready={Boolean(analysis)} />
          <Summary icon="settings" label="Model" value={settings.model === 'Auto' ? 'Rekomendasi AI' : settings.model} ready />
          <Summary icon="magic" label="Dimensi" value={`${dimensions.length} dipilih`} ready={dimensions.length >= 2 && dimensions.length <= 5} />
          <Summary icon={output.format === 'Ringkas' ? 'document' : 'module'} label="Jenis Dokumen" value={documentTypeSelected ? (output.format === 'Ringkas' ? 'RPP' : 'Modul Ajar') : 'Belum dipilih'} ready={documentTypeSelected} />
        </div>
      </div>

      <div className={`rounded-2xl border p-4 ${errors.length ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'}`}>
        <p className={`text-xs font-extrabold ${errors.length ? 'text-amber-800' : 'text-emerald-800'}`}>{errors.length ? `${errors.length} hal perlu dilengkapi` : 'Siap untuk generate'}</p>
        <p className={`mt-1 text-[11px] leading-5 ${errors.length ? 'text-amber-700' : 'text-emerald-700'}`}>{errors.length ? errors[0] : 'Data utama sudah memenuhi pemeriksaan awal.'}</p>
      </div>
    </aside>
  );
}

function Summary({ icon, label, value, ready }: { icon: StreamlineIconName; label: string; value: string; ready: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ready ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
        <StreamlineDuotoneIcon name={icon} className="h-4 w-4" />
      </span>
      <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-0.5 line-clamp-2 text-xs font-semibold leading-5 text-slate-700">{value}</p></div>
    </div>
  );
}
