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
}

const BENEFITS = [
  {
    icon: FileText,
    title: 'Perangkat ajar lebih cepat',
    description: 'Susun RPP, Modul Ajar, asesmen, dan dokumen pembelajaran dari satu ruang kerja.',
  },
  {
    icon: Sparkles,
    title: 'AI yang tetap bisa Anda kendalikan',
    description: 'Tinjau, sunting, dan ekspor hasil tanpa kehilangan kendali sebagai guru.',
  },
  {
    icon: ShieldCheck,
    title: 'Dokumen tetap milik Anda',
    description: 'Riwayat kerja tersimpan rapi dan dapat dibuka kembali saat dibutuhkan.',
  },
];

export default function AuthShell({ eyebrow, title, description, children }: Props) {
  return (
    <main className="min-h-screen bg-[#F4F6F2] text-slate-900 lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]">
      <section className="relative hidden overflow-hidden border-r border-blue-100 bg-[#EEF4FF] lg:flex lg:min-h-screen lg:flex-col lg:px-12 lg:py-10 xl:px-16">
        <div className="absolute -left-24 top-28 h-72 w-72 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute -right-20 bottom-14 h-80 w-80 rounded-full bg-white/70 blur-3xl" />

        <Link href="/" className="relative z-10 inline-flex w-fit items-center gap-3 rounded-2xl focus-visible:outline-none">
          <SatunaMark className="h-11 w-11 rounded-[14px]" />
          <span>
            <span className="block text-[17px] font-extrabold tracking-[-0.02em] text-slate-950">{BRAND.name}</span>
            <span className="block text-xs font-medium text-slate-500">{BRAND.tagline}</span>
          </span>
        </Link>

        <div className="relative z-10 my-auto max-w-xl py-12">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
            Ruang kerja digital guru
          </span>
          <h1 className="mt-6 max-w-[620px] text-4xl font-black leading-[1.08] tracking-[-0.04em] text-slate-950 xl:text-[46px]">
            Lebih sedikit waktu untuk administrasi. Lebih banyak untuk mengajar.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
            Satuna Ajar membantu guru merencanakan pembelajaran, menyiapkan asesmen, dan mengelola perangkat ajar dalam satu tempat.
          </p>

          <div className="mt-9 space-y-4">
            {BENEFITS.map(({ icon: Icon, title: itemTitle, description: itemDescription }) => (
              <div key={itemTitle} className="flex max-w-lg gap-3.5 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_8px_28px_rgba(37,99,235,0.05)] backdrop-blur-sm">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span>
                  <span className="block text-sm font-bold text-slate-900">{itemTitle}</span>
                  <span className="mt-1 block text-[13px] leading-5 text-slate-600">{itemDescription}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Kurikulum Merdeka · Pembelajaran Mendalam
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
        <div className="w-full max-w-[480px]">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5 rounded-xl">
              <SatunaMark className="h-10 w-10" />
              <span>
                <span className="block text-sm font-extrabold text-slate-950">{BRAND.name}</span>
                <span className="block text-[11px] text-slate-500">{BRAND.tagline}</span>
              </span>
            </Link>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.07)] sm:p-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-blue-600">{eyebrow}</p>
            <h2 className="mt-2 text-[28px] font-black tracking-[-0.035em] text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            <div className="mt-7">{children}</div>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Dengan menggunakan Satuna Ajar, Anda membantu kami menjaga ruang kerja guru tetap aman dan nyaman digunakan.
          </p>
        </div>
      </section>
    </main>
  );
}
