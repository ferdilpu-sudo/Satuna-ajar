import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { PUBLIC_LINKS } from '@/lib/public-site';

export default function PublicPageShell({ title, intro, children }: { title: string; intro: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F6F2] text-slate-700">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="font-black text-slate-950">{BRAND.name}</Link>
          <nav className="hidden gap-4 text-xs font-bold text-slate-500 md:flex">{PUBLIC_LINKS.slice(0, 3).map((item) => <Link key={item.href} href={item.href} className="hover:text-blue-700">{item.label}</Link>)}</nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">Satuna Ajar</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1><p className="mt-3 leading-7 text-slate-600">{intro}</p></div>
        <article className="space-y-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">{children}</article>
      </main>
      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto flex max-w-5xl flex-wrap gap-x-4 gap-y-2 px-4 py-6 text-xs text-slate-500 sm:px-6">{PUBLIC_LINKS.map((item) => <Link key={item.href} href={item.href} className="hover:text-blue-700">{item.label}</Link>)}</div></footer>
    </div>
  );
}

export function PublicSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h2 className="text-lg font-extrabold text-slate-950">{title}</h2><div className="mt-2 space-y-2 text-sm leading-7 text-slate-600">{children}</div></section>;
}
