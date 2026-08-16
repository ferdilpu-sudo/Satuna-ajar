# Publish ke GitHub

Panduan ini ditujukan untuk source ZIP Satuna Ajar yang belum memiliki folder `.git`.

> Catatan lockfile: paket integrasi auth ini sengaja tidak membawa lockfile lama yang sudah tidak sinkron. Jalankan `npm install` sekali untuk menghasilkan `package-lock.json` baru, lalu commit lockfile tersebut bersama source. Setelah itu CI/deployment dapat memakai `npm ci`.

## 1. Ekstrak dan masuk ke folder project

PowerShell:

```powershell
cd C:\path\ke\satuna-ajar
```

## 2. Pastikan secret tidak ikut

Cek `.gitignore`:

```powershell
git check-ignore .env.local
```

Output seharusnya:

```text
.env.local
```

Jangan push file yang berisi Gemini key, Redis token, signing secret, atau credential provider lain.

Untuk melihat file environment yang ada:

```powershell
Get-ChildItem -Force .env*
```

Yang boleh masuk Git hanya `.env.example`.

## 3. Tes source sebelum commit

```powershell
npm install
npm run test:core
npm run build
```

Jangan melanjutkan push production-ready jika test/build gagal tanpa memahami penyebabnya.

## 4. Buat repository Git lokal

```powershell
git init
git add .
git status
git commit -m "chore: initialize Satuna Ajar repository"
git branch -M main
```

Periksa `git status` sebelum commit. Pastikan `.env.local`, `.next`, `.next-dev`, dan `node_modules` tidak tercantum.

## 5. Buat repository kosong di GitHub

Buat repository baru tanpa menginisialisasi README tambahan bila README dari ZIP ini akan menjadi source of truth.

Contoh remote:

```powershell
git remote add origin https://github.com/USERNAME/satuna-ajar.git
git push -u origin main
```

## 6. Setelah push

Cek halaman GitHub dan pastikan:

- README tampil normal;
- `.env.local` tidak ada;
- `.env.example` hanya placeholder;
- `CHANGELOG.md` tersedia;
- folder `docs/` ikut ter-push;
- tidak ada file build/cache besar yang tidak diperlukan.

## 7. Jika repository sebelumnya pernah berisi secret

Menghapus secret dari file terbaru **tidak menghapusnya dari Git history**. Rotate/revoke secret tersebut, lalu bersihkan history sebelum repository dibuat publik.

Untuk project baru dari ZIP ini, cara termudah adalah membuat repository baru dan memastikan hanya source bersih yang menjadi initial commit.

## Branch sederhana untuk solo development

Untuk fase sekarang cukup gunakan:

```text
main       → source stabil/deployable
feature/*  → perubahan fitur yang cukup besar
```

Contoh:

```powershell
git switch -c feature/supabase-auth
```

Setelah lolos test/build, merge kembali melalui pull request. Ini memberi history yang lebih mudah ditelusuri ketika produk mulai bertambah besar.
