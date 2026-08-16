'use client';

import { CheckCircle2, ArrowRight } from 'lucide-react';
import StreamlineDuotoneIcon from '../icons/StreamlineDuotoneIcon';
import type { OutputConfig } from '../../types/rpp';

interface Props {
  selectedFormat: OutputConfig['format'];
  hasSelection: boolean;
  onSelect: (format: OutputConfig['format']) => void;
  onContinue: () => void;
}

export default function DocumentTypeStep({ selectedFormat, hasSelection, onSelect, onContinue }: Props) {
  return (
    <div className="space-y-6 rounded-2xl border border-[#DDE3DC] bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Pilih Jenis Dokumen Pembelajaran</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pilih dokumen yang ingin disiapkan. Satuna Ajar akan menyesuaikan struktur dan kelengkapannya.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* RPP Ringkas Option */}
        <div
          onClick={() => onSelect('Ringkas')}
          className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all hover:border-blue-400 ${
            selectedFormat === 'Ringkas' && hasSelection
              ? 'border-blue-600 bg-blue-50/40 shadow-sm'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          {selectedFormat === 'Ringkas' && hasSelection && (
            <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-blue-600" />
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <StreamlineDuotoneIcon name="document" className="h-5 w-5" />
            </div>
            <div>
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">RINGKAS</span>
              <h3 className="text-base font-bold text-slate-900">RPP Ringkas</h3>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
            Format esensial 1-3 halaman. Cocok untuk administrasi praktis sehari-hari (Identitas, TP, Langkah PBL Deep Learning, Asesmen Ringkas & Sumber).
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            <li className="flex items-center gap-1.5"><span className="text-blue-600">•</span> Struktur Kompak (A–F)</li>
            <li className="flex items-center gap-1.5"><span className="text-blue-600">•</span> Efisien & Cepat Ditinjau</li>
          </ul>
        </div>

        {/* Modul Ajar Lengkap Option */}
        <div
          onClick={() => onSelect('Lengkap')}
          className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all hover:border-indigo-400 ${
            selectedFormat === 'Lengkap' && hasSelection
              ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
              : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          {selectedFormat === 'Lengkap' && hasSelection && (
            <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-indigo-600" />
          )}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <StreamlineDuotoneIcon name="module" className="h-5 w-5" />
            </div>
            <div>
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">LENGKAP</span>
              <h3 className="text-base font-bold text-slate-900">Modul Ajar Kurikulum Merdeka</h3>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
            Dokumen lebih lengkap (Komponen A–N) dengan Dimensi Profil Lulusan (DPL), sarana digital, rubrik 4 skor, LKPD, soal sumatif, dan pemetaan TP.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-slate-500">
            <li className="flex items-center gap-1.5"><span className="text-indigo-600">•</span> Struktur Lengkap 14-15 Komponen</li>
            <li className="flex items-center gap-1.5"><span className="text-indigo-600">•</span> Dilengkapi Rubrik 4-Skor & LKPD</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onContinue}
          disabled={!hasSelection}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          Lanjut ke Identitas <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
