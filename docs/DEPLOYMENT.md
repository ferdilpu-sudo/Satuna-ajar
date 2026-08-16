# Deployment

Satuna Ajar adalah aplikasi Next.js Node dan dapat dijalankan pada platform yang mendukung Next.js/server runtime.

## Lockfile pada paket ini

ZIP integrasi auth sengaja tidak membawa lockfile lama karena dependency auth baru tidak dapat diregenerasi di environment build paket ini dan lockfile sebelumnya sudah tidak sinkron dengan `package.json`.

Pada mesin development pertama:

```bash
npm install
```

Ini akan menghasilkan `package-lock.json` baru. Setelah build/test sukses, commit lockfile tersebut. Sesudah itu CI/deployment dapat memakai:

```bash
npm ci
```

Jangan membuat lockfile manual. Package manager memiliki cukup banyak ritual tanpa kita menambah arkeologi JSON buatan tangan.

## Pre-deploy checklist

Setelah lockfile valid tersedia:

```bash
npm ci
npm run test:core
npm run build
```

Pada checkout pertama paket ini gunakan `npm install` sebagai pengganti `npm ci`.

## Environment production

```env
GEMINI_API_KEY="..."

SATUNA_AUTH_MODE="enforce"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."

TRIAL_PROTECTION_MODE="enforce"
TRIAL_FREE_GENERATIONS="3"
TRIAL_SIGNING_SECRET="..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

Jangan upload `.env.local`.

## Supabase sebelum enforce

Sebelum mengubah `SATUNA_AUTH_MODE` ke `enforce`:

1. Atur Site URL Supabase ke domain production.
2. Tambahkan `https://DOMAIN-ANDA/auth/callback` ke redirect allowlist.
3. Aktifkan Email provider bila dipakai.
4. Aktifkan Google provider dan masukkan OAuth Client ID/Secret bila dipakai.
5. Uji login Google, login email, verifikasi email, logout, dan recovery password.
6. Baru aktifkan `SATUNA_AUTH_MODE="enforce"`.

Mode enforce tanpa Supabase env sengaja fail-closed: workspace tidak terbuka dan API mengembalikan configuration error.

## Trial persistence

Deployment serverless tidak boleh mengandalkan memory store. Gunakan Redis REST ketika `TRIAL_PROTECTION_MODE="enforce"`.

Authenticated trial diikat ke akun dan juga browser install ceiling. Karena itu Redis lama dari trial browser-only tetap dapat dipakai; install usage key dipertahankan untuk kontinuitas anti-abuse.

## Vercel

Untuk deploy berbasis GitHub:

1. Push repository beserta `package-lock.json` hasil `npm install` yang valid.
2. Import repository ke Vercel.
3. Tambahkan environment variables production.
4. Konfigurasi URL production pada Supabase/Google OAuth.
5. Deploy.
6. Jalankan smoke test di bawah.

Tidak perlu commit folder `.vercel`.

## Node / container

`next.config.ts` memakai `output: 'standalone'`.

Perintah standar:

```bash
npm run build
npm run start
```

## Smoke test setelah deploy

Periksa minimal:

1. `/login`, `/daftar`, dan `/lupa-kata-sandi` render normal.
2. Google OAuth kembali ke `/auth/callback` lalu workspace.
3. Email/password dapat login dan logout.
4. Recovery password berhasil mengarah ke `/ubah-kata-sandi`.
5. Dalam mode enforce, membuka `/` tanpa session diarahkan ke `/login`.
6. Dalam mode enforce, API non-public tanpa session mendapat `401 AUTH_REQUIRED`.
7. Analyze material berhasil memakai Gemini key production.
8. Trial usage akun valid dan satu generate mengurangi kuota satu.
9. Generate yang gagal me-release reservasi trial.
10. DOCX dapat diunduh dan dibuka normal.
11. Grounded web source, bila dipakai, tetap membawa URL grounding asli.

## Rollback

Simpan deployment sebelumnya. Bila generation/export/auth regression muncul, rollback deployment lebih aman daripada mengedit production langsung tanpa regression test.
