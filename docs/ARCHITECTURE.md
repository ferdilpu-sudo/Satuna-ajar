# Arsitektur Satuna Ajar

## Ringkasan

Satuna Ajar adalah modular monolith Next.js yang menggabungkan workspace guru, Supabase Auth, API server-side, Gemini integration, trial protection, browser persistence, dan document export dalam satu repository.

Arsitektur ini sengaja belum dipecah menjadi banyak service. Pada fase beta, batas modul yang jelas lebih berguna daripada menambah jaringan internal hanya agar diagram terlihat sibuk.

## Alur request

```text
Browser
  ↓
Next.js middleware
  ├─ refresh/validate Supabase session
  └─ enforce protected page/API bila SATUNA_AUTH_MODE=enforce
  ↓
Workspace / API Route
```

## Authentication

Implementasi auth:

```text
/login | /daftar
   ↓
Supabase Auth
   ├─ Google OAuth
   └─ email/password
   ↓
/auth/callback
   ↓ exchangeCodeForSession
session cookie
```

File utama:

- `lib/auth/config.ts` — mode auth dan pengecekan env.
- `lib/auth/messages.ts` — pesan error yang aman untuk UI.
- `lib/supabase/client.ts` — browser client.
- `lib/supabase/server.ts` — server client berbasis cookies.
- `lib/supabase/middleware.ts` — refresh/route enforcement.
- `middleware.ts` — entry middleware Next.js.
- `app/auth/callback/route.ts` — OAuth/email callback.

Mode `optional` menjaga migrasi kompatibel dengan workspace lama. Mode `enforce` menjadikan session sebagai syarat page/API non-public.

## Pipeline dokumen

```text
Guru
  ↓
Wizard
  ↓
Analisis Materi
  ↓
Pedagogical Planner
  ↓
Assessment Blueprint
  ↓
Document Generator
  ↓
Targeted Assessment Repair
  ↓
Post-process / Normalization
  ↓
Preview & Edit
  ↓
DOCX / PDF
```

Quality Check generik tidak berada pada final flow. Perbaikan asesmen dilakukan targeted agar latency tidak bertambah hanya demi panel status yang tidak membantu guru.

## Frontend

Entry workspace utama berada di `app/page.tsx`.

Komponen utama:

- `components/DashboardView.tsx` — ringkasan workspace.
- `components/WizardForm.tsx` — orchestrator wizard.
- `components/RPPDetailView.tsx` — preview hasil.
- `components/RPPEditorModal.tsx` — edit hasil.
- `components/HistoryView.tsx` — daftar dokumen lokal.
- `components/TemplateView.tsx` — template model pembelajaran.
- `components/SettingsView.tsx` — pengaturan dan akun.
- `components/auth/*` — login, daftar, recovery, update password.

## API routes

### Analisis material

`POST /api/gemini/analyze-material`

Menganalisis teks/file dan dapat memakai Google Search grounding untuk konteks/verifikasi.

### Generate dokumen

`POST /api/gemini/generate-rpp`

Menjalankan pipeline RPP Ringkas/Modul Ajar. Trial reservation dilakukan sebelum planner pertama.

### Regenerate section

`POST /api/gemini/regenerate-section`

Menghasilkan ulang bagian tertentu tanpa membuat ulang seluruh dokumen.

### Trial usage

`GET /api/usage/trial`

Mengembalikan trial efektif untuk request saat ini. Jika user login, perhitungan mempertimbangkan usage akun dan browser install.

## Gemini

Client Gemini terpusat di `lib/gemini.ts`. `GEMINI_API_KEY` hanya dibaca server.

Provider runtime adalah Gemini langsung. Tidak ada runtime 9Router.

## Grounding sumber web

`lib/gemini-grounding.ts` mengekstrak grounding metadata dari respons Gemini. URL pada UI/export berasal dari metadata grounding atau input pengguna, bukan URL karangan model.

## Data persistence

Saat ini `lib/storage.ts` masih menyimpan dokumen/settings ke `localStorage`.

Konsekuensi:

- session akun dapat berpindah perangkat, tetapi dokumen belum ikut tersinkron;
- dokumen belum memiliki owner record di database;
- membersihkan browser storage dapat menghapus data lokal.

Auth dan persistence dokumen sengaja dipisahkan. Tahap database berikutnya sebaiknya menambah `profiles` dan `documents` berbasis `auth.users.id` tanpa mengubah domain RPP yang sudah stabil.

## Trial protection

Server module berada di `lib/server/`.

Trial memakai:

- `user_id` Supabase sebagai anchor limit per akun saat tersedia;
- signed HTTP-only browser install cookie;
- ceiling agregat per install untuk mengurangi multi-account abuse;
- hashed IP untuk rate limiting;
- Redis REST sebagai persistent usage store production;
- memory store untuk local development;
- reservation/release agar kegagalan AI tidak membakar kuota.

Default 3 generation/account dan install ceiling `2 × limit` bukan identitas manusia absolut. Itu kompromi anti-abuse agar satu laptop sekolah tidak langsung diperlakukan seperti botnet.

## Export

Helper berada di `lib/export/` dan komponen export terkait.

Prinsip:

- A4 print-oriented;
- presentation layer bersih dari metadata internal;
- pilihan ganda berlabel A-E;
- bukti utama/pendukung tetap hidup di logic/pemetaan tetapi tidak ditempel pada heading soal;
- source grounding dan rekomendasi sumber belajar dipisahkan;
- styling DOCX ringan agar tetap terasa sebagai dokumen guru, bukan screenshot dashboard.

## Batasan arsitektur saat ini

- Dokumen/settings masih localStorage.
- Belum ada database profil/dokumen multi-device.
- Belum ada subscription entitlement Pro/School atau billing.
- Belum ada step-up verification untuk abuse berisiko tinggi.

Jangan mendokumentasikan kemampuan tersebut sebagai production-ready sampai source benar-benar memilikinya.
