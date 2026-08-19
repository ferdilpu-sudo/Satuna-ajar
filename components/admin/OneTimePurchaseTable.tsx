import type { OneTimePurchaseRow } from '@/types/admin';
import StatusBadge from './StatusBadge';

export default function OneTimePurchaseTable({ purchases }: { purchases: OneTimePurchaseRow[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-extrabold text-slate-950">Pembelian sekali</h2>
        <p className="text-xs text-slate-500">Satu pembayaran memberi hak satu kali generate.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-xs">
          <thead className="bg-slate-50 text-[10px] uppercase text-slate-500"><tr><th className="px-5 py-3">Pembeli</th><th className="px-4 py-3">Produk</th><th className="px-4 py-3">Nilai</th><th className="px-4 py-3">Pembayaran</th><th className="px-4 py-3">Hak generate</th><th className="px-5 py-3">Waktu</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {purchases.map((purchase) => <tr key={purchase.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="font-extrabold text-slate-900">{purchase.customer}</p><p className="mt-0.5 text-[10px] text-slate-400">{purchase.id}</p></td><td className="px-4 py-4 text-slate-600">{purchase.product}</td><td className="px-4 py-4 font-bold text-slate-800">Rp{purchase.amount.toLocaleString('id-ID')}</td><td className="px-4 py-4"><StatusBadge value={purchase.status} /></td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${purchase.usage === 'Sudah digunakan' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700'}`}>{purchase.usage}</span></td><td className="px-5 py-4 text-slate-500">{purchase.purchasedAt}</td></tr>)}
            {purchases.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-400">Belum ada pembelian sekali.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
