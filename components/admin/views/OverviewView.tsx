import { AlertTriangle, ArrowRight, CircleDollarSign, UserRoundCheck } from 'lucide-react';
import { overviewMetrics, payments, revenueTrend, systemAlerts } from '@/lib/admin/mock-data';
import MetricCard from '../MetricCard';
import RevenueChart from '../RevenueChart';
import StatusBadge from '../StatusBadge';

export default function OverviewView() {
  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">{overviewMetrics.map((metric) => <MetricCard key={metric.label} metric={metric} />)}</section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.85fr)]"><RevenueChart data={revenueTrend} /><FunnelCard /></div>
      <div className="grid gap-5 xl:grid-cols-2"><RecentPayments /><Alerts /></div>
    </div>
  );
}

function FunnelCard() {
  const steps = [['Daftar', 1752, '100%'], ['Mencoba AI', 1218, '69,5%'], ['Trial habis', 614, '35,0%'], ['Melakukan pembayaran', 426, '24,3%']] as const;
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><UserRoundCheck className="h-5 w-5 text-blue-600" /><h2 className="font-extrabold text-slate-950">Funnel monetisasi</h2></div><p className="mt-1 text-xs text-slate-500">Langganan dan beli sekali, 30 hari terakhir.</p><div className="mt-5 space-y-3">{steps.map(([label, value, rate], index) => <div key={label}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-bold text-slate-700">{label}</span><span className="text-slate-500">{value.toLocaleString('id-ID')} · {rate}</span></div><div className="h-2.5 rounded-full bg-slate-100"><div className="h-2.5 rounded-full bg-blue-600" style={{ width: `${100 - index * 20}%` }} /></div></div>)}</div><div className="mt-5 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800"><b>426 pembayar</b> mencakup pelanggan langganan dan user yang memilih beli sekali.</div></section>;
}

function RecentPayments() {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-extrabold text-slate-950">Pembayaran terbaru</h2><p className="text-xs text-slate-500">Langganan dan beli sekali dalam satu feed.</p></div><CircleDollarSign className="h-5 w-5 text-emerald-600" /></div><div className="divide-y divide-slate-100">{payments.slice(0, 4).map((payment) => <div key={payment.id} className="flex items-center justify-between gap-3 px-5 py-3.5"><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-xs font-bold text-slate-800">{payment.customer}</p><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-600">{payment.kind}</span></div><p className="text-[10px] text-slate-400">{payment.item} · {payment.paidAt}</p></div><div className="text-right"><p className="text-xs font-extrabold text-slate-900">Rp{payment.amount.toLocaleString('id-ID')}</p><StatusBadge value={payment.status} /></div></div>)}</div></section>;
}

function Alerts() {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-extrabold text-slate-950">Perlu perhatian</h2><p className="text-xs text-slate-500">Masalah bisnis dan operasional terbaru.</p></div><AlertTriangle className="h-5 w-5 text-amber-500" /></div><div className="divide-y divide-slate-100">{systemAlerts.map((alert) => <div key={alert.id} className="px-5 py-3.5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-extrabold text-slate-800">{alert.title}</p><p className="mt-1 text-[11px] leading-4 text-slate-500">{alert.detail}</p></div><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" /></div><p className="mt-1 text-[10px] text-slate-400">{alert.time}</p></div>)}</div></section>;
}
