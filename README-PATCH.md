# Satuna Admin Frontend Patch

Patch ini hanya menambahkan frontend admin berbasis mock data.

## Yang dipantau
- Ringkasan bisnis dan funnel monetisasi.
- Pengguna, termasuk jumlah generate satuan yang pernah dibeli.
- Langganan berulang.
- **Beli sekali: 1 pembayaran = hak 1x Generasi AI.**
- Pendapatan dipisahkan antara recurring dan one-time.
- Penggunaan AI dan kesehatan sistem.

## Salin ke repo
Salin folder `app/`, `components/`, `lib/`, `types/`, dan `tests/` ke root repo Satuna Ajar.

## Preview
Jalankan aplikasi lalu buka:

`http://localhost:3000/admin`

## Validasi

```powershell
npm run build
node --test tests/admin-panel.test.cjs
```

## Batasan fase ini
- Belum ada RBAC admin server-side.
- Belum terhubung ke Supabase data bisnis.
- Belum terhubung ke payment provider/webhook.
- Harga `Rp12.000 / 1x generate` di mock data hanya contoh UI, bukan keputusan pricing final.
- Hak 1x generate belum benar-benar dibuat/dikonsumsi. Backend nanti harus mengonsumsi hak hanya setelah generate sukses dan harus idempotent terhadap retry.
- Belum membaca penggunaan Gemini/Upstash real.
- Jangan jadikan `/admin` production control panel sebelum fase backend/hardening selesai.
