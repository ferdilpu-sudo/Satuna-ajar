import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import StreamlineDuotoneIcon from '../icons/StreamlineDuotoneIcon';
import type { SelectedDimension } from '../../types/rpp';

interface Props { dimensions: string[]; selected: SelectedDimension[]; onToggle: (name: string) => void; onBack: () => void; onContinue: () => void; }

export default function DimensionsStep({ dimensions, selected, onToggle, onBack, onContinue }: Props) {
  return (
    <section className="space-y-6 rounded-2xl border border-[#DDE3DC] bg-white p-5 shadow-sm sm:p-6">
      <div><h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><StreamlineDuotoneIcon name="layers" className="h-5 w-5 text-blue-600" />Dimensi Profil Lulusan</h2><p className="mt-1 text-sm text-slate-500">Pilih 2–5 dimensi yang benar-benar relevan dengan tujuan dan aktivitas.</p></div>
      {selected.length > 5 && <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800"><AlertCircle className="h-4 w-4" />Terlalu banyak dimensi dipilih. Pastikan setiap dimensi memiliki aktivitas dan bukti belajar.</div>}
      <div className="grid gap-3 sm:grid-cols-2">{dimensions.map((name) => { const active = selected.some((item) => item.name === name); return <button key={name} type="button" onClick={() => onToggle(name)} className={`flex min-h-14 items-center rounded-xl border p-3.5 text-left text-xs font-bold transition ${active ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-[#E1E6E0] bg-[#FBFCFA] text-slate-700 hover:border-slate-300 hover:bg-white'}`}><span className={`mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'}`}>{active ? '✓' : ''}</span>{name}</button>; })}</div>
      <div className="flex justify-between border-t border-[#E6EAE5] pt-4"><button type="button" onClick={onBack} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#DDE3DC] px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Kembali</button><button type="button" onClick={onContinue} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700">Lanjut ke Output<ArrowRight className="h-4 w-4" /></button></div>
    </section>
  );
}
