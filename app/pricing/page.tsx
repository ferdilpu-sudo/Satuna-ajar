import Link from 'next/link';
import PublicPageShell, { PublicSection } from '@/components/public/PublicPageShell';

const offers = [
  { name: 'Beli sekali', description: 'Satu pembayaran untuk satu kali generate perangkat ajar dengan AI.', price: process.env.NEXT_PUBLIC_PRICE_ONE_TIME },
  { name: 'Satuna Pro Bulanan', description: 'Akses berlangganan bulanan untuk penggunaan Satuna sesuai kuota paket.', price: process.env.NEXT_PUBLIC_PRICE_PRO_MONTHLY },
] as const;

function price(value: string | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? `Rp${amount.toLocaleString('id-ID')}` : 'Harga belum ditetapkan';
}

export default function PricingPage() {
  return <PublicPageShell title="Paket & Harga" intro="Pilihan pembayaran Satuna Ajar. Semua transaksi menggunakan Rupiah (IDR) dan harga final ditampilkan sebelum pembayaran.">
    <div className="grid gap-4 sm:grid-cols-2">{offers.map((offer) => <div key={offer.name} className="rounded-xl border border-slate-200 p-5"><h2 className="font-extrabold text-slate-950">{offer.name}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{offer.description}</p><p className="mt-4 text-xl font-black text-slate-950">{price(offer.price)}</p></div>)}</div>
    <PublicSection title="Status checkout"><p>Checkout pembayaran publik belum diaktifkan pada halaman ini. Setelah integrasi payment gateway selesai, setiap paket akan memiliki tombol pembayaran dan halaman konfirmasi transaksi.</p></PublicSection>
    <PublicSection title="Sebelum membeli"><p>Baca <Link href="/syarat-ketentuan" className="font-bold text-blue-700">Syarat & Ketentuan</Link> dan <Link href="/kebijakan-refund" className="font-bold text-blue-700">Kebijakan Refund</Link> sebelum melakukan pembayaran.</p></PublicSection>
  </PublicPageShell>;
}
