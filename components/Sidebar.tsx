'use client';

import Link from 'next/link';
import React from 'react';
import { WalletCards } from 'lucide-react';
import StreamlineDuotoneIcon, { type StreamlineIconName } from './icons/StreamlineDuotoneIcon';
import SatunaMark from './SatunaMark';
import { BRAND } from '@/lib/brand';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

const NAV_ITEMS: Array<{ id: string; label: string; icon: StreamlineIconName }> = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'create', label: 'Buat Dokumen', icon: 'add' },
  { id: 'history', label: 'Riwayat', icon: 'history' },
  { id: 'template', label: 'Template', icon: 'template' },
  { id: 'settings', label: 'Pengaturan', icon: 'settings' },
];

export default function Sidebar({ currentTab, onTabChange, isOpen, onCloseMobile }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <button type="button" aria-label="Tutup menu" className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[1px] lg:hidden" onClick={onCloseMobile} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#DDE3DC] bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-[#E6EAE5] px-5 py-5">
          <SatunaMark />
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-extrabold tracking-tight text-slate-900">{BRAND.name}</h1>
            <p className="text-[11px] font-semibold text-slate-500">{BRAND.tagline}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { onTabChange(item.id); onCloseMobile(); }}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive ? 'bg-blue-50 text-blue-700' : item.id === 'create' ? 'text-blue-700 hover:bg-blue-50' : 'text-slate-600 hover:bg-[#F5F7F4] hover:text-slate-900'
                }`}
              >
                <StreamlineDuotoneIcon name={item.icon} className={`h-5 w-5 ${isActive || item.id === 'create' ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="my-2 border-t border-[#E6EAE5]" />
          <Link
            href="/pricing"
            onClick={onCloseMobile}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <WalletCards className="h-5 w-5 shrink-0 text-blue-600" />
            <span className="flex-1">Paket & Harga</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">Rp7rb+</span>
          </Link>
        </nav>

        <details className="mx-3 mb-3 rounded-xl border border-[#E6EAE5] bg-[#F8FAF7] px-3 py-2.5 text-[11px] text-slate-600">
          <summary className="flex cursor-pointer list-none items-center gap-2 font-bold text-slate-700 marker:hidden">
            <StreamlineDuotoneIcon name="info" className="h-4 w-4 text-blue-600" />
            Panduan Pembelajaran Mendalam
          </summary>
          <p className="mt-2 leading-5">8 dimensi profil · 3 prinsip · 3 pengalaman belajar · 4 dukungan pembelajaran.</p>
        </details>

        <div className="border-t border-[#E6EAE5] px-4 py-3 text-center text-[10px] font-medium text-slate-400">
          <p>{BRAND.name} · 2026</p>
        </div>
      </aside>
    </>
  );
}
