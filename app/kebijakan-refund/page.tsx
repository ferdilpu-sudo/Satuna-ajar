import PublicPageShell, { PublicSection } from '@/components/public/PublicPageShell';
import { PUBLIC_SITE } from '@/lib/public-site';

export default function RefundPage() {
  return <PublicPageShell title="Kebijakan Refund & Pembatalan" intro="Aturan pengembalian dana untuk pembelian layanan digital Satuna Ajar.">
    <PublicSection title="Ruang lingkup"><p>Kebijakan ini berlaku untuk pembelian paket, langganan, dan hak generate digital melalui Satuna Ajar.</p></PublicSection>
    <PublicSection title="Pembatalan"><p>Transaksi yang belum terkonfirmasi dapat dibatalkan dengan tidak melanjutkan pembayaran. Setelah pembayaran berhasil, pembatalan diproses melalui mekanisme refund apabila memenuhi syarat di bawah.</p></PublicSection>
    <PublicSection title="Refund dapat diajukan jika"><ul className="list-disc pl-5"><li>Pembayaran berhasil tetapi hak akses atau kuota tidak diterima.</li><li>Terjadi pembayaran ganda untuk transaksi yang sama.</li><li>Layanan gagal diberikan karena kesalahan sistem Satuna dan hak digital tidak dapat dipulihkan.</li></ul></PublicSection>
    <PublicSection title="Refund tidak berlaku jika"><ul className="list-disc pl-5"><li>Hak generate sudah berhasil digunakan atau layanan digital sudah diberikan.</li><li>Permintaan muncul karena perubahan keputusan setelah layanan dikonsumsi.</li><li>Gangguan berasal dari perangkat, koneksi, atau data pengguna dan layanan Satuna sebenarnya telah tersedia.</li></ul></PublicSection>
    <PublicSection title="Cara mengajukan"><p>Kirim email ke {PUBLIC_SITE.email} dengan subjek “REFUND Satuna”, sertakan email akun, waktu transaksi, nominal, metode pembayaran, dan bukti pembayaran. Jangan mengirim PIN, OTP, kata sandi, atau data kartu.</p></PublicSection>
    <PublicSection title="Waktu proses"><p>Permohonan diperiksa dalam 3–5 hari kerja. Setelah disetujui, pengembalian dana ditargetkan diproses dalam 7–14 hari kerja, tergantung metode pembayaran dan penyedia pembayaran.</p></PublicSection>
    <PublicSection title="Metode dan biaya"><p>Pengembalian dana diupayakan melalui kanal pembayaran asal atau metode lain yang disepakati. Satuna tidak mengenakan biaya administrasi refund dari sisi layanan, namun biaya pihak ketiga dapat mengikuti ketentuan penyedia pembayaran.</p></PublicSection>
  </PublicPageShell>;
}
