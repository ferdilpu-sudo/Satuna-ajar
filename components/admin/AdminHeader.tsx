'use client';

import { CalendarDays, Menu, ShieldCheck } from 'lucide-react';
import type { AdminSection } from '@/types/admin';

const titles: Record<AdminSection, [string, string]> = {
  overview: ['Ringkasan bisnis', 'Pantau kesehatan bisnis Satuna dalam satu layar.'],
  users: ['Pengguna', 'Lihat pertumbuhan, aktivasi, dan risiko churn pengguna.'],
  subscriptions: ['Monetisasi', 'Pantau langganan dan pembelian sekali saat user membutuhkan generate.'],
  revenue: ['Pendapatan', 'Pisahkan pendapatan berulang dan beli sekali tanpa kehilangan total bisnis.'],
  ai: ['Penggunaan AI', 'Jaga biaya Gemini tetap sehat terhadap pendapatan.'],
  system: ['Kesehatan sistem', 'Temukan masalah operasional sebelum pengguna melapor.'],
};

export default function AdminHeader({ section, onMenu }: { section: AdminSection; onMenu: () => void }) {
  const [title, description] = titles[section];
  return (
    <header className="sticky top-0 z-30 flex min-h-[73px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onMenu} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Buka menu admin"><Menu className="h-5 w-5" /></button>
        <div className="min-w-0"><h1 className="truncate text-lg font-extrabold tracking-tight text-slate-950">{title}</h1><p className="hidden truncate text-xs text-slate-500 sm:block">{description}</p></div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 sm:flex"><CalendarDays className="h-4 w-4" />30 hari</span>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700" title="Admin terverifikasi"><ShieldCheck className="h-5 w-5" /></span>
      </div>
    </header>
  );
}
