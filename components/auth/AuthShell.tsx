import Link from 'next/link';
import { CheckCircle2, FileText, ShieldCheck, Sparkles } from 'lucide-react';
import React from 'react';
import SatunaMark from '@/components/SatunaMark';
import { BRAND } from '@/lib/brand';

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  compact?: boolean;
  fitViewport?: boolean;
}

const BENEFITS = [
  {
    icon: FileText,
    title: 'Perangkat ajar lebih cepat',
    description: 'Susun RPP, Modul Ajar, asesmen, dan dokumen pembelajaran dari satu ruang kerja.',
  },
  {
    icon: Sparkles,
    title: 'AI yang tetap dalam kendali Anda',
    description: 'Tinjau dan sunting hasilnya sebelum digunakan. Anda tetap memegang keputusan akhir.',
  },
  {
    icon: ShieldCheck,
    title: 'Dokumen tetap milik Anda',
    description: 'Riwayat kerja tersimpan rapi dan dapat dibuka kembali saat dibutuhkan.',
  },
];

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  compact = false,
  fitViewport = false,
}: Props) {
  const dense = compact || fitViewport;

  return (
    <main className={`min-h-screen bg-[#F4F6F2] text-slate-900 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)] ${fitViewport ? 'auth-shell--fit-viewport' : ''}`}>
      <section className={`auth-shell-left relative hidden overflow-hidden border-r border-blue-100 bg-[#EEF4FF] lg:flex lg:min-h-screen lg:flex-col lg:px-12 xl:px-16 ${dense ? 'lg:py-6' : 'lg:py-10'}`}>
        <div className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute -right-20 bottom-14 h-80 w-80 rounded-full bg-white/70 blur-3xl" />

        <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-3 rounded-2xl focus-visible:outline-none">
          <SatunaMark className="h-11 w-11 rounded-[14px]" />
          <span>
            <span className="block text-[17px] font-extrabold tracking-[-0.02em] text-slate-950">{BRAND.name}</span>
            <span className="block text-xs font-medium text-slate-500">{BRAND.tagline}</span>
          </span>
        </Link>

        <div className={`auth-shell-left-content relative z-10 my-auto max-w-xl ${dense ? 'py-5' : 'py-12'}`}>
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
            Ruang kerja digital guru
          </span>
          <h1 className={`auth-shell-heading max-w-[620px] font-black leading-[1.08] tracking-[-0.04em] text-slate-950 ${dense ? 'mt-4 text-[38px] xl:text-[42px]' : 'mt-6 text-4xl xl:text-[46px]'}`}>
            Lebih sedikit waktu untuk administrasi. Lebih banyak untuk mengajar.
          </h1>
          <p className={`auth-shell-description max-w-lg text-slate-600 ${dense ? 'mt-3 text-sm leading-6' : 'mt-5 text-base leading-7'}`}>
            Satuna Ajar membantu guru merencanakan pembelajaran, menyiapkan asesmen, dan mengelola perangkat ajar dalam satu tempat.
          </p>

          <div className={`auth-shell-benefits ${dense ? 'mt-5 space-y-2.5' : 'mt-9 space-y-4'}`}>
            {BENEFITS.map(({ icon: Icon, title: itemTitle, description: itemDescription }) => (
              <div key={itemTitle} className={`auth-shell-benefit flex max-w-lg rounded-2xl border border-white/80 bg-white/70 shadow-[0_8px_28px_rgba(37,99,235,0.05)] backdrop-blur-sm ${dense ? 'gap-3 p-3' : 'gap-3.5 p-4'}`}>
                <span className={`auth-shell-benefit-icon flex shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ${dense ? 'h-9 w-9' : 'h-10 w-10'}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span>
                  <span className={`auth-shell-benefit-title block font-bold text-slate-900 ${dense ? 'text-[13px]' : 'text-sm'}`}>{itemTitle}</span>
                  <span className={`auth-shell-benefit-description block text-slate-600 ${dense ? 'mt-0.5 text-xs leading-[18px]' : 'mt-1 text-[13px] leading-5'}`}>{itemDescription}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-shell-footer relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Kurikulum Merdeka · Pembelajaran Mendalam
        </div>
      </section>

      <section className={`auth-shell-right flex min-h-screen items-center justify-center px-5 sm:px-8 lg:px-12 ${dense ? 'py-5 lg:py-4' : 'py-8'}`}>
        <div className={`auth-shell-right-inner w-full ${dense ? 'max-w-[460px]' : 'max-w-[480px]'}`}>
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-xl">
              <SatunaMark className="h-10 w-10" />
              <span>
                <span className="block text-sm font-extrabold text-slate-950">{BRAND.name}</span>
                <span className="block text-[11px] text-slate-500">{BRAND.tagline}</span>
              </span>
            </Link>
          </div>

          <div className={`auth-shell-card rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.07)] ${dense ? 'p-6' : 'p-6 sm:p-8'}`}>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>
            <h2 className={`auth-shell-card-title mt-2 font-black tracking-[-0.035em] text-slate-950 ${dense ? 'text-[26px]' : 'text-[28px]'}`}>{title}</h2>
            <p className={`auth-shell-card-description mt-2 text-sm text-slate-500 ${dense ? 'leading-5' : 'leading-6'}`}>{description}</p>
            <div className={`auth-shell-card-content ${dense ? 'mt-5' : 'mt-7'}`}>{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
