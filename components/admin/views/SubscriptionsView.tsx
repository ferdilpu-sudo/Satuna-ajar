import { AlertCircle, BadgeCheck, Coins, RefreshCw } from 'lucide-react';
import { monetizationMix, subscriptions } from '@/lib/admin/mock-data';
import OneTimePurchaseTable from '../OneTimePurchaseTable';
import StatusBadge from '../StatusBadge';

export default function SubscriptionsView() {
  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Summary icon={<BadgeCheck className="h-5 w-5" />} label="Langganan aktif" value="326" tone="emerald" />
        <Summary icon={<Coins className="h-5 w-5" />} label="Beli sekali · 30 hari" value={monetizationMix.oneTimeTransactions.toLocaleString('id-ID')} tone="blue" />
        <Summary icon={<RefreshCw className="h-5 w-5" />} label="Pembeli sekali" value={monetizationMix.oneTimeBuyers.toLocaleString('id-ID')} tone="blue" />
        <Summary icon={<AlertCircle className="h-5 w-5" />} label="Hak belum dipakai" value={monetizationMix.unusedGenerationRights.toLocaleString('id-ID')} tone="amber" />
      </section>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-900">
        <b>Model beli sekali:</b> user membayar untuk <b>1x Generasi AI</b>. Pada backend nanti, hak generate baru dikonsumsi setelah dokumen berhasil dibuat agar retry/error tidak menagih user dua kali.
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-extrabold text-slate-950">Status langganan</h2><p className="text-xs text-slate-500">Pendapatan berulang tetap dipantau terpisah dari beli sekali.</p></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-5 py-3">Pelanggan</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Nilai</th><th className="px-4 py-3">Status</th><th className="px-5 py-3">Renewal</th></tr></thead><tbody className="divide-y divide-slate-100">{subscriptions.map((subscription) => <tr key={subscription.id}><td className="px-5 py-4 font-extrabold text-slate-900">{subscription.customer}</td><td className="px-4 py-4 text-slate-600">{subscription.plan}</td><td className="px-4 py-4 font-bold text-slate-800">Rp{subscription.amount.toLocaleString('id-ID')}</td><td className="px-4 py-4"><StatusBadge value={subscription.status} /></td><td className="px-5 py-4 text-slate-500">{subscription.renewAt}</td></tr>)}</tbody></table></div>
      </section>

      <OneTimePurchaseTable />
    </div>
  );
}

function Summary({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: 'emerald' | 'blue' | 'amber' }) {
  const tones = { emerald: 'bg-emerald-50 text-emerald-700', blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700' };
  return <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>{icon}</span><div><p className="text-xs font-bold text-slate-500">{label}</p><p className="text-xl font-black text-slate-950">{value}</p></div></div>;
}
