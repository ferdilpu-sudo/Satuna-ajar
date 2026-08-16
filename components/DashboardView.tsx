'use client';

import React from 'react';
import { formatRelativeDate } from '@/lib/utils';
import type { RPPData } from '@/types/rpp';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import StreamlineDuotoneIcon, { type StreamlineIconName } from './icons/StreamlineDuotoneIcon';

interface DashboardViewProps {
  rppList: RPPData[];
  onNewRPPClick: () => void;
  onViewRPP: (rpp: RPPData) => void;
  onEditRPP: (rpp: RPPData) => void;
  onDuplicateRPP: (id: string) => void;
  onDeleteRPP: (id: string) => void;
  teacherName?: string;
  onOpenHistory: () => void;
}

export default function DashboardView({ rppList, onNewRPPClick, onViewRPP, onEditRPP, onDuplicateRPP, onDeleteRPP, teacherName = '', onOpenHistory }: DashboardViewProps) {
  const sorted = [...rppList].sort((a, b) => Date.parse(b.updatedAt || b.createdAt) - Date.parse(a.updatedAt || a.createdAt));
  const latestDraft = sorted.find((item) => item.status === 'Draft');
  const total = rppList.length;
  const rppCount = rppList.filter((item) => item.documentFormat === 'Ringkas').length;
  const moduleCount = rppList.filter((item) => item.documentFormat === 'Lengkap').length;
  const drafts = rppList.filter((item) => item.status === 'Draft').length;
  const latest = sorted.slice(0, 5);
  const firstName = teacherName.trim().split(/\s+/)[0] || 'Guru';

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-sm text-slate-500">Selamat datang kembali, <b className="text-slate-700">{firstName}</b>.</p>
          <p className="mt-0.5 text-xs text-slate-400">Buka, sunting, dan ekspor perangkat pembelajaran dari satu workspace.</p>
        </div>
        <span className="hidden rounded-full border border-[#DDE3DC] bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-500 sm:inline-flex">{total} dokumen tersimpan</span>
      </div>

      {latestDraft ? <ContinueCard rpp={latestDraft} onOpen={() => onViewRPP(latestDraft)} /> : (
        <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-dashed border-blue-200 bg-blue-50/40 p-5 sm:flex-row sm:items-center">
          <div><p className="font-extrabold text-slate-900">Belum ada draft aktif</p><p className="mt-1 text-xs text-slate-500">Mulai dari materi atau topik pembelajaran baru.</p></div>
          <button type="button" onClick={onNewRPPClick} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"><StreamlineDuotoneIcon name="add" className="h-4 w-4" secondaryOpacity={0.28} />Buat Dokumen</button>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total Dokumen" value={total} icon="document" tone="blue" onClick={onOpenHistory} />
        <StatCard label="RPP" value={rppCount} icon="document" tone="blue" onClick={onOpenHistory} />
        <StatCard label="Modul Ajar" value={moduleCount} icon="module" tone="green" onClick={onOpenHistory} />
        <StatCard label="Draft" value={drafts} icon="template" tone="amber" onClick={onOpenHistory} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-[#DDE3DC] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#E6EAE5] px-5 py-4">
          <div><h2 className="font-extrabold text-slate-900">Dokumen terbaru</h2><p className="text-xs text-slate-500">RPP dan Modul Ajar yang terakhir dikerjakan.</p></div>
          {rppList.length > 0 && <button type="button" onClick={onOpenHistory} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-xs font-bold text-blue-700 hover:bg-blue-50 hover:text-blue-800">Lihat semua<ArrowRight className="h-3.5 w-3.5" /></button>}
        </div>

        {latest.length === 0 ? (
          <div className="px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><StreamlineDuotoneIcon name="document" className="h-6 w-6" /></div><p className="mt-3 text-sm font-bold text-slate-800">Belum ada dokumen</p><p className="mt-1 text-xs text-slate-500">Buat dokumen pertama untuk mulai membangun workspace Anda.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#F8FAF7] text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3 font-bold">Mata Pelajaran & Topik</th><th className="px-4 py-3 font-bold">Jenis</th><th className="px-4 py-3 font-bold">Kelas / Fase</th><th className="px-4 py-3 font-bold">Diperbarui</th><th className="px-4 py-3 font-bold">Status</th><th className="px-5 py-3 text-right font-bold">Aksi</th></tr></thead>
              <tbody className="divide-y divide-[#EDF0EC]">{latest.map((rpp) => <tr key={rpp.id} className="transition-colors hover:bg-[#FAFBF9]"><td className="px-5 py-4"><button type="button" onClick={() => onViewRPP(rpp)} className="max-w-sm text-left"><span className="block font-bold text-slate-900 hover:text-blue-700">{rpp.identity.subject}</span><span className="mt-0.5 block truncate text-xs text-slate-500">{rpp.identity.topic}</span></button></td><td className="px-4 py-4"><DocumentTypeBadge rpp={rpp} /></td><td className="px-4 py-4 text-sm text-slate-600">{rpp.identity.grade} · Fase {rpp.identity.phase}</td><td className="px-4 py-4 text-xs text-slate-500">{formatRelativeDate(rpp.updatedAt || rpp.createdAt)}</td><td className="px-4 py-4"><StatusBadge rpp={rpp} /></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><IconButton label="Lihat" onClick={() => onViewRPP(rpp)}><StreamlineDuotoneIcon name="view" className="h-4 w-4" /></IconButton><IconButton label="Sunting" onClick={() => onEditRPP(rpp)}><StreamlineDuotoneIcon name="edit" className="h-4 w-4" /></IconButton><IconButton label="Duplikat" onClick={() => onDuplicateRPP(rpp.id)}><StreamlineDuotoneIcon name="duplicate" className="h-4 w-4" /></IconButton><IconButton label="Hapus" danger onClick={() => onDeleteRPP(rpp.id)}><StreamlineDuotoneIcon name="delete" className="h-4 w-4" /></IconButton></div></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function ContinueCard({ rpp, onOpen }: { rpp: RPPData; onOpen: () => void }) {
  return <section className="rounded-2xl border border-blue-100 bg-[#F6F9FF] p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="mb-2 flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-slate-500">Lanjutkan draft</span><StatusBadge rpp={rpp} /></div><h2 className="truncate text-lg font-extrabold text-slate-900">{rpp.identity.subject}</h2><p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{rpp.identity.topic}</p><p className="mt-2 text-xs text-slate-500">{rpp.identity.grade} · {rpp.documentFormat === 'Ringkas' ? 'RPP' : 'Modul Ajar'} · diperbarui {formatRelativeDate(rpp.updatedAt || rpp.createdAt)}</p></div><button type="button" onClick={onOpen} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">Buka draft<ArrowRight className="h-3.5 w-3.5" /></button></div></section>;
}

function DocumentTypeBadge({ rpp }: { rpp: RPPData }) {
  const isRPP = rpp.documentFormat === 'Ringkas';
  return <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${isRPP ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>{isRPP ? 'RPP' : 'Modul Ajar'}</span>;
}

function StatusBadge({ rpp }: { rpp: RPPData }) {
  const ready = rpp.status === 'Selesai';
  const label = ready ? 'Siap' : 'Draft';
  const tone = ready ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${tone}`}>{label}</span>;
}

function StatCard({ label, value, icon, tone, onClick }: { label: string; value: number; icon: StreamlineIconName; tone: 'blue'|'amber'|'green'; onClick: () => void }) {
  const tones = { blue: 'bg-blue-50 text-blue-700', amber: 'bg-amber-50 text-amber-700', green: 'bg-emerald-50 text-emerald-700' };
  return <button type="button" onClick={onClick} className="group flex min-h-28 items-center justify-between rounded-2xl border border-[#DDE3DC] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 sm:p-5"><span className="block"><span className="block text-xs font-semibold text-slate-500">{label}</span><span className="mt-1 block text-2xl font-extrabold text-slate-900">{value}</span><span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 group-hover:text-blue-700">Buka<ArrowUpRight className="h-3 w-3" /></span></span><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}><StreamlineDuotoneIcon name={icon} className="h-5 w-5" /></span></button>;
}

function IconButton({ label, onClick, danger = false, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return <button type="button" aria-label={label} title={label} onClick={onClick} className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${danger ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'}`}>{children}</button>;
}
