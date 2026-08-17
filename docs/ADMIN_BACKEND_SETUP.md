# Admin Backend Setup

Backend admin Satuna memakai Supabase Auth + Postgres RLS. Frontend `/admin` tetap memakai mock data sampai fase integrasi.

## 1. Jalankan migration

Jalankan migration berikut berurutan lewat Supabase SQL Editor atau CLI:

1. `20260817113000_admin_monetization_foundation.sql`
2. `20260817113100_admin_metrics_rpc.sql`
3. `20260817113200_generation_finalize_rpc.sql`

Migration membuat:

- `admin_members`
- `plans`
- `subscriptions`
- `payments`
- `generation_entitlements`
- `generation_usage`
- `payment_webhook_events`
- `admin_audit_logs`

Semua tabel sensitif memakai RLS.

## 2. Bootstrap admin pertama

Cari UUID akun admin di **Supabase → Authentication → Users** lalu jalankan:

```sql
insert into public.admin_members (user_id, role)
values ('UUID_USER_ADMIN', 'owner')
on conflict (user_id)
do update set role = excluded.role, is_active = true;
```

Sebagai bootstrap sementara, Vercel juga dapat memakai server-only env:

```env
SATUNA_ADMIN_EMAILS="admin@example.com"
```

Setelah `admin_members` sudah terisi dan teruji, env allowlist boleh dikosongkan.

## 3. Secret backend Supabase

Untuk operasi backend yang membutuhkan Auth Admin API, gunakan secret key baru Supabase bila tersedia:

```env
SUPABASE_SECRET_KEY="sb_secret_..."
```

Legacy fallback yang masih didukung:

```env
SUPABASE_SERVICE_ROLE_KEY="..."
```

Jangan pernah memberi prefix `NEXT_PUBLIC_` pada secret tersebut.

## 4. Endpoint backend pertama

```text
GET /api/admin/overview
```

Response sukses:

```json
{
  "data": {
    "totalUsers": 120,
    "activeSubscriptions": 18,
    "monthRevenue": 5200000,
    "monthOneTimeRevenue": 850000,
    "mrr": 4350000,
    "generations30d": 438,
    "failedGenerations30d": 9,
    "aiCost30d": 640000
  }
}
```

Unauthorized menghasilkan `401 AUTH_REQUIRED`; akun non-admin menghasilkan `403 ADMIN_REQUIRED`.

## 5. Beli sekali per generate

Pembayaran berhasil nantinya membuat `generation_entitlements` dengan `source = 'one_time'`.

Saat generate dimulai, backend mereservasi satu hak secara idempotent melalui:

```text
consume_one_time_generation(idempotency_key, generation_reference)
```

Setelah Gemini selesai, panggil:

```text
finalize_one_time_generation(..., success=true)
```

Jika generation gagal, `success=false` mengembalikan hak generate ke user. Retry dengan idempotency key yang sama tidak mengonsumsi hak dua kali.

## 6. Belum diaktifkan pada fase ini

- payment provider/webhook nyata
- frontend admin membaca endpoint real
- subscription checkout
- pembelian sekali dari UI user
- konsumsi entitlement pada endpoint Gemini production

Semua itu masuk fase Integration setelah backend ini sudah lolos build dan migration terpasang.
