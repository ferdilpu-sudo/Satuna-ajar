'use client';

import React, { useState } from 'react';
import type { RPPData } from '@/types/rpp';
import { formatDateIndonesian } from '@/lib/utils';
import { exportRPPToDocx, printRPPToPDF } from '@/lib/export';
import { Download, Filter, Printer, Search } from 'lucide-react';
import StreamlineDuotoneIcon from './icons/StreamlineDuotoneIcon';

interface HistoryViewProps {
  rppList: RPPData[];
  onViewRPP: (rpp: RPPData) => void;
  onEditRPP: (rpp: RPPData) => void;
  onDuplicateRPP: (id: string) => void;
  onDeleteRPP: (id: string) => void;
  onNewRPPClick: () => void;
}

export default function HistoryView({ rppList, onViewRPP, onEditRPP, onDuplicateRPP, onDeleteRPP, onNewRPPClick }: HistoryViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Selesai' | 'Draft'>('All');

  const filteredRPPs = rppList.filter((rpp) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = rpp.identity.subject.toLowerCase().includes(query) || rpp.identity.topic.toLowerCase().includes(query) || rpp.identity.schoolName.toLowerCase().includes(query);
    return matchesSearch && (statusFilter === 'All' || rpp.status === statusFilter);
  });

  return (
    <div className="space-y-6 pb-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">Dokumen</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Dokumen tersimpan</h1>
          <p className="mt-1 text-sm text-slate-500">Cari, buka, ekspor, atau kelola perangkat pembelajaran yang pernah dibuat.</p>
        </div>
        <button type="button" onClick={onNewRPPClick} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
          <StreamlineDuotoneIcon name="add" className="h-4 w-4" secondaryOpacity={0.28} />Dokumen Baru
        </button>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-[#DDE3DC] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative min-w-0 flex-1 md:max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Cari mapel, topik, atau sekolah..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-[#DDE3DC] bg-[#FBFCFA] py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="h-4 w-4 text-slate-400" />
          {(['All', 'Selesai', 'Draft'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`min-h-9 rounded-lg px-3 font-bold transition-colors ${statusFilter === status ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}
            >
              {status === 'All' ? 'Semua' : status === 'Selesai' ? 'Siap' : 'Draft'}
            </button>
          ))}
        </div>
      </section>

      {filteredRPPs.length === 0 ? (
        <section className="rounded-2xl border border-[#DDE3DC] bg-white px-6 py-14 text-center shadow-sm">
          <StreamlineDuotoneIcon name="document" className="mx-auto h-11 w-11 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-800">Tidak ada dokumen ditemukan</p>
          <p className="mt-1 text-xs text-slate-500">Ubah pencarian atau filter untuk melihat dokumen lain.</p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-[#DDE3DC] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#F8FAF7] text-[11px] uppercase tracking-wide text-slate-500">
                <tr><th className="px-5 py-3">Mata Pelajaran & Topik</th><th className="px-4 py-3">Kelas / Fase</th><th className="px-4 py-3">Model & Waktu</th><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-[#EDF0EC]">
                {filteredRPPs.map((rpp) => (
                  <tr key={rpp.id} className="hover:bg-[#FAFBF9]">
                    <td className="px-5 py-4"><p className="font-bold text-slate-900">{rpp.identity.subject}</p><p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{rpp.identity.topic}</p></td>
                    <td className="px-4 py-4 text-slate-600">{rpp.identity.grade} · Fase {rpp.identity.phase}</td>
                    <td className="px-4 py-4"><p className="font-semibold text-slate-700">{rpp.learningSettings.resolvedModel || rpp.learningSettings.model}</p><p className="text-xs text-slate-500">{rpp.identity.totalMinutes} menit</p></td>
                    <td className="px-4 py-4 text-xs text-slate-500">{formatDateIndonesian(rpp.createdAt)}</td>
                    <td className="px-4 py-4"><StatusBadge status={rpp.status} /></td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-1">
                      <Action label="Lihat" onClick={() => onViewRPP(rpp)}><StreamlineDuotoneIcon name="view" className="h-4 w-4" /></Action>
                      <Action label="Edit" onClick={() => onEditRPP(rpp)}><StreamlineDuotoneIcon name="edit" className="h-4 w-4" /></Action>
                      <Action label="Duplikat" onClick={() => onDuplicateRPP(rpp.id)}><StreamlineDuotoneIcon name="duplicate" className="h-4 w-4" /></Action>
                      <Action label="DOCX" onClick={() => exportRPPToDocx(rpp)}><Download className="h-4 w-4" /></Action>
                      <Action label="PDF" onClick={() => printRPPToPDF(rpp)}><Printer className="h-4 w-4" /></Action>
                      <Action label="Hapus" danger onClick={() => onDeleteRPP(rpp.id)}><StreamlineDuotoneIcon name="delete" className="h-4 w-4" /></Action>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: RPPData['status'] }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${status === 'Selesai' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>{status === 'Selesai' ? 'Siap' : 'Draft'}</span>;
}

function Action({ label, onClick, danger = false, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return <button type="button" title={label} aria-label={label} onClick={onClick} className={`flex h-9 w-9 items-center justify-center rounded-lg ${danger ? 'text-slate-400 hover:bg-rose-50 hover:text-rose-600' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'}`}>{children}</button>;
}
