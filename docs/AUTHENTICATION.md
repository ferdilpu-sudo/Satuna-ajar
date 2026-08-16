# Authentication

## Status

Supabase Auth sudah terintegrasi pada Satuna Ajar untuk:

- Google OAuth;
- email + password;
- verifikasi email sesuai konfigurasi project Supabase;
- recovery/reset password;
- session berbasis cookie untuk Next.js App Router;
- logout;
- proteksi workspace/API ketika `SATUNA_AUTH_MODE="enforce"`.

Autentikasi sudah ada di source, tetapi tetap membutuhkan project Supabase dan konfigurasi provider milik deployment Anda.

## Dependency

Project memakai:

```json
"@supabase/ssr": "0.10.3",
"@supabase/supabase-js": "2.109.0"
```

Versi `supabase-js` dipin agar tetap kompatibel dengan baseline Node.js 20 project.

## Environment

Tambahkan ke `.env.local`:

```env
SATUNA_AUTH_MODE="optional"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."
```

Gunakan publishable/anon key untuk browser. Jangan pernah memasukkan `service_role` key sebagai `NEXT_PUBLIC_*`.

Mode auth:

- `optional` — auth berfungsi, tetapi workspace masih dapat dibuka tanpa login; cocok untuk migrasi/local testing.
- `enforce` — route workspace dan API non-public wajib memiliki session valid.
- `disabled` — auth dilewati.

Untuk production, pindah ke `enforce` hanya setelah login, callback, dan recovery sudah diuji pada domain production.

## Supabase project

Di dashboard Supabase:

1. Buat project.
2. Ambil Project URL dan publishable/anon key.
3. Atur Site URL ke domain aplikasi production.
4. Tambahkan redirect URL yang digunakan aplikasi:
   - `http://localhost:3000/auth/callback`
   - `https://DOMAIN-ANDA/auth/callback`
5. Aktifkan Email provider bila email/password akan dipakai.

## Google OAuth

Aktifkan provider Google di Supabase Authentication. Client ID dan Client Secret berasal dari Google Cloud OAuth configuration.

Di Google Cloud untuk OAuth Client tipe Web:

- **Authorized JavaScript origins**: tambahkan origin aplikasi, misalnya `http://localhost:3000` dan `https://DOMAIN-ANDA`.
- **Authorized redirect URI**: gunakan callback URL **Supabase Auth** yang ditampilkan pada halaman provider Google di dashboard Supabase (`https://<project-ref>.supabase.co/auth/v1/callback`), bukan `/auth/callback` milik aplikasi.

`/auth/callback` milik Satuna adalah redirect lanjutan dari Supabase untuk menyimpan session PKCE ke cookie. URL ini tetap harus ada di Redirect URLs allowlist Supabase.

Flow aplikasi:

```text
/login atau /daftar
  ↓ signInWithOAuth("google")
Google
  ↓
Supabase callback
  ↓
/auth/callback
  ↓ exchangeCodeForSession
workspace
```

Redirect URL Google/Supabase harus sesuai domain deployment. Jangan memakai URL localhost sebagai satu-satunya redirect production.

## Email/password

Daftar memakai `supabase.auth.signUp()`. Metadata `full_name` dikirim saat signup.

Login memakai `supabase.auth.signInWithPassword()`.

Jika email confirmation aktif, pendaftaran menampilkan instruksi verifikasi dan user baru memperoleh session setelah verifikasi selesai.

## Recovery password

Route:

- `/lupa-kata-sandi` — meminta email recovery;
- `/ubah-kata-sandi` — menyimpan password baru.

Email recovery kembali melalui `/auth/callback?next=/ubah-kata-sandi` sehingga authorization code ditukar menjadi session sebelum password diubah.

Untuk production, gunakan SMTP yang Anda kontrol daripada bergantung pada email testing/default provider.

## Session dan route protection

Helper Supabase berada di:

```text
lib/supabase/client.ts
lib/supabase/server.ts
lib/supabase/middleware.ts
middleware.ts
```

Middleware me-refresh/validasi claim session dan, saat mode `enforce`, menolak user tanpa session:

- page → redirect ke `/login`;
- API → HTTP `401 AUTH_REQUIRED`.

Jika `enforce` aktif tetapi Supabase env tidak tersedia, sistem gagal tertutup:

- page → `/login?error=config`;
- API → HTTP `503 AUTH_CONFIGURATION_ERROR`.

Endpoint/data sensitif tetap sebaiknya memvalidasi user di server dekat operasi yang dilakukan, bukan hanya percaya pada state React di browser.

## Trial setelah login

Trial sekarang memakai dua anchor:

```text
user_id Supabase     → batas trial per akun
browser install hash → sinyal anti multi-account
hashed IP            → rate limiting
```

Default `TRIAL_FREE_GENERATIONS=3` berarti satu akun mendapat maksimal tiga generate trial. Untuk authenticated trial, browser install juga memiliki ceiling agregat `2 × trial limit` (default enam generate) agar pembuatan banyak akun dari browser yang sama tidak memberi trial tanpa batas.

Browser/IP bukan pengganti akun dan bukan identitas manusia sempurna. Mekanisme ini adalah anti-abuse ringan, bukan fingerprinting absolut.

## Logout

Pengaturan → **Akun Satuna** menyediakan tombol logout melalui `supabase.auth.signOut()`.

## Batasan data saat ini

Auth sudah production-capable setelah provider dikonfigurasi, tetapi dokumen dan settings guru **masih disimpan di `localStorage`**. Login pada laptop lain belum memindahkan dokumen lama ke perangkat tersebut.

Tahap berikutnya untuk multi-device adalah database `profiles`, `documents`, dan entitlement/billing berbasis `user_id`.
