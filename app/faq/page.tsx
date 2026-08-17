import Link from 'next/link';
import PublicPageShell, { PublicSection } from '@/components/public/PublicPageShell';
import { PUBLIC_SITE } from '@/lib/public-site';

export default function FaqPage() {
  return <PublicPageShell title="Pertanyaan yang Sering Diajukan" intro="Informasi dasar tentang layanan, pembayaran, data, dan dukungan Satuna Ajar.">
    <PublicSection title="Apa itu Satuna Ajar?"><p>Satuna Ajar adalah ruang kerja digital untuk membantu guru menyiapkan perangkat ajar, asesmen, dan dokumen pembelajaran dengan bantuan AI.</p></PublicSection>
    <PublicSection title="Apakah hasil AI langsung siap digunakan?"><p>Tidak selalu. Hasil AI perlu ditinjau guru dan disesuaikan dengan konteks sekolah, karakteristik peserta didik, kurikulum, serta kebijakan yang berlaku.</p></PublicSection>
    <PublicSection title="Bagaimana cara membeli layanan?"><p>Pilih paket yang tersedia pada <Link href="/pricing" className="font-bold text-blue-700">halaman Paket & Harga</Link>, masuk ke akun Satuna, lanjutkan checkout, lalu selesaikan pembayaran melalui metode yang tersedia.</p></PublicSection>
    <PublicSection title="Bagaimana Satuna melindungi data pengguna?"><p>Data diproses hanya untuk menjalankan layanan, keamanan, dukungan, transaksi, dan peningkatan produk. Rincian lebih lengkap tersedia pada <Link href="/kebijakan-privasi" className="font-bold text-blue-700">Kebijakan Privasi</Link>.</p></PublicSection>
    <PublicSection title="Apakah pembayaran dapat direfund?"><p>Refund dapat diajukan pada kondisi tertentu, misalnya pembayaran ganda atau layanan yang tidak diberikan karena kesalahan sistem. Lihat <Link href="/kebijakan-refund" className="font-bold text-blue-700">Kebijakan Refund</Link>.</p></PublicSection>
    <PublicSection title="Apakah Satuna merupakan layanan legal?"><p>{PUBLIC_SITE.businessName} dijalankan sebagai {PUBLIC_SITE.operator} di Indonesia dan digunakan untuk menyediakan layanan digital pendidikan. Informasi usaha dan pembayaran harus sesuai dengan dokumen merchant yang terdaftar.</p></PublicSection>
    <PublicSection title="Bagaimana menghubungi Satuna?"><p>Email {PUBLIC_SITE.email}, telepon/WhatsApp {PUBLIC_SITE.phone}. Waktu dukungan: {PUBLIC_SITE.supportHours}.</p></PublicSection>
  </PublicPageShell>;
}
