'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0B0D] text-slate-200 flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-2 text-blue-400">404 - Halaman Tidak Ditemukan</h1>
      <p className="text-slate-400 mb-6 max-w-md">
        Halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
