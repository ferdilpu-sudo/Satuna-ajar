import Link from 'next/link';
import PublicPageShell, { PublicSection } from '@/components/public/PublicPageShell';
import { listPublicPlans } from '@/lib/payment/catalog-service';
import type { PublicPlan } from '@/types/payment';

export const dynamic = 'force-dynamic';

const descriptions: Record<string, string> = {
  'generate-1': 'Satu kali generate perangkat ajar dengan AI.',
  'generate-3': 'Tiga kali generate perangkat ajar untuk kebutuhan sesekali.',
  'generate-5': 'Lima kali generate perangkat ajar dengan harga lebih hemat.',
  'generate-10': 'Sepuluh kali generate perangkat ajar untuk penggunaan lebih rutin.',
  'pro-monthly': 'Langganan Satuna Pro bulanan. Detail batas penggunaan AI akan ditampilkan sebelum checkout Pro diaktifkan.',
};

export default async function PricingPage() {
  const offers = await listPublicPlans();

  return <PublicPageShell title="Paket & Harga" intro="Pilihan pembayaran Satuna Ajar. Semua transaksi menggunakan Rupiah (IDR) dan harga final ditampilkan sebelum pembayaran.">
    <div className="grid gap-4 sm:grid-cols-2">{offers.map((offer) => <OfferCard key={offer.code} offer={offer} />)}</div>
    <PublicSection title="Cara kerja paket generate"><p>Pembelian paket menambahkan hak generate ke akun Satuna Anda. Hak hanya dikonsumsi untuk proses generate yang berhasil. Jika proses gagal karena gangguan sistem, hak generate tidak hangus.</p></PublicSection>
    <PublicSection title="Status checkout"><p>Checkout pembayaran publik belum diaktifkan selama payment gateway masih dalam proses review. Harga dan produk di halaman ini sudah dibaca dari katalog billing Satuna.</p></PublicSection>
    <PublicSection title="Sebelum membeli"><p>Baca <Link href="/syarat-ketentuan" className="font-bold text-blue-700">Syarat & Ketentuan</Link> dan <Link href="/kebijakan-refund" className="font-bold text-blue-700">Kebijakan Refund</Link> sebelum melakukan pembayaran.</p></PublicSection>
  </PublicPageShell>;
}

function OfferCard({ offer }: { offer: PublicPlan }) {
  const recurring = offer.billingType === 'subscription';
  return <div className="rounded-xl border border-slate-200 p-5">
    <h2 className="font-extrabold text-slate-950">{offer.name}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{descriptions[offer.code] ?? 'Paket layanan Satuna Ajar.'}</p>
    <p className="mt-4 text-xl font-black text-slate-950">{rupiah(offer.priceAmount)}{recurring && offer.intervalUnit === 'month' ? <span className="text-sm font-bold text-slate-500"> / bulan</span> : null}</p>
    {offer.generationQuota ? <p className="mt-1 text-xs font-semibold text-slate-500">Hak penggunaan: {offer.generationQuota}x generate AI</p> : null}
  </div>;
}

function rupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`;
}
