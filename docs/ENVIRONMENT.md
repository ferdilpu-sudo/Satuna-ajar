# Environment Variables

Source of truth contoh konfigurasi adalah [`../.env.example`](../.env.example).

## AI

### `GEMINI_API_KEY`

**Wajib untuk fitur AI.** Dipakai server untuk analisis materi, generation, regenerate section, dan grounding.

```env
GEMINI_API_KEY="your-gemini-api-key"
```

Jangan memakai prefix `NEXT_PUBLIC_` karena key ini tidak boleh dikirim ke browser.

## Authentication

### `SATUNA_AUTH_MODE`

```env
SATUNA_AUTH_MODE="optional"
```

Nilai:

- `optional` — Supabase auth digunakan bila tersedia, tetapi workspace/API belum dipaksa login.
- `enforce` — workspace dan API non-public wajib session valid.
- `disabled` — auth dilewati.

Gunakan `optional` saat setup pertama. Production yang sudah selesai diuji sebaiknya memakai `enforce`.

### `NEXT_PUBLIC_SUPABASE_URL`

Project URL Supabase.

```env
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
```

### `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Publishable/anon key Supabase yang memang aman diekspos ke browser dengan RLS/auth policy yang benar.

```env
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."
```

Jangan pernah mengisi variable ini dengan `service_role` key.

## Trial protection

### `TRIAL_PROTECTION_MODE`

```env
TRIAL_PROTECTION_MODE="enforce"
```

Nilai:

- `enforce` — kuota dibatasi.
- `monitor` — evaluasi/rate-limit berjalan tanpa memblokir kuota trial.
- `disabled` — trial protection dimatikan.
- `auto` — source menentukan mode dari environment/runtime.

### `TRIAL_FREE_GENERATIONS`

Default:

```env
TRIAL_FREE_GENERATIONS="3"
```

Menentukan jumlah generation gratis. Setelah auth tersedia, nilai ini menjadi limit per akun dan juga dasar ceiling anti multi-account per browser install.

### `TRIAL_SIGNING_SECRET`

```env
TRIAL_SIGNING_SECRET="replace-with-a-long-random-secret"
```

Digunakan server untuk signed trial cookie dan hashing subject akun. Gunakan secret acak panjang yang berbeda antara development dan production.

### `UPSTASH_REDIS_REST_URL`

```env
UPSTASH_REDIS_REST_URL=""
```

URL Redis REST untuk persistent usage store.

### `UPSTASH_REDIS_REST_TOKEN`

```env
UPSTASH_REDIS_REST_TOKEN=""
```

Token server-only untuk Redis REST. Jangan memakai `NEXT_PUBLIC_`.

Production serverless dengan `TRIAL_PROTECTION_MODE="enforce"` harus memakai persistent store; memory store hanya cocok untuk local development/testing.

## Optional development

### `DISABLE_HMR`

Hanya untuk environment preview tertentu yang membutuhkan watcher/HMR dimatikan.

```env
# DISABLE_HMR="false"
```

Tidak diperlukan untuk local development normal.

## Contoh local development

```env
GEMINI_API_KEY="..."

SATUNA_AUTH_MODE="optional"
NEXT_PUBLIC_SUPABASE_URL="https://PROJECT.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="..."

TRIAL_PROTECTION_MODE="monitor"
TRIAL_FREE_GENERATIONS="3"
TRIAL_SIGNING_SECRET="development-secret-yang-cukup-panjang"
```

Redis boleh kosong pada local development bila persistence trial lintas restart tidak diperlukan.

## Contoh production

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

## Secret hygiene

- `.env.local` tidak boleh di-commit.
- Jangan menaruh Gemini key, Redis token, signing secret, OAuth Client Secret, atau Supabase `service_role` key di source/frontend.
- Public Supabase publishable key boleh berada di browser; keamanan data tetap harus bergantung pada session dan policy server/database, bukan pada kerahasiaan publishable key.
- Rotasi secret bila pernah terlanjur masuk Git history.
