'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, ShoppingCart, X } from 'lucide-react';
import StreamlineDuotoneIcon from './icons/StreamlineDuotoneIcon';

interface GenerationProgressModalProps {
  isOpen: boolean;
  error?: string | null;
  isQuota?: boolean;
  errorCode?: string | null;
  onRetry?: () => void;
  onClose?: () => void;
}

const STEPS = [
  'Menganalisis materi...',
  'Menentukan tujuan pembelajaran...',
  'Memilih Dimensi Profil Lulusan...',
  'Menyusun strategi pembelajaran...',
  'Menyusun kegiatan pembelajaran mendalam...',
  'Membuat asesmen...',
  'Membuat rubrik...',
  'Membuat LKPD...',
  'Dokumen selesai.',
];

export default function GenerationProgressModal({
  isOpen,
  error,
  isQuota,
  errorCode,
  onRetry,
  onClose,
}: GenerationProgressModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) setCurrentStepIndex(0);
  }

  useEffect(() => {
    if (!isOpen || error) return;
    const interval = window.setInterval(
      () => setCurrentStepIndex((prev) => (prev < STEPS.length - 2 ? prev + 1 : prev)),
      1800,
    );
    return () => window.clearInterval(interval);
  }, [isOpen, error]);

  if (!isOpen) return null;

  if (error) {
    const isTrialExhausted = errorCode === 'TRIAL_EXHAUSTED';
    const isBalanceExhausted = errorCode === 'GENERATION_BALANCE_EXHAUSTED';
    const isAccessExhausted = isTrialExhausted || isBalanceExhausted;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
        <div className={`w-full max-w-md space-y-5 rounded-2xl border bg-white p-6 text-center shadow-2xl ${isAccessExhausted || isQuota ? 'border-amber-200' : 'border-rose-200'}`}>
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${isQuota || isAccessExhausted ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}`}>
            <AlertCircle className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              {isTrialExhausted
                ? 'Trial Satuna Selesai'
                : isBalanceExhausted
                  ? 'Saldo Generate Habis'
                  : isQuota
                    ? 'Batas Kuota AI Tercapai'
                    : 'Gagal Menyusun Dokumen'}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{error}</p>
            {isQuota && !isAccessExhausted && (
              <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-[11px] font-semibold text-amber-800">
                💡 Lalu lintas layanan AI sedang padat. Silakan tunggu 1–2 menit sebelum menekan tombol Coba Lagi.
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 border-t border-[#E6EAE5] pt-4">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[#DDE3DC] bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <X className="h-4 w-4" /> Tutup
              </button>
            )}
            {isAccessExhausted && (
              <Link
                href="/pricing"
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                <ShoppingCart className="h-4 w-4" /> Lihat Paket
              </Link>
            )}
            {onRetry && !isAccessExhausted && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" /> Coba Lagi
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentStepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-[#DDE3DC] bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <StreamlineDuotoneIcon name="magic" className="h-7 w-7 animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900">Sedang menyusun perangkat pembelajaran</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            AI menyusun perangkat pembelajaran. Hasil dapat langsung ditinjau dan disunting setelah selesai.
          </p>
        </div>
        <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-[#E1E6E0] bg-[#F8FAF7] p-4 text-left text-xs">
          {STEPS.map((stepText, index) => {
            const done = index < currentStepIndex;
            const current = index === currentStepIndex;
            return (
              <div key={stepText} className="flex items-center gap-2.5">
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : current ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600" />
                ) : (
                  <span className="h-4 w-4 shrink-0 rounded-full border border-slate-300" />
                )}
                <span className={done ? 'text-slate-400' : current ? 'font-bold text-blue-700' : 'text-slate-500'}>
                  {stepText}
                </span>
              </div>
            );
          })}
        </div>
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-[11px] font-semibold text-slate-500">{Math.round(progress)}% proses penyusunan</p>
        </div>
      </div>
    </div>
  );
}
