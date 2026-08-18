import Link from 'next/link';
import PublicPageShell, { PublicSection } from '@/components/public/PublicPageShell';
import PurchaseButton from '@/components/public/PurchaseButton';
import { listPublicPlans } from '@/lib/payment/catalog-service';
import { getPaymentRuntimeStatus } from '@/lib/payment/provider-registry';
import type { PublicPlan } from '@/types/payment';

export const dynamic = 'force-dynamic';

const descriptions: Record<string, string> = {
  'generate-1': 'Satu kali generate perangkat ajar dengan AI.',
  'generate-3': 'Tiga kali generate perangkat ajar untuk kebutuhan sesekali.',
  'generate-5': 'Lima kali generate perangkat ajar dengan harga lebih hemat.',
  'generate-10': 'Sepuluh kali generate perangkat ajar untuk penggunaan lebih rutin.',
  'pro-monthly': 'Langganan Satuna Pro bulanan dengan 20 kali generate AI pada setiap periode langganan.',
};

export default async function PricingPage() {
  const [offers, runtime] = await Promise.all([
    listPublicPlans(),
    Promise.resolve(getPaymentRuntimeStatus()),
  ]);

  return <PublicPageShell title="Paket & Harga" intro="Pilih paket sesuai kebutuhan. Harga berasal langsung dari katalog billing Satuna dan seluruh transaksi menggunakan Rupiah (IDR).">
    <div className="grid gap-4 sm:grid-cols-2">
      {offers.map((offer) => <OfferCard key={offer.code} offer={offer} checkoutEnabled={runtime.checkoutEnabled} />)}
    </div>
    <PublicSection title="Cara kerja pembelian"><p>Setelah pembayaran terkonfirmasi oleh payment gateway, paket generate otomatis ditambahkan ke akun. Satuna Pro memberikan 20 kali generate AI pada setiap periode langganan aktif.</p></PublicSection>
    <PublicSection title="Hak generate tidak hangus karena error"><p>Hak penggunaan hanya difinalisasi untuk proses generate yang berhasil. Jika proses gagal karena gangguan sistem atau AI, reservation dilepas kembali sehingga hak generate berbayar tidak terpotong.</p></PublicSection>
    {!runtime.checkoutEnabled ? <PublicSection title="Status pembayaran"><p>Payment gateway masih dalam proses review/aktivasi. Pilihan paket dan harga sudah final, sedangkan tombol pembayaran akan aktif otomatis setelah adapter provider disambungkan di server.</p></PublicSection> : null}
    <PublicSection title="Sebelum membeli"><p>Baca <Link href="/syarat-ketentuan" className="font-bold text-blue-700">Syarat & Ketentuan</Link> dan <Link href="/kebijakan-refund" className="font-bold text-blue-700">Kebijakan Refund</Link> sebelum melakukan pembayaran.</p></PublicSection>
  </PublicPageShell>;
}

function OfferCard({ offer, checkoutEnabled }: { offer: PublicPlan; checkoutEnabled: boolean }) {
  const recurring = offer.billingType === 'subscription';
  const featured = offer.code === 'generate-10' || offer.code === 'pro-monthly';

  return <div className={`flex flex-col rounded-2xl border p-5 ${featured ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-white'}`}>
    <div className="flex items-start justify-between gap-3">
      <h2 className="font-extrabold text-slate-950">{offer.name}</h2>
      {featured ? <span className="shrink-0 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-blue-700">Pilihan hemat</span> : null}
    </div>
    <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{descriptions[offer.code] ?? 'Paket layanan Satuna Ajar.'}</p>
    <p className="mt-4 text-2xl font-black text-slate-950">{rupiah(offer.priceAmount)}{recurring && offer.intervalUnit === 'month' ? <span className="text-sm font-bold text-slate-500"> / bulan</span> : null}</p>
    {offer.generationQuota ? <p className="mt-1 text-xs font-semibold text-slate-500">Termasuk {offer.generationQuota}x generate AI{recurring ? ' per bulan' : ''}</p> : null}
    <PurchaseButton planCode={offer.code} billingType={offer.billingType} checkoutEnabled={checkoutEnabled} />
  </div>;
}

function rupiah(value: number) {
  return `Rp${value.toLocaleString('id-ID')}`;
}
