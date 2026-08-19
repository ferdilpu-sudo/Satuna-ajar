import PublicPageShell, { PublicSection } from '@/components/public/PublicPageShell';
import { PUBLIC_SITE } from '@/lib/public-site';

export default function TermsPage() {
  return <PublicPageShell title="Syarat & Ketentuan" intro="Ketentuan penggunaan layanan Satuna Ajar untuk perencanaan pembelajaran berbantuan AI.">
    <PublicSection title="1. Ketentuan umum"><p>Dengan mengakses atau menggunakan Satuna Ajar, pengguna dianggap telah membaca dan menyetujui ketentuan yang berlaku pada halaman ini.</p></PublicSection>
    <PublicSection title="2. Informasi usaha"><p>{PUBLIC_SITE.businessName} dioperasikan sebagai {PUBLIC_SITE.operator}, beroperasi di {PUBLIC_SITE.operationalAddress}. Kontak resmi: {PUBLIC_SITE.email}.</p></PublicSection>
    <PublicSection title="3. Layanan"><p>Satuna Ajar menyediakan ruang kerja digital untuk membantu guru menyusun perangkat ajar, asesmen, dan dokumen pembelajaran dengan bantuan AI. Hasil AI tetap perlu ditinjau dan disesuaikan oleh pengguna sebelum digunakan.</p></PublicSection>
    <PublicSection title="4. Hak dan kewajiban pengguna"><p>Pengguna wajib memberikan informasi yang benar, menjaga keamanan akun, dan tidak menggunakan layanan untuk aktivitas melanggar hukum, penipuan, penyalahgunaan sistem, atau konten yang melanggar hak pihak lain.</p></PublicSection>
    <PublicSection title="5. Harga dan pembayaran"><p>Harga ditampilkan dalam Rupiah (IDR) pada halaman paket atau checkout. Pembayaran dianggap berhasil setelah dikonfirmasi oleh sistem pembayaran. Biaya pihak ketiga yang ditampilkan sebelum pembayaran menjadi bagian dari total transaksi.</p></PublicSection>
    <PublicSection title="6. Penyelesaian layanan"><p>Hak akses atau kuota digital diberikan setelah pembayaran terkonfirmasi. Untuk pembelian satu kali, hak generate tidak dianggap terpakai apabila proses pembuatan dokumen gagal karena kesalahan sistem Satuna.</p></PublicSection>
    <PublicSection title="7. Kekayaan intelektual"><p>Merek, antarmuka, materi promosi, dan perangkat lunak Satuna Ajar dilindungi oleh hak yang berlaku. Pengguna tetap bertanggung jawab atas materi yang mereka unggah dan penggunaan dokumen yang dihasilkan.</p></PublicSection>
    <PublicSection title="8. Pembatasan tanggung jawab"><p>Satuna tidak menjamin keluaran AI selalu bebas kesalahan. Pengguna bertanggung jawab melakukan pemeriksaan profesional dan pedagogis. Gangguan dari penyedia AI, pembayaran, internet, atau infrastruktur pihak ketiga dapat memengaruhi ketersediaan layanan.</p></PublicSection>
    <PublicSection title="9. Perubahan ketentuan"><p>Ketentuan dapat diperbarui untuk menyesuaikan layanan atau aturan yang berlaku. Versi terbaru selalu tersedia pada halaman ini.</p></PublicSection>
    <PublicSection title="10. Keluhan dan sengketa"><p>Keluhan dapat disampaikan melalui {PUBLIC_SITE.email}. Kami menargetkan respons awal paling lambat 2 hari kerja. Penyelesaian lebih lanjut mengikuti hukum yang berlaku di Indonesia.</p></PublicSection>
  </PublicPageShell>;
}
