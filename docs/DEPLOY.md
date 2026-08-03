# Panduan Deploy — Levio

Runbook untuk rilis ke produksi. Alur: **GitHub (branch + PR + CI)** → **Vercel (host, auto-deploy dari `main`)** → **Supabase (DB + Auth)**.

- Versi saat ini: `v0.10.0` (lihat `lib/version.ts` + `package.json`).
- Stack produksi: Next.js 16 (App Router, Turbopack) di Vercel, Supabase sebagai
  backend, service worker `public/sw.js` untuk offline shell.
- Alur development & branch (wajib): `RULE.md` → "Development & Deployment Flow".

## 0. Alur Rilis (ringkas)

```
main (production, diproteksi)
   ▲
   │ PR + CI hijau (lint → test → build)
   │
release/vX.Y.Z ── bump versi + changelog + docs ──▶ PR → merge → tag vX.Y.Z
   ▲
feat/* fix/* docs/* chore/* hotfix/*
```

- `main` **tidak boleh** di-commit langsung — semua lewat PR.
- CI di `.github/workflows/ci.yml` berjalan di tiap PR & push ke `main`.
- Setelah merge ke `main`, Vercel **auto-deploy** (production branch = `main`);
  tiap PR mendapat **preview deployment**.
- Rilis = tag `vX.Y.Z` di `main` (tanda; deploy sudah terjadi saat merge).

## 1. Persiapan Supabase (sekali saja)

1. Buat proyek di [supabase.com](https://supabase.com) → **New Project**.
2. **SQL Editor** → jalankan semua migration. Ada dua cara:
   - Satu paste: salin isi `supabase/migrations/0000_setup_all.sql`, atau
   - Berurutan: `0001_init.sql` → `0002_add_srs.sql` → `0003_add_new_words.sql`
     → `0004_add_unlocked_up_to.sql` → `0005_add_imported_at.sql`
     → `0006_add_gym_sync.sql` → `0007_add_gym_program.sql`
     → `0008_add_unlocked_by_module.sql`.
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

### 2a. Terhubung ke Git (disarankan — auto-deploy)

1. [vercel.com](https://vercel.com) → **Add New Project** → **Import** dari
   GitHub repo `levio`.
2. Framework preset **Next.js** (terdeteksi otomatis). Build command default
   (`next build`); jangan ubah kecuali perlu.
3. **Production Branch** → `main`. Setelah ini:
   - push/merge ke `main` → otomatis deploy produksi;
   - tiap PR → preview deployment (URL muncul di komentar PR).
4. Tambahkan env di **Project Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (tambahkan ke Production, Preview, dan Development.)

> Env wajib ada **sebelum** build pertama: `next.config.ts` memakainya saat
> build untuk menyusun CSP `connect-src`.

### 2c. Custom domain (mis. `levio.space`)

1. **Project Settings → Domains** → tambahkan domain (mis. `levio.space`).
2. Pilih salah satu konfigurasi DNS di registrar:
   - **Opsi A (NS Vercel):** ganti nameserver domain ke `ns1.vercel-dns.com`
     / `ns2.vercel-dns.com` — apex + `www` otomatis.
   - **Opsi B (pertahankan NS registrar):** tambahkan
     `A @ → 76.76.21.21` **dan** `CNAME www → cname.vercel-dns.com`.
     Pastikan **tidak ada A record lain** di apex (hapus record parking bawaan
     registrar) — record ekstra membuat Vercel menandai domain *misconfigured*.
3. Tunggu propagasi DNS global (TTL lama bisa bertahan beberapa jam) sampai
   Vercel mengeset `configVerifiedAt` lalu menerbitkan sertifikat SSL otomatis.
   Verifikasi: `curl -sI https://levio.space | head -3`.

### 2b. Manual via CLI (fallback / rollback)

```bash
npm install
npx vercel login        # login via browser (sekali saja)
npx vercel link         # buat/pilih proyek Vercel
npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
npx vercel --prod       # deploy produksi (fallback saja)
```

Catatan:
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

- [ ] Branch `release/vX.Y.Z` dari `main`; CI hijau di PR.
- [ ] Migration 0001–0008 sudah dijalankan di Supabase.
- [ ] Env Vercel terisi (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) di Production + Preview + Development.
- [ ] Supabase `Site URL` & `Redirect URLs` = domain produksi.
- [ ] Versi sinkron: `package.json`, `lib/version.ts` (`APP_VERSION`), highlight
      `RELEASE_NOTES` (id+en), `CHANGELOG.md`.
- [ ] Cache service worker di-bump (`public/sw.js` → `CACHE_NAME = "levio-shell-vN"`)
      bila aset statis berubah.
- [ ] PR `release/vX.Y.Z` → `main` merged; tag `vX.Y.Z` di-push.
- [ ] Vercel auto-deploy `main` sukses (cek dashboard / `curl`).
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
