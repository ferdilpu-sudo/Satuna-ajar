import type { RevenuePoint } from '@/types/admin';

export default function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const max = Math.max(...data.map((item) => item.revenue), 1);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-extrabold text-slate-950">Pendapatan vs biaya AI</h2><p className="mt-1 text-xs text-slate-500">Juta rupiah per bulan, mock data.</p></div><div className="flex gap-3 text-[10px] font-bold text-slate-500"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-blue-600" />Pendapatan</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-amber-400" />AI</span></div></div>
      <div className="mt-6 flex h-52 items-end gap-2 sm:gap-3">
        {data.map((item) => <div key={item.label} className="flex h-full flex-1 flex-col justify-end gap-2"><div className="flex flex-1 items-end justify-center gap-1"><div title={`Pendapatan Rp${item.revenue} jt`} className="w-[42%] rounded-t-md bg-blue-600/90" style={{ height: `${(item.revenue / max) * 100}%` }} /><div title={`Biaya AI Rp${item.aiCost} jt`} className="w-[32%] rounded-t-md bg-amber-400/90" style={{ height: `${(item.aiCost / max) * 100}%` }} /></div><span className="text-center text-[10px] font-semibold text-slate-400">{item.label}</span></div>)}
      </div>
    </section>
  );
}
