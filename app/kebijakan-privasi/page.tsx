import PublicPageShell, { PublicSection } from '@/components/public/PublicPageShell';
import { PUBLIC_SITE } from '@/lib/public-site';

export default function PrivacyPage() {
  return <PublicPageShell title="Kebijakan Privasi" intro="Penjelasan mengenai data yang diproses ketika Anda menggunakan Satuna Ajar.">
    <PublicSection title="Data yang diproses"><p>Satuna dapat memproses informasi akun seperti nama dan email, data penggunaan layanan, informasi transaksi, serta materi yang pengguna masukkan untuk membuat perangkat ajar.</p></PublicSection>
    <PublicSection title="Tujuan penggunaan"><p>Data digunakan untuk autentikasi, menjalankan fitur aplikasi, memproses pembayaran, menjaga keamanan, mengukur penggunaan, menangani dukungan, dan meningkatkan kualitas layanan.</p></PublicSection>
    <PublicSection title="Pihak ketiga"><p>Untuk menyediakan layanan, data tertentu dapat diproses oleh penyedia infrastruktur, autentikasi, AI, analitik operasional, dan pembayaran sesuai kebutuhan fungsi masing-masing. Satuna tidak menjual data pribadi pengguna kepada pengiklan.</p></PublicSection>
    <PublicSection title="Keamanan"><p>Kami menerapkan kontrol akses dan pemisahan data server/client yang wajar. Pengguna tetap wajib menjaga keamanan kredensial akun dan tidak membagikan OTP atau kata sandi.</p></PublicSection>
    <PublicSection title="Penyimpanan dan penghapusan"><p>Data disimpan selama diperlukan untuk menyediakan layanan, memenuhi kewajiban transaksi, keamanan, atau hukum. Permintaan terkait akses atau penghapusan data dapat diajukan melalui kontak resmi.</p></PublicSection>
    <PublicSection title="Kontak privasi"><p>Pertanyaan terkait privasi dapat dikirim ke {PUBLIC_SITE.email}. Kami akan meninjau permintaan berdasarkan identitas akun dan ketentuan yang berlaku.</p></PublicSection>
  </PublicPageShell>;
}
