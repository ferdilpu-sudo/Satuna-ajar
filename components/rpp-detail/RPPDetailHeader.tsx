import type { ElementType, ReactNode } from 'react';
import { ArrowLeft, Check, Download, Printer, Save } from 'lucide-react';
import StreamlineDuotoneIcon from '../icons/StreamlineDuotoneIcon';
import type { RPPData } from '../../types/rpp';
import { formatPhase } from '../../lib/validation';

interface Props {
  rpp: RPPData; isSaved: boolean; isEditing: boolean; onBack: () => void; onEdit: () => void; onSave: () => void; onDoc: () => void; onPrint: () => void;
}

export default function RPPDetailHeader({ rpp, isSaved, isEditing, onBack, onEdit, onSave, onDoc, onPrint }: Props) {
  const ready = rpp.status === 'Selesai';
  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-[#DDE3DC] bg-white p-4 shadow-sm sm:p-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <button type="button" onClick={onBack} aria-label="Kembali" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E1E6E0] text-slate-500 hover:bg-slate-50 hover:text-slate-900"><ArrowLeft className="h-5 w-5" /></button>
        <div className="min-w-0">
          <h1 className="max-w-4xl text-base font-extrabold leading-6 text-slate-900 sm:text-lg">{rpp.identity.subject} · {rpp.identity.topic}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-700">{formatPhase(rpp.identity.phase)}</span>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-extrabold ${ready ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>{ready ? 'Siap Digunakan' : 'Draft'}</span>
            <span className="text-[11px] text-slate-500">{rpp.identity.grade} · {rpp.identity.totalMinutes} menit · {rpp.documentFormat === 'Ringkas' ? 'RPP Ringkas' : 'Modul Ajar Lengkap'}</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 lg:justify-end">
        {isEditing ? <span className="inline-flex min-h-10 items-center rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-blue-700">Mode Sunting Aktif</span> : <>
          <button type="button" onClick={onEdit} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#DDE3DC] bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"><StreamlineDuotoneIcon name="edit" className="h-4 w-4 text-blue-600" />Sunting</button>
          <Action onClick={onSave} icon={isSaved ? Check : Save} primary>{isSaved ? 'Tersimpan' : 'Simpan'}</Action>
          <ExportMenu onDoc={onDoc} onPrint={onPrint} />
        </>}
      </div>
    </header>
  );
}

function ExportMenu({ onDoc, onPrint }: { onDoc: () => void; onPrint: () => void }) {
  return <details className="relative">
    <summary className="inline-flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-[#DDE3DC] bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"><Download className="h-4 w-4" />Unduh</summary>
    <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-[#DDE3DC] bg-white p-1.5 shadow-lg">
      <button type="button" onClick={onDoc} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"><StreamlineDuotoneIcon name="document" className="h-4 w-4 text-blue-600" />Download DOCX</button>
      <button type="button" onClick={onPrint} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"><Printer className="h-4 w-4 text-blue-600" />PDF / Cetak</button>
      <p className="border-t border-slate-100 px-3 pt-2 text-[9px] leading-4 text-slate-400">Ekspor selalu berupa dokumen final tanpa status, warning, atau catatan review AI.</p>
    </div>
  </details>;
}

function Action({ onClick, icon: Icon, primary = false, children }: { onClick: () => void; icon: ElementType; primary?: boolean; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${primary ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-[#DDE3DC] bg-white text-slate-700 hover:bg-slate-50'}`}><Icon className="h-4 w-4" />{children}</button>;
}
