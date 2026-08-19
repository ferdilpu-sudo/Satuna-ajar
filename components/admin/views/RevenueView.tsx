'use client';

import { CircleDollarSign, Coins, Repeat2 } from 'lucide-react';
import { revenueTrend } from '@/lib/admin/mock-data';
import RevenueChart from '../RevenueChart';
import StatusBadge from '../StatusBadge';
import { useAdminCommerce } from '../useAdminData';

export default function RevenueView() {
  const { data, loading, error } = useAdminCommerce();
  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      <section className="grid gap-3 sm:grid-cols-3">
        <Mini icon={<CircleDollarSign className="h-5 w-5" />} label="Pendapatan bulan ini" value={loading ? '…' : rupiahJuta(data.monthRevenue)} />
        <Mini icon={<Repeat2 className="h-5 w-5" />} label="Dari langganan" value={loading ? '…' : rupiahJuta(data.recurringRevenue)} />
        <Mini icon={<Coins className="h-5 w-5" />} label="Dari beli sekali" value={loading ? '…' : rupiahJuta(data.oneTimeRevenue)} />
      </section>
      <div className="relative"><RevenueChart data={revenueTrend} /><span className="absolute right-4 top-4 rounded-full bg-amber-50 px-2.5 py-1 text-[9px] font-extrabold text-amber-700">Grafik historis masih mock</span></div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-extrabold text-slate-950">Riwayat pembayaran</h2><p className="text-xs text-slate-500">Langganan dan pembelian 1x generate dari ledger Supabase.</p></div>
        <div className="divide-y divide-slate-100">
          {data.payments.map((payment) => <div key={payment.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"><div><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-extrabold text-slate-900">{payment.customer}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${payment.kind === 'Beli sekali' ? 'bg-blue-50 text-blue-700' : 'bg-violet-50 text-violet-700'}`}>{payment.kind}</span></div><p className="mt-0.5 text-[10px] text-slate-400">{payment.item} · {payment.id} · {payment.provider} · {payment.paidAt}</p></div><div className="flex items-center gap-4"><p className="text-xs font-black text-slate-900">Rp{payment.amount.toLocaleString('id-ID')}</p><StatusBadge value={payment.status} /></div></div>)}
          {!loading && data.payments.length === 0 && <div className="px-5 py-8 text-center text-xs text-slate-400">Belum ada transaksi pembayaran.</div>}
        </div>
      </section>
    </div>
  );
}

function rupiahJuta(value: number) {
  return value < 1_000_000 ? `Rp ${value.toLocaleString('id-ID')}` : `Rp ${(value / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`;
}

function Mini({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">{icon}</span><div><p className="text-xs font-bold text-slate-500">{label}</p><p className="text-xl font-black text-slate-950">{value}</p></div></div>;
}
