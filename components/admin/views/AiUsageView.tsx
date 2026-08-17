import { Bot, CircleDollarSign, FileText, GaugeCircle, Sparkles } from 'lucide-react';
import { aiUsage } from '@/lib/admin/mock-data';

export default function AiUsageView() {
  const metrics = [
    ['Dokumen bulan ini', aiUsage.documentsThisMonth.toLocaleString('id-ID'), FileText],
    ['Success rate', `${aiUsage.successfulRequests}%`, GaugeCircle],
    ['Estimasi biaya', `Rp${aiUsage.estimatedCost.toLocaleString('id-ID')}`, CircleDollarSign],
    ['Biaya / dokumen', `Rp${aiUsage.costPerDocument.toLocaleString('id-ID')}`, Sparkles],
  ] as const;
  return <div className="space-y-5"><section className="grid grid-cols-2 gap-3 xl:grid-cols-4">{metrics.map(([label,value,Icon]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-4.5 w-4.5" /></span><p className="mt-4 text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-xl font-black text-slate-950">{value}</p></div>)}</section><section className="grid gap-5 xl:grid-cols-2"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Bot className="h-5 w-5 text-blue-600" /><h2 className="font-extrabold text-slate-950">Unit economics AI</h2></div><div className="mt-5 space-y-4"><Row label="MRR" value="Rp18,4 jt" /><Row label="Biaya AI" value="Rp3,11 jt" /><Row label="AI cost / MRR" value="16,9%" /><Row label="Token diproses" value={`${aiUsage.tokensMillions} juta`} /></div><div className="mt-5 rounded-xl bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"><b>Sehat.</b> Biaya AI masih di bawah ambang internal mock 20% dari MRR.</div></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-extrabold text-slate-950">Distribusi penggunaan</h2><p className="mt-1 text-xs text-slate-500">Contoh pemakaian berdasarkan fitur.</p><div className="mt-5 space-y-4"><Usage label="Generate dokumen" value={68} /><Usage label="Analisis materi" value={19} /><Usage label="Regenerate section" value={13} /></div></div></section></div>;
}

function Row({ label, value }: { label: string; value: string }) { return <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs"><span className="font-semibold text-slate-500">{label}</span><span className="font-extrabold text-slate-900">{value}</span></div>; }
function Usage({ label, value }: { label: string; value: number }) { return <div><div className="mb-1.5 flex justify-between text-xs"><span className="font-bold text-slate-700">{label}</span><span className="text-slate-500">{value}%</span></div><div className="h-2.5 rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${value}%` }} /></div></div>; }
