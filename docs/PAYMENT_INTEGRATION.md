# Payment Integration

Satuna memakai payment core provider-agnostic. iPaymu dan Midtrans menjadi adapter di atas kontrak yang sama, sehingga data bisnis tidak bergantung pada bentuk payload provider.

## Status saat ini

- Katalog produk tersimpan di `public.plans`.
- Halaman `/pricing` membaca harga dari database, bukan konstanta frontend.
- `checkout_orders` menyimpan snapshot harga saat checkout dibuat.
- Checkout memakai idempotency key per user.
- Webhook disimpan di `payment_webhook_events` dan dideduplikasi berdasarkan `(provider, provider_event_id)`.
- Payment sukses membuat entitlement one-time sesuai `generation_quota` plan.
- Payment subscription sukses membuat subscription aktif dengan periode terbatas.
- Refund mencabut entitlement one-time tersisa dan membatalkan subscription terkait order.
- Pipeline generate memakai urutan akses: trial -> saldo one-time -> subscription berkuota.
- Generate berbayar yang gagal mengembalikan saldo one-time; reservation subscription gagal tidak dihitung ke quota periode.
- Satuna Pro Bulanan berharga Rp59.000 dengan kuota 20 generate AI per periode bulanan.
- Adapter iPaymu/Midtrans belum diaktifkan selama akun merchant masih review.

## Environment

```env
SATUNA_PAYMENT_PROVIDER=""
```

Biarkan kosong selama review. Setelah adapter provider selesai dan credential tersedia, isi hanya salah satu:

```env
SATUNA_PAYMENT_PROVIDER="ipaymu"
# atau
SATUNA_PAYMENT_PROVIDER="midtrans"
```

Credential provider harus selalu server-only dan tidak boleh menggunakan prefix `NEXT_PUBLIC_`.

## Migration

Jalankan migration berikut setelah migration katalog produk:

```text
supabase/migrations/20260817113600_payment_core.sql
supabase/migrations/20260817113700_generation_access_rpc.sql
supabase/migrations/20260817113800_set_pro_monthly_generation_quota.sql
```

`20260817113600_payment_core.sql` menambahkan `checkout_orders`, relasi order ke `payments`/`subscriptions`, public read policy untuk katalog aktif, RPC pembuatan order, RPC assignment provider, dan RPC finalisasi webhook atomik.

`20260817113700_generation_access_rpc.sql` menambahkan reservation/finalization untuk penggunaan berbayar. Saldo one-time selalu dipakai sebelum quota subscription. Subscription hanya menjadi sumber generate jika plan memiliki `generation_quota > 0` dan periodenya masih aktif.

`20260817113800_set_pro_monthly_generation_quota.sql` menetapkan `generation_quota = 20` pada plan `pro-monthly`. Artinya subscription Pro aktif dapat menjadi sumber generate setelah trial dan saldo one-time habis, maksimal 20 generate pada setiap periode subscription.

## Generation access flow

```text
request generate
  -> rate limit + trial
  -> trial tersedia: gunakan trial
  -> trial habis: reserve saldo one-time
  -> saldo one-time habis: cek subscription aktif dengan quota > 0
  -> tidak ada akses: HTTP 402 GENERATION_BALANCE_EXHAUSTED
```

Jika proses AI gagal, reservation berbayar difinalisasi sebagai gagal. Untuk one-time, `used_uses` dikurangi kembali. Untuk subscription, usage berstatus `failed` tidak ikut dihitung pada quota periode.

## Security boundaries

`create_checkout_order` hanya dapat dieksekusi role `authenticated` dan selalu mengambil harga dari `public.plans`. Client tidak pernah mengirim nominal yang dipercaya server.

`reserve_paid_generation` dan `finalize_paid_generation` hanya bekerja untuk `auth.uid()` dari session pengguna. User tidak dapat memilih entitlement atau subscription milik user lain.

`assign_checkout_provider` dan `finalize_checkout_payment` hanya dapat dieksekusi `service_role`. Signature webhook tetap harus diverifikasi oleh adapter provider sebelum event diberikan ke `finalizeVerifiedPayment()`.

## Next adapter step

Setelah salah satu merchant disetujui:

1. Implement `PaymentProvider.createCheckout()` untuk provider tersebut.
2. Implement `PaymentProvider.verifyWebhook()` sesuai signature resmi provider.
3. Tambahkan route checkout yang memanggil `prepareCheckout()`, provider adapter, lalu `attachProviderCheckout()`.
4. Tambahkan webhook route yang memverifikasi signature lalu memanggil `finalizeVerifiedPayment()`.
5. Uji Sandbox: sukses, gagal, expired, webhook duplikat, webhook out-of-order, amount mismatch, dan retry checkout.

Recurring renewal subscription belum diproses sebagai flow terpisah. Detail renewal harus mengikuti kemampuan provider yang akhirnya lolos review dan tidak boleh diasumsikan sama antara iPaymu dan Midtrans.
