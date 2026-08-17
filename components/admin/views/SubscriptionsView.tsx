'use client';

import { AlertCircle, BadgeCheck, Coins, RefreshCw } from 'lucide-react';
import OneTimePurchaseTable from '../OneTimePurchaseTable';
import StatusBadge from '../StatusBadge';
import { useAdminCommerce } from '../useAdminData';

export default function SubscriptionsView() {
  const { data, loading, error } = useAdminCommerce();
  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Summary icon={<BadgeCheck className="h-5 w-5" />} label="Langganan aktif" value={loading ? '…' : data.activeSubscriptions.toLocaleString('id-ID')} tone="emerald" />
        <Summary icon={<Coins className="h-5 w-5" />} label="Beli sekali · 30 hari" value={loading ? '…' : data.oneTimeTransactions30d.toLocaleString('id-ID')} tone="blue" />
        <Summary icon={<RefreshCw className="h-5 w-5" />} label="Pembeli sekali" value={loading ? '…' : data.oneTimeBuyers30d.toLocaleString('id-ID')} tone="blue" />
        <Summary icon={<AlertCircle className="h-5 w-5" />} label="Hak belum dipakai" value={loading ? '…' : data.unusedGenerationRights.toLocaleString('id-ID')} tone="amber" />
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-900"><b>Model beli sekali:</b> satu pembayaran memberi satu hak Generasi AI. Hak yang direserve akan dikembalikan bila generation gagal.</section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-extrabold text-slate-950">Status langganan</h2><p className="text-xs text-slate-500">Pendapatan berulang dipantau terpisah dari beli sekali.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-5 py-3">Pelanggan</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Nilai</th><th className="px-4 py-3">Status</th><th className="px-5 py-3">Renewal</th></tr></thead><tbody className="divide-y divide-slate-100">{data.subscriptions.map((subscription) => <tr key={subscription.id}><td className="px-5 py-4 font-extrabold text-slate-900">{subscription.customer}</td><td className="px-4 py-4 text-slate-600">{subscription.plan}</td><td className="px-4 py-4 font-bold text-slate-800">Rp{subscription.amount.toLocaleString('id-ID')}</td><td className="px-4 py-4"><StatusBadge value={subscription.status} /></td><td className="px-5 py-4 text-slate-500">{subscription.renewAt}</td></tr>)}{!loading && data.subscriptions.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Belum ada langganan.</td></tr>}</tbody></table></div>
      </section>

      <OneTimePurchaseTable purchases={data.oneTimePurchases} />
    </div>
  );
}

function Summary({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'emerald' | 'blue' | 'amber' }) {
  const tones = { emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700' };
  return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span><div><p className="text-xs font-bold text-slate-500">{label}</p><p className="text-xl font-black text-slate-950">{value}</p></div></div>;
}
