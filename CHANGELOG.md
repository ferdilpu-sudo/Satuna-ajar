# Changelog

Semua perubahan penting Satuna Ajar dicatat di sini. Format mengikuti prinsip Keep a Changelog dan Semantic Versioning sejauh relevan untuk fase beta.

## [Unreleased]

### Added

- Supabase Auth berbasis cookie untuk Next.js App Router.
- Login Google OAuth dan email/password.
- Signup email dengan metadata nama lengkap dan dukungan email confirmation.
- Callback `/auth/callback` untuk authorization-code exchange.
- Recovery password melalui `/lupa-kata-sandi` dan `/ubah-kata-sandi`.
- Account section di Pengaturan dengan status akun dan logout.
- Mode auth `disabled`, `optional`, dan `enforce`.

### Changed

- Trial authenticated sekarang diikat ke `user_id` selain browser install identity.
- Browser install memiliki ceiling agregat untuk mengurangi multi-account trial abuse tanpa hard-block berdasarkan IP sekolah.
- Copy screen daftar disesuaikan karena dokumen masih localStorage dan belum cloud-sync.
- Dokumentasi environment, arsitektur, auth, deployment, dan README diperbarui untuk Supabase.

### Security

- Protected page/API dapat diberlakukan melalui `SATUNA_AUTH_MODE="enforce"`.
- Mode enforce tanpa konfigurasi Supabase gagal tertutup alih-alih diam-diam membuka workspace.
- API non-public tanpa session pada mode enforce mengembalikan `401 AUTH_REQUIRED`.
- Account subject di usage store di-hash sebelum menjadi key trial.

### Planned

- Persistensi `profiles` dan `documents` berbasis `user_id` agar data tersinkron antar perangkat.
- Entitlement Guru Pro/Sekolah dan billing.
- Step-up verification adaptif bila pola abuse membutuhkan lapisan tambahan.

## [0.1.0] - 2026-08-16

### Added

- Branding **Satuna Ajar** sebagai ruang kerja digital untuk guru.
- Wizard RPP Ringkas dan Modul Ajar.
- Analisis materi berbasis Gemini untuk teks, dokumen, PDF, dan gambar.
- Google Search grounding opsional beserta attribution sumber web.
- Pipeline planner, assessment blueprint, document generator, targeted assessment auto-repair, dan finalization.
- Template PBL, PjBL, Inquiry, Cooperative Learning Jigsaw, dan STAD.
- PID (Papan Interaktif Digital) pada Pemanfaatan Digital.
- Dashboard, riwayat, template, settings, preview, edit, duplicate, dan delete.
- Export DOCX/PDF A4 dengan styling dokumen pendidikan.
- Trial AI server-side dengan signed cookie, Redis REST, IP-hash rate limit, dan rollback quota.
- Screen auth awal `/login` dan `/daftar`.

### Changed

- CTA dashboard diselaraskan untuk RPP dan Modul Ajar.
- Wizard scroll kembali ke awal konten saat pindah tahap.
- Jigsaw dan STAD dipisah agar sintaks tidak tercampur.
- Ikon utama memakai Streamline Ultimate Duotone Free.
- `Sumber Belajar Lainnya` ditambahkan untuk RPP Ringkas tanpa URL palsu.
- Pilihan ganda preview/export memakai label A-E.
- Metadata teknis asesmen disembunyikan dari presentation layer.
- DOCX mendapat paragraph spacing, visual hierarchy, question cards, source panel, dan tabel lebih siap cetak.

### Fixed

- Proposal/rancangan aksi dikenali sebagai evidence produk.
- Duplikasi kalimat asesmen diagnostik dikurangi.
- Estimasi sumatif mempertimbangkan jenis soal.
- RPP dapat menghasilkan rekomendasi sumber belajar tambahan.
- Label internal/draft AI dan metadata quality-check dibersihkan dari export final.

### Security

- Trial dipindahkan dari state browser ke enforcement server-side.
- Secret production hanya dibaca dari environment.
- IP mentah tidak disimpan oleh rate-limit trial.
