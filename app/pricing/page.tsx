import Link from 'next/link';
import PublicPageShell, { PublicSection } from '@/components/public/PublicPageShell';

const offers = [
  { name: '1x Generate AI', description: 'Satu kali generate perangkat ajar dengan AI.', price: 7_000, quota: '1x generate AI' },
  { name: 'Paket 3x Generate AI', description: 'Tiga kali generate perangkat ajar. Cocok untuk kebutuhan sesekali.', price: 15_000, quota: '3x generate AI' },
  { name: 'Paket 5x Generate AI', description: 'Lima kali generate perangkat ajar dengan harga lebih hemat.', price: 25_000, quota: '5x generate AI' },
  { name: 'Paket 10x Generate AI', description: 'Sepuluh kali generate perangkat ajar untuk penggunaan lebih rutin.', price: 35_000, quota: '10x generate AI' },
  { name: 'Satuna Pro Bulanan', description: 'Langganan Satuna Pro selama satu bulan untuk akses fitur premium Satuna Ajar.', price: 59_000, quota: 'Masa aktif 1 bulan' },
] as const;

function rupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`;
}

export default function PricingPage() {
  return <PublicPageShell title="Paket & Harga" intro="Pilihan pembayaran Satuna Ajar. Semua transaksi menggunakan Rupiah (IDR) dan harga final ditampilkan sebelum pembayaran.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{offers.map((offer) => <div key={offer.name} className="rounded-xl border border-slate-200 p-5"><h2 className="font-extrabold text-slate-950">{offer.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{offer.description}</p><p className="mt-4 text-xl font-black text-slate-950">{rupiah(offer.price)}</p><p className="mt-1 text-xs font-semibold text-slate-500">{offer.quota}</p></div>)}</div>
    <PublicSection title="Cara kerja paket generate"><p>Pembelian paket menambahkan hak generate ke akun Satuna Anda. Hak hanya dikonsumsi untuk proses generate yang berhasil. Jika proses gagal karena gangguan sistem, hak generate tidak hangus.</p></PublicSection>
    <PublicSection title="Satuna Pro"><p>Satuna Pro ditagihkan Rp59.000 per bulan. Fitur dan batas penggunaan AI yang termasuk dalam paket akan ditampilkan dengan jelas sebelum checkout diaktifkan.</p></PublicSection>
    <PublicSection title="Status checkout"><p>Checkout pembayaran publik belum diaktifkan pada halaman ini. Setelah integrasi payment gateway selesai, setiap paket akan memiliki tombol pembayaran dan halaman konfirmasi transaksi.</p></PublicSection>
    <PublicSection title="Sebelum membeli"><p>Baca <Link href="/syarat-ketentuan" className="font-bold text-blue-700">Syarat & Ketentuan</Link> dan <Link href="/kebijakan-refund" className="font-bold text-blue-700">Kebijakan Refund</Link> sebelum melakukan pembayaran.</p></PublicSection>
  </PublicPageShell>;
}
