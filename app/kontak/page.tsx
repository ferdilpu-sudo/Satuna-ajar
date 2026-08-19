import PublicPageShell, { PublicSection } from '@/components/public/PublicPageShell';
import { PUBLIC_SITE } from '@/lib/public-site';

export default function ContactPage() {
  return <PublicPageShell title="Kontak" intro="Kanal resmi untuk pertanyaan layanan, pembayaran, refund, dan privasi Satuna Ajar.">
    <PublicSection title="Kontak resmi"><p>Email: <a className="font-bold text-blue-700" href={`mailto:${PUBLIC_SITE.email}`}>{PUBLIC_SITE.email}</a></p><p>Telepon/WhatsApp: <a className="font-bold text-blue-700" href={`tel:${PUBLIC_SITE.phone}`}>{PUBLIC_SITE.phone}</a></p><p>Jam dukungan: {PUBLIC_SITE.supportHours}</p></PublicSection>
    <PublicSection title="Informasi usaha"><p>{PUBLIC_SITE.businessName}</p><p>{PUBLIC_SITE.operator}</p><p>{PUBLIC_SITE.operationalAddress}</p></PublicSection>
    <PublicSection title="Keamanan komunikasi"><p>Satuna tidak akan meminta kata sandi, OTP, PIN, atau kode keamanan kartu melalui email, telepon, WhatsApp, maupun media sosial.</p></PublicSection>
  </PublicPageShell>;
}
