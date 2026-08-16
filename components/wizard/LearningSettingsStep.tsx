import { ArrowLeft, ArrowRight } from 'lucide-react';
import StreamlineDuotoneIcon from '../icons/StreamlineDuotoneIcon';
import type { LearningSettings } from '../../types/rpp';

interface Props { settings: LearningSettings; onChange: (settings: LearningSettings) => void; onBack: () => void; onContinue: () => void; }
const METHODS = ['Diskusi Kelompok','Tanya Jawab','Observasi','Eksperimen','Presentasi','Studi Kasus','Penugasan','Simulasi'];
const DIGITAL = ['Tanpa Digital','PID (Papan Interaktif Digital)','YouTube','Canva','Google Forms','Wordwall','Quizizz','Google Slides','AI tools'];
const SELECT = 'w-full rounded-xl border border-[#DDE3DC] bg-[#FBFCFA] p-3 text-sm text-slate-800 focus:border-blue-500 focus:bg-white';

export default function LearningSettingsStep({ settings, onChange, onBack, onContinue }: Props) {
  const toggle = (key: 'methods'|'digitalTools', value: string) => {
    const current = settings[key];
    onChange({ ...settings, [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  };
  return (
    <section className="space-y-6 rounded-2xl border border-[#DDE3DC] bg-white p-5 shadow-sm sm:p-6">
      <div><h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><StreamlineDuotoneIcon name="settings" className="h-5 w-5 text-blue-600" />Pengaturan Pembelajaran</h2><p className="mt-1 text-sm text-slate-500">Pilih model, metode, mitra, dan teknologi yang relevan.</p></div>
      <Select label="Model Pembelajaran" value={settings.model} onChange={(model) => onChange({ ...settings, model })} options={['Auto','Problem Based Learning','Project Based Learning','Inquiry Learning','Discovery Learning','Cooperative Learning - Jigsaw','Cooperative Learning - STAD','Contextual Teaching and Learning','Eksperimen','Pembelajaran Langsung']} />
      <ChipGroup label="Metode Pembelajaran" options={METHODS} selected={settings.methods} onToggle={(value) => toggle('methods', value)} />
      <Select label="Mitra Pembelajaran" value={settings.partners[0] || 'Tidak Ada'} onChange={(value) => onChange({ ...settings, partners: [value] })} options={['Tidak Ada','Orang Tua','Masyarakat','Praktisi','Pelaku Usaha','Instansi']} />
      <ChipGroup label="Pemanfaatan Digital" options={DIGITAL} selected={settings.digitalTools} onToggle={(value) => toggle('digitalTools', value)} />
      <Nav onBack={onBack} onContinue={onContinue} />
    </section>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return <label className="block space-y-1.5"><span className="text-xs font-bold text-slate-700">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT}>{options.map((option) => <option key={option} value={option}>{option === 'Auto' ? 'Auto — Direkomendasikan AI' : option}</option>)}</select></label>;
}

function ChipGroup({ label, options, selected, onToggle }: { label: string; options: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <div className="space-y-2"><p className="text-xs font-bold text-slate-700">{label}</p><div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">{options.map((option) => { const active = selected.includes(option); return <label key={option} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border p-2.5 transition ${active ? 'border-blue-200 bg-blue-50 font-bold text-blue-700' : 'border-[#E1E6E0] bg-[#FBFCFA] text-slate-600 hover:border-slate-300'}`}><input type="checkbox" checked={active} onChange={() => onToggle(option)} className="accent-blue-600" /><span>{option}</span></label>; })}</div></div>;
}

function Nav({ onBack, onContinue }: { onBack: () => void; onContinue: () => void }) {
  return <div className="flex justify-between border-t border-[#E6EAE5] pt-4"><button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#DDE3DC] bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Kembali</button><button type="button" onClick={onContinue} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700">Lanjut ke Dimensi Profil<ArrowRight className="h-4 w-4" /></button></div>;
}
