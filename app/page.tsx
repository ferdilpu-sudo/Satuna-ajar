import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, Sparkles, Upload, WalletCards } from 'lucide-react';
import SatunaMark from '@/components/SatunaMark';
import { BRAND } from '@/lib/brand';
import { PUBLIC_LINKS } from '@/lib/public-site';

const FEATURES = [
  {
    icon: Upload,
    title: 'Analisis materi',
    description: 'Gunakan teks, PDF, DOCX, TXT, atau gambar sebagai bahan penyusunan perangkat ajar.',
  },
  {
    icon: Sparkles,
    title: 'RPP & Modul Ajar dengan AI',
    description: 'Susun tujuan, kegiatan pembelajaran, asesmen, rubrik, dan komponen pendukung secara terstruktur.',
  },
  {
    icon: FileText,
    title: 'Edit & ekspor',
    description: 'Tinjau hasil, lakukan penyuntingan, lalu ekspor dokumen ke DOCX/PDF untuk digunakan atau dicetak.',
  },
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

          <nav className="hidden items-center gap-5 text-sm font-bold text-slate-600 md:flex" aria-label="Navigasi publik">
            <Link href="/pricing" className="hover:text-blue-700">Paket & Harga</Link>
            <Link href="/faq" className="hover:text-blue-700">FAQ</Link>
            <Link href="/kontak" className="hover:text-blue-700">Kontak</Link>
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
              Ruang kerja digital untuk guru
            </div>
            <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
              Siapkan perangkat ajar lebih cepat, tetap dalam kendali Anda.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Satuna Ajar membantu guru menyusun RPP Ringkas dan Modul Ajar, menganalisis materi, meninjau hasil, lalu mengekspor dokumen yang siap digunakan.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/daftar" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white shadow-sm hover:bg-blue-700">
                Mulai gratis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-extrabold text-slate-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                <WalletCards className="h-4 w-4" /> Paket & Harga
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> 3 generasi AI gratis</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Tanpa barang fisik</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Transaksi dalam Rupiah (IDR)</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#DDE3DC] bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-7">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Alur layanan</p>
              <h2 className="mt-2 text-xl font-black text-slate-950">Dari materi menjadi dokumen siap pakai</h2>
            </div>
            <ol className="mt-5 space-y-4">
              {[
                ['1', 'Masukkan kebutuhan pembelajaran', 'Pilih RPP Ringkas atau Modul Ajar dan isi identitas pembelajaran.'],
                ['2', 'Tambahkan materi', 'Lampirkan materi atau topik yang akan digunakan sebagai dasar penyusunan.'],
                ['3', 'AI menyusun perangkat ajar', 'Sistem membantu menyusun komponen pembelajaran dan asesmen.'],
                ['4', 'Tinjau, edit, dan ekspor', 'Periksa hasil akhir lalu unduh dalam format dokumen digital.'],
              ].map(([number, title, description]) => (
                <li key={number} className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-black text-white">{number}</span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-[#DDE3DC] bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Layanan Satuna Ajar</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Satu alur kerja untuk menyiapkan perangkat pembelajaran</h2>
              <p className="mt-3 leading-7 text-slate-600">Produk Satuna Ajar adalah layanan digital berbasis web. Pengguna memperoleh akses melalui akun dan hasil layanan diserahkan dalam bentuk dokumen digital.</p>
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
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-6 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-blue-700">Paket layanan</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Harga jelas sebelum pembelian</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Lihat seluruh paket sekali beli dan Satuna Pro Bulanan pada halaman harga. Seluruh nominal ditampilkan dalam Rupiah (IDR).</p>
              <Link href="/pricing" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-extrabold text-white hover:bg-blue-700">
                Lihat Paket & Harga <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-[#DDE3DC] bg-white p-6 sm:p-8">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">Informasi merchant</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Informasi layanan dapat diperiksa tanpa login</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">Paket, FAQ, syarat layanan, kebijakan refund, privasi, dan kontak resmi tersedia sebagai halaman publik untuk pengguna maupun proses verifikasi payment gateway.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {PUBLIC_LINKS.map((item) => (
                  <Link key={item.href} href={item.href} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#DDE3DC] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-7 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-black text-slate-950">{BRAND.name}</p>
            <p className="mt-1 text-xs text-slate-500">Layanan digital untuk membantu guru menyiapkan perangkat pembelajaran.</p>
          </div>
          <nav className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-slate-500" aria-label="Informasi merchant">
            {PUBLIC_LINKS.map((item) => <Link key={item.href} href={item.href} className="hover:text-blue-700">{item.label}</Link>)}
          </nav>
        </div>
      </footer>
    </div>
  );
}
