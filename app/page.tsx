import Link from 'next/link';
import { ArrowRight, FileText, Sparkles, Upload, WalletCards } from 'lucide-react';
import SatunaMark from '@/components/SatunaMark';
import { BRAND } from '@/lib/brand';
import { PUBLIC_LINKS } from '@/lib/public-site';

const FEATURES = [
  {
    icon: Upload,
    title: 'Mulai dari materi yang Anda punya',
    description: 'Masukkan topik atau lampirkan materi. Satuna Ajar membantu mengolahnya menjadi dasar penyusunan perangkat ajar.',
  },
  {
    icon: Sparkles,
    title: 'Susun RPP dan Modul Ajar lebih cepat',
    description: 'AI membantu menyiapkan tujuan, kegiatan pembelajaran, asesmen, rubrik, dan komponen penting lainnya secara terstruktur.',
  },
  {
    icon: FileText,
    title: 'Tinjau, edit, lalu gunakan',
    description: 'Hasil tetap dapat Anda periksa dan sunting sebelum diekspor ke DOCX atau PDF.',
  },
] as const;

const STEPS = [
  ['1', 'Masukkan materi dan konteks', 'Pilih jenis dokumen, isi kebutuhan pembelajaran, lalu tambahkan materi atau topik.'],
  ['2', 'Biarkan AI membantu menyusun', 'Satuna Ajar menyiapkan struktur perangkat ajar berdasarkan informasi yang Anda berikan.'],
  ['3', 'Tinjau dan ekspor', 'Periksa hasil, lakukan penyesuaian, lalu unduh dokumen yang siap digunakan.'],
] as const;

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4F6F2] text-slate-700">
      <header className="sticky top-0 z-30 border-b border-[#DDE3DC] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="Satuna Ajar - Beranda">
            <SatunaMark />
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-tight text-slate-950">{BRAND.name}</p>
              <p className="hidden text-[10px] font-semibold text-slate-500 sm:block">{BRAND.tagline}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 md:flex" aria-label="Navigasi utama">
            <Link href="#fitur" className="hover:text-blue-700">Fitur</Link>
            <Link href="/pricing" className="hover:text-blue-700">Paket & Harga</Link>
            <Link href="/faq" className="hover:text-blue-700">FAQ</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex min-h-10 items-center justify-center rounded-xl px-3 text-xs font-extrabold text-slate-700 hover:bg-slate-100 sm:px-4 sm:text-sm">
              Masuk
            </Link>
            <Link href="/daftar" className="inline-flex min-h-10 items-center justify-center rounded-xl bg-blue-600 px-3 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700 sm:px-4 sm:text-sm">
              Coba gratis
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-extrabold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Asisten penyusunan perangkat ajar
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
              RPP dan Modul Ajar, disusun lebih cepat.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Mulai dari materi yang Anda punya. Satuna Ajar membantu menyusun perangkat pembelajaran yang terstruktur, mudah ditinjau, dan tetap dapat Anda edit sebelum digunakan.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/daftar" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700">
                Mulai gratis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-extrabold text-slate-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                <WalletCards className="h-4 w-4" /> Lihat paket
              </Link>
            </div>

            <p className="mt-5 text-sm font-semibold text-slate-500">
              Akun baru mendapat 3 kali generate AI gratis.
            </p>
          </div>

          <div className="rounded-[28px] border border-[#DDE3DC] bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-7">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Cara kerja</p>
              <h2 className="mt-2 text-xl font-black text-slate-950">Dari materi menjadi perangkat ajar</h2>
            </div>
            <ol className="mt-5 space-y-5">
              {STEPS.map(([number, title, description]) => (
                <li key={number} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">{number}</span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="fitur" className="scroll-mt-24 border-y border-[#DDE3DC] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Lebih sedikit pekerjaan berulang</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Fokus pada isi pembelajaran, bukan menyusun semuanya dari nol.</h2>
              <p className="mt-3 leading-7 text-slate-600">Satuna Ajar membantu mempercepat bagian yang paling menyita waktu, tanpa mengambil alih keputusan akhir Anda sebagai pendidik.</p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="rounded-2xl border border-[#DDE3DC] bg-[#FAFBF9] p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-4 font-extrabold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="rounded-3xl border border-blue-100 bg-blue-50/70 px-6 py-8 sm:px-8 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Mulai sesuai kebutuhan</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">Coba gratis, lanjutkan saat Anda membutuhkannya.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Gunakan 3 kali generate AI gratis. Setelah itu, pilih paket sekali beli atau Satuna Pro Bulanan sesuai ritme kerja Anda.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
              <Link href="/daftar" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700">
                Coba gratis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex min-h-11 items-center rounded-xl border border-blue-200 bg-white px-4 text-sm font-extrabold text-blue-700 hover:bg-blue-50">
                Lihat Paket & Harga
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#DDE3DC] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black text-slate-950">{BRAND.name}</p>
            <p className="mt-1 text-xs text-slate-500">Membantu guru menyiapkan perangkat pembelajaran dengan lebih efisien.</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500" aria-label="Tautan informasi">
            {PUBLIC_LINKS.map((item) => <Link key={item.href} href={item.href} className="hover:text-blue-700">{item.label}</Link>)}
          </nav>
        </div>
      </footer>
    </div>
  );
}
