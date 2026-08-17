'use client';

import { BarChart3, Bot, CreditCard, Gauge, HeartPulse, ReceiptText, Users, X } from 'lucide-react';
import SatunaMark from '@/components/SatunaMark';
import type { AdminSection } from '@/types/admin';

const items = [
  ['overview', 'Ringkasan', Gauge], ['users', 'Pengguna', Users], ['subscriptions', 'Monetisasi', CreditCard],
  ['revenue', 'Pendapatan', BarChart3], ['ai', 'Penggunaan AI', Bot], ['system', 'Sistem', HeartPulse],
] as const;

interface Props {
  section: AdminSection;
  open: boolean;
  onChange: (section: AdminSection) => void;
  onClose: () => void;
}

export default function AdminSidebar({ section, open, onChange, onClose }: Props) {
  return (
    <>
      {open && <button type="button" aria-label="Tutup menu admin" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/25 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-[#0F172A] text-white transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-[73px] items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3"><SatunaMark /><div><p className="text-sm font-extrabold">Satuna Admin</p><p className="text-[10px] font-semibold text-slate-400">Business control panel</p></div></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"><X className="h-4 w-4" /></button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigasi admin">
          {items.map(([id, label, Icon]) => {
            const active = section === id;
            return <button key={id} type="button" onClick={() => { onChange(id); onClose(); }} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}><Icon className="h-4.5 w-4.5" /><span>{label}</span></button>;
          })}
        </nav>
        <div className="m-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300"><ReceiptText className="h-4 w-4" />Mode prototipe</div>
          <p className="mt-1.5 text-[10px] leading-4 text-slate-400">Semua angka masih mock data. Belum terhubung ke pembayaran atau usage production.</p>
        </div>
      </aside>
    </>
  );
}
