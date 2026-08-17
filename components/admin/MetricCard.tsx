import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { AdminMetric } from '@/types/admin';

export default function MetricCard({ metric }: { metric: AdminMetric }) {
  const Icon = metric.trend === 'up' ? ArrowUpRight : metric.trend === 'down' ? ArrowDownRight : Minus;
  const tone = metric.trend === 'down' ? 'text-rose-600 bg-rose-50' : metric.trend === 'neutral' ? 'text-slate-500 bg-slate-100' : 'text-emerald-700 bg-emerald-50';
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <p className="text-xs font-bold text-slate-500">{metric.label}</p>
      <div className="mt-2 flex items-end justify-between gap-3"><p className="text-2xl font-black tracking-tight text-slate-950">{metric.value}</p><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-extrabold ${tone}`}><Icon className="h-3 w-3" />{metric.change}</span></div>
      <p className="mt-2 text-[11px] text-slate-400">{metric.helper}</p>
    </article>
  );
}
