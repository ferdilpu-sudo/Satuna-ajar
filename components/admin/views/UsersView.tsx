'use client';

import { Search, UserPlus } from 'lucide-react';
import { useAdminUsers } from '../useAdminData';
import StatusBadge from '../StatusBadge';

export default function UsersView() {
  const { data: users, loading, error } = useAdminUsers();
  const active = users.filter((user) => user.status === 'Aktif').length;
  const oneTimeBuyers = users.filter((user) => user.paidGenerations > 0).length;
  const pro = users.filter((user) => user.plan === 'Pro').length;

  return (
    <div className="space-y-5">
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[['Total akun', users.length], ['Aktif', active], ['Pembeli sekali', oneTimeBuyers], ['Pelanggan Pro', pro]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{loading ? '…' : Number(value).toLocaleString('id-ID')}</p></div>)}</section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4"><div><h2 className="font-extrabold text-slate-950">Pengguna terbaru & aktif</h2><p className="text-xs text-slate-500">Akun admin aktif dikeluarkan dari daftar pengguna.</p></div><div className="flex gap-2"><button type="button" disabled className="flex min-h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-400"><Search className="h-4 w-4" />Cari</button><button type="button" disabled className="flex min-h-10 cursor-not-allowed items-center gap-2 rounded-xl bg-slate-100 px-3 text-xs font-bold text-slate-400"><UserPlus className="h-4 w-4" />Tambah user</button></div></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[930px] text-left"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Pengguna</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Dokumen AI</th><th className="px-4 py-3">Generate beli</th><th className="px-4 py-3">Bergabung</th><th className="px-5 py-3">Aktif terakhir</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><p className="text-xs font-extrabold text-slate-900">{user.name}</p><p className="mt-0.5 text-[10px] text-slate-400">{user.email}</p></td><td className="px-4 py-4 text-xs font-bold text-slate-700">{user.plan}</td><td className="px-4 py-4"><StatusBadge value={user.status} /></td><td className="px-4 py-4 text-xs text-slate-600">{user.documents}</td><td className="px-4 py-4 text-xs font-bold text-blue-700">{user.paidGenerations}</td><td className="px-4 py-4 text-xs text-slate-500">{user.joinedAt}</td><td className="px-5 py-4 text-xs text-slate-500">{user.lastActive}</td></tr>)}{!loading && users.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-xs text-slate-400">Belum ada pengguna non-admin.</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}
