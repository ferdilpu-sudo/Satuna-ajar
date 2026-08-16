'use client';

import React from 'react';
import { Menu } from 'lucide-react';
import StreamlineDuotoneIcon from './icons/StreamlineDuotoneIcon';
import { BRAND } from '@/lib/brand';

interface HeaderProps {
  currentTab: string;
  onOpenMobileSidebar: () => void;
  onNewRPPClick: () => void;
  onOpenSettings: () => void;
  teacherName?: string;
  schoolName?: string;
}

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  create: 'Buat Dokumen',
  history: 'Riwayat Dokumen',
  template: 'Template Pembelajaran',
  settings: 'Pengaturan Profil',
  detail: 'Detail Dokumen',
};

export default function Header({
  currentTab,
  onOpenMobileSidebar,
  onNewRPPClick,
  onOpenSettings,
  teacherName = '',
  schoolName = '',
}: HeaderProps) {
  const profileComplete = Boolean(teacherName.trim() && schoolName.trim());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#DDE3DC] bg-white/90 px-4 py-3.5 backdrop-blur-md sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
            {TITLES[currentTab] || BRAND.name}
          </h2>
          <p className="hidden text-xs text-slate-500 sm:block">
            {BRAND.tagline}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {['dashboard', 'history', 'template', 'settings'].includes(currentTab) && (
          <button
            type="button"
            onClick={onNewRPPClick}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:text-sm"
          >
            <StreamlineDuotoneIcon name="add" className="h-4 w-4" secondaryOpacity={0.28} />
            <span className="hidden sm:inline">Dokumen Baru</span>
            <span className="sm:hidden">Buat</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenSettings}
          aria-label={profileComplete ? 'Buka pengaturan profil' : 'Lengkapi profil'}
          className="hidden min-h-11 items-center gap-2.5 rounded-xl border-l border-[#E4E8E3] px-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 md:flex"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1F5F2] text-slate-600">
            <StreamlineDuotoneIcon name="profile" className="h-4 w-4" />
          </span>
          <span className="max-w-[180px] leading-tight">
            <span className="block truncate text-xs font-bold text-slate-800">{profileComplete ? teacherName : 'Lengkapi Profil'}</span>
            <span className="block truncate text-[10px] text-slate-500">{profileComplete ? schoolName : 'Nama & sekolah belum diatur'}</span>
          </span>
        </button>
      </div>
    </header>
  );
}
