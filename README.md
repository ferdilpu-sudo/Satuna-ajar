# Satuna Ajar

**Ruang kerja digital untuk guru.**

Satuna Ajar membantu guru menyiapkan **RPP Ringkas** dan **Modul Ajar**, menganalisis materi dengan Gemini, menyusun tujuan pembelajaran dan asesmen, meninjau hasil secara inline, lalu mengekspor dokumen yang siap dipakai ke DOCX/PDF.

> Status proyek: **beta aktif**. Fitur pembuatan dokumen dan Supabase Auth sudah terintegrasi di source. Deployment tetap perlu project Supabase, provider OAuth/email, Redis production, dan environment milik Anda.

## Fitur utama

- Wizard RPP Ringkas dan Modul Ajar.
- Analisis teks, PDF, DOCX, TXT, dan gambar.
- Gemini API sebagai provider AI utama.
- Google Search grounding opsional untuk sumber riset web.
- Pipeline pedagogis dengan assessment blueprint dan targeted auto-repair.
- Template PBL, PjBL, Inquiry, Cooperative Learning Jigsaw, dan STAD.
- Pembelajaran Mendalam dan 8 Dimensi Profil Lulusan.
- Pemanfaatan digital termasuk PID (Papan Interaktif Digital).
- Preview, edit inline, riwayat lokal, duplikasi, dan hapus dokumen.
- Export DOCX/PDF A4 dengan format asesmen siap pakai.
- Supabase Auth: Google OAuth, email/password, recovery password, session cookie, logout.
- Mode protected workspace/API melalui `SATUNA_AUTH_MODE=enforce`.
- Trial AI server-side: account limit + browser anti-abuse + Redis persistence + IP rate limit.

## Tech stack

- Next.js 15 + App Router
- React 19 + TypeScript
- Tailwind CSS 4
- Supabase Auth (`@supabase/ssr`, `@supabase/supabase-js`)
- Google Gemini API (`@google/genai`)
- `docx` untuk export DOCX
- Mammoth untuk ekstraksi DOCX
- Upstash Redis REST untuk persistence kuota trial production
- Lucide + Streamline Ultimate Duotone Free untuk ikon

## Quick start

### Prasyarat

- Node.js 20+.
- npm.
- Gemini API key.
- Project Supabase untuk menguji autentikasi nyata.

### Instalasi

Paket source ini sengaja tidak membawa lockfile lama yang sudah tidak sinkron setelah dependency auth ditambahkan. Pada install pertama:

```bash
npm install
cp .env.example .env.local
```

PowerShell:

```powershell
npm install
Copy-Item .env.example .env.local
```

`npm install` akan menghasilkan `package-lock.json` baru. Setelah test/build sukses, commit lockfile tersebut agar CI berikutnya dapat memakai `npm ci`.

Isi minimum untuk AI + auth:

```env
GEMINI_API_KEY="..."

SATUNA_AUTH_MODE="optional"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."
```

Lalu:

```bash
npm run dev
```

Buka `http://localhost:3000`.

Konfigurasi Google OAuth/redirect dijelaskan di [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md).

## Environment variables

Referensi lengkap: [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

Untuk local development, gunakan auth `optional` sampai callback/provider teruji. Production yang sudah siap dapat memakai:

```env
SATUNA_AUTH_MODE="enforce"
TRIAL_PROTECTION_MODE="enforce"
```

Mode trial enforce pada serverless membutuhkan Redis persistent store dan signing secret.

## Script npm

```bash
npm run dev       # development server port 3000
npm run build     # production build
npm run start     # menjalankan production build
npm run lint      # ESLint
npm run test:core # regression/unit tests utama
npm run clean     # hapus .next dan .next-dev
```

## Struktur repository

```text
app/
  (auth)/               Login, daftar, lupa/reset password
  auth/callback/         Supabase authorization-code callback
  api/gemini/            Analyze, generate, regenerate
  api/usage/             Trial usage
components/
  auth/                   Auth forms/shell
  wizard/                 Wizard pembuatan dokumen
  settings/               Account/settings section
lib/
  auth/                   Auth mode + message helpers
  supabase/               Browser/server client + middleware helper
  server/                 Trial protection, auth-user, usage store
  export/                 Formatter/export helpers
  validation/             Validasi deterministik
  gemini.ts               Gemini client
  storage.ts              Dokumen/settings lokal browser
middleware.ts             Session refresh + protected route boundary
types/                     Domain types
tests/                     Regression tests
docs/                      Dokumentasi teknis/operasional
```

Arsitektur lengkap: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Authentication

Auth flow:

```text
/login atau /daftar
  ↓
Supabase Auth (Google atau email/password)
  ↓
/auth/callback
  ↓
session cookie
  ↓
workspace
```

`SATUNA_AUTH_MODE`:

- `optional` — auth tersedia tetapi workspace belum dipaksa login.
- `enforce` — page/API non-public wajib session.
- `disabled` — bypass auth.

Detail setup provider, redirect allowlist, recovery, dan production checklist ada di [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md).

## Penyimpanan data saat ini

**Auth sudah server-backed, tetapi dokumen/settings masih localStorage.** Akun yang sama dapat login di perangkat lain, namun dokumen lama belum ikut tersinkron.

Ini batas beta yang disengaja. Database `profiles`/`documents` akan menjadi tahap terpisah agar integrasi akun tidak membongkar pipeline dokumen yang sudah stabil.

## Trial protection

Default trial adalah 3 generation AI.

Ketika user login, sistem menilai:

```text
user_id          → limit per akun
browser install  → ceiling anti multi-account
hashed IP        → rate limiting
```

Authenticated trial tetap dibatasi per akun dan secara agregat pada satu browser install. Reservasi dilepas kembali bila generation gagal.

## Riset web dan sumber materi

Google Search grounding, bila aktif, menyimpan URL dari grounding metadata. Aplikasi tidak membuat URL referensi palsu.

- materi/file pengguna = sumber utama;
- grounding web = sumber riset;
- `Sumber Belajar Lainnya` = rekomendasi pedagogis, bukan grounding.

## Export dokumen

DOCX menggunakan layout A4, paragraph spacing profesional, question card ringan, opsi A-E, tabel yang aman dicetak, dan presentation cleanup agar metadata internal asesmen tidak bocor ke dokumen final.

## Upload ke GitHub

Setelah `npm install`, test/build sukses, dan `package-lock.json` baru terbentuk:

```bash
git init
git add .
git commit -m "chore: initialize Satuna Ajar repository"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

Checklist secret dan workflow Git ada di [`docs/GITHUB.md`](docs/GITHUB.md).

## Dokumentasi

- [`docs/README.md`](docs/README.md) — indeks.
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — arsitektur.
- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) — environment.
- [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md) — Supabase Auth.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deployment.
- [`docs/GITHUB.md`](docs/GITHUB.md) — GitHub.
- [`CHANGELOG.md`](CHANGELOG.md) — perubahan.

## Keamanan

- Jangan commit `.env.local` atau secret production.
- `GEMINI_API_KEY`, Redis token, signing secret, OAuth Client Secret, dan Supabase `service_role` key harus tetap server-side/secret store.
- Publishable Supabase key bukan pengganti authorization policy.
- Sebelum repo publik, scan history bila credential pernah masuk commit lama.

## Ikon

Aplikasi memakai Streamline Ultimate Duotone Free pada area tertentu. Attribution tersedia di **Tentang & Lisensi** agar UI utama tetap bersih.

## Lisensi

Belum ada lisensi source code yang ditetapkan. Tentukan lisensi sebelum mendistribusikan repository sebagai open-source.
