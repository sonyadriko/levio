# Panduan Deploy — Levio

Runbook untuk rilis ke produksi. Alur: **Supabase (DB + Auth)** → **Vercel (host)**.

- Versi saat ini: `v0.8.0` (lihat `lib/version.ts` + `package.json`).
- Stack produksi: Next.js 16 (App Router, Turbopack) di Vercel, Supabase sebagai
  backend, service worker `public/sw.js` untuk offline shell.

## 1. Persiapan Supabase (sekali saja)

1. Buat proyek di [supabase.com](https://supabase.com) → **New Project**.
2. **SQL Editor** → jalankan semua migration. Ada dua cara:
   - Satu paste: salin isi `supabase/migrations/0000_setup_all.sql`, atau
   - Berurutan: `0001_init.sql` → `0002_add_srs.sql` → `0003_add_new_words.sql`
     → `0004_add_unlocked_up_to.sql` → `0005_add_imported_at.sql`.
   Script menggunakan `if not exists` sehingga aman dijalankan ulang.
3. **Authentication → Sign In / Up** → aktifkan provider **Email**.
   - (Opsional) matikan **Confirm email** supaya registrasi langsung aktif.
   - (Opsional) aktifkan **Google** bila ingin tombol "Masuk dengan Google"
     (lihat `.env.example`).
4. **Authentication → URL Configuration**:
   - `Site URL`: domain produksi (contoh `https://levio.vercel.app`).
   - `Redirect URLs`: `https://levio.vercel.app/auth/callback`.
     Tautan konfirmasi/reset email diarahkan ke sini.
5. Catat `Project Settings → API`:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Tanpa `.env`, aplikasi tetap berjalan penuh dalam **mode offline** (progress
> disimpan di localStorage, tanpa sync cloud). Env hanya dibutuhkan untuk
> auth + sync cloud.

## 2. Deploy ke Vercel

```bash
npm install
npx vercel login        # login via browser (sekali saja)
npx vercel link         # buat/pilih proyek Vercel
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel --prod       # deploy produksi
```

Setelah itu deploy berikutnya cukup:

```bash
npm run build && npx vercel --prod
```

Catatan:
- `next.config.ts` memakai `NEXT_PUBLIC_SUPABASE_URL` saat build untuk menyusun
  CSP `connect-src` — pastikan env sudah ada **sebelum** `--prod`.
- CSP memakai `'unsafe-inline'` pada `script-src` karena Next menanamkan skrip
  RSC inline; `'unsafe-eval'` hanya di development.
- HSTS (`Strict-Transport-Security`) hanya dikirim di produksi (`NODE_ENV=production`).

## 3. Verifikasi setelah deploy

```bash
# 1. Header keamanan + HSTS
curl -sI https://<domain>/ | grep -iE "content-security-policy|strict-transport-security|x-content-type|referrer-policy"

# 2. PWA + manifest
curl -s https://<domain>/manifest.webmanifest | head
curl -sI https://<domain>/sw.js | head -1

# 3. Halaman utama tidak 404 & title benar
curl -s https://<domain>/ | grep -o "<title>[^<]*</title>"
```

Manual check di browser (incognito):
- Buka `/` → shell tampil, service worker ter-register (Application → Service Workers).
- Login/Signup email bekerja; konfirmasi/reset email kembali ke `/auth/callback`
  dan `/auth/reset-password`.
- Tema gelap/terang tanpa flash; halaman Statistik/Profil memuat.
- (Opsional) matikan internet → shell offline tetap bisa dibuka.

## 4. Checklist rilis (production)

- [ ] Migration 0001–0005 sudah dijalankan di Supabase.
- [ ] Env Vercel terisi (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- [ ] Supabase `Site URL` & `Redirect URLs` = domain produksi.
- [ ] `git commit` pesan `release: vX.Y.Z` + versi di `package.json`, `lib/version.ts`,
      `CHANGELOG.md`, highlight `RELEASE_NOTES` (id+en) sinkron.
- [ ] Cache service worker di-bump (`public/sw.js` → `CACHE_NAME = "levio-shell-vN"`)
      bila aset statis berubah.
- [ ] `npm run lint`, `npm test`, `npm run build` hijau.
- [ ] Verifikasi header + halaman di §3.

## Rollback

- **Vercel:** `npx vercel rollback` (kembali ke deployment sebelumnya) atau
  redeploy commit lama.
- **Cache SW:** user dengan cache lama akan tetap memakai shell lama sampai
  `CACHE_NAME` naik; bump versi SW di rilis berikutnya.

## Referensi

- Analisis keamanan & CSP: [`SECURITY.md`](./SECURITY.md)
- Struktur & alur data: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Riwayat rilis: [`CHANGELOG.md`](../CHANGELOG.md)
