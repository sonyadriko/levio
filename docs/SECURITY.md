# Analisis Keamanan — Levio

Hasil **audit keamanan** pada rilis saat ini (`v0.8.0`).
Tujuan dokumen: memetakan model ancaman, mendokumentasikan proteksi yang sudah
ada, mendaftar temuan beserta tingkat risiko, dan memberikan checklist rilis.

> Status: **referensi**. S1–S4, S6, S7 ✅ ditindaklanjuti di v0.8.0; S5 adalah
> desain yang diterima (bukan temuan aktif).

## Model ancaman

Levio adalah aplikasi **client-side / offline-first**:

- State utama (progress, XP, streak, settings) tersimpan di **localStorage**
  perangkat; Supabase hanya lapisan sinkronisasi saat user login.
- Backend = **Supabase** (PostgreSQL + Auth) diakses lewat `anon key` publik.
- Satu endpoint server sendiri: proxy TTS `app/api/tts` (tanpa auth).
- Konten dari luar sistem: file **import JSON** (progress), input auth
  (email/sandi), dan text menuju TTS.

Aset yang perlu dilindungi:

| Aset | Nilai | Disimpan di |
|---|---|---|
| Progress belajar (XP, streak, kata) | Tinggi bagi pengguna | localStorage + Supabase |
| Preferensi (nama, target harian) | Rendah | localStorage + Supabase |
| Kredensial | Tinggi | Kelola oleh Supabase Auth |

## Proteksi yang sudah baik

- **RLS lengkap.** Semua tabel (`profiles`, `daily_activity`, `word_progress`,
  `last_test`) mengaktifkan Row Level Security dengan policy
  `auth.uid() = user_id` untuk SELECT/INSERT/UPDATE/DELETE
  (`supabase/migrations/0001_init.sql`). User hanya mengakses baris miliknya.
- **Kunci tidak di-commit.** `.env*` ada di `.gitignore`; hanya `.env.example`
  (placeholder kosong) yang di-commit. Audit: tidak ada file `.env` yang
  tertrack (lihat `git ls-files | grep .env`).
- **`anon key` aman dipakai publik.** Supabase anon key boleh terekspos di
  bundle karena semua akses data tetap lewat RLS.
- **Input import disanitasi.** `sanitizeProgress` memvalidasi tipe dan membuang
  kunci tidak dikenal; semua nilai dinormalisasi sebelum masuk state
  (`lib/progress.ts:108-166`).
- **Render aman dari XSS.** Semua data (hanzi, arti, nama) dirender lewat React
  yang auto-escape. Skrip tema dipindah ke file eksternal `public/theme-init.js`
  (tanpa `dangerouslySetInnerHTML` di layout).
- **Content-Security-Policy & header keamanan.** `script-src 'self' 'unsafe-inline'`
  (+ `'unsafe-eval'` hanya di dev), `object-src 'none'`, `frame-ancestors 'none'`,
  `base-uri 'self'`, `form-action 'self'`, `upgrade-insecure-requests`; plus
  `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`, dan HSTS di produksi (`next.config.ts` → `headers()`).
  Catatan: `'unsafe-inline'` di `script-src` masih dibutuhkan untuk skrip inline
  RSC bawaan Next.js; transisi ke nonce butuh dynamic rendering (lihat panduan
  Next di `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md`).
- **Bebas open-redirect di callback.** `safeNext` memvalidasi `next` (harus
  diawali `/`, bukan `//`/`://`/`\`) dan default ke `/profile`; tipe `recovery`
  diarahkan ke `/auth/reset-password` (`app/auth/callback/route.ts`).
- **Service worker ketat.** `public/sw.js` hanya mengintervensi request
  same-origin, GET, non-`/api/`. Cache API/auth tidak disentuh.
- **Proxy TTS dibatasi.** `text` ≤ 200 karakter; host upstream tetap (tidak ada
  SSRF); **rate limit 60 req/menit/IP** (token bucket in-memory, `429`);
  **whitelist bahasa** `zh-CN|en|id`; cache in-memory dibatasi 5.000 entri
  (`app/api/tts/route.ts`).
- **Kredensial tidak pernah disimpan di client.** Session dikelola cookie
  HttpOnly oleh Supabase SSO; `@supabase/ssr` + middleware refresh.
- **Tanpa dependensi yang mencurigakan.** Dependency tree kecil
  (Next, React, Supabase, Tailwind) — lihat `package.json`.

## Temuan

### S1 — Proxy TTS `/api/tts` terbuka (tanpa rate limit & auth) — ✅ diperbaiki

- **Severity:** Sedang–Tinggi · **Lokasi:** `app/api/tts/route.ts:11-63`
- **Deskripsi:** Endpoint ini dapat dipanggil siapa saja (tidak butuh login)
  dan meneruskan permintaan ke layanan TTS Google (endpoint tidak resmi
  `translate_tts`). Tidak ada rate limiting, tidak ada batasan origin, dan
  cache in-memory (maks 5.000 entri) bisa dimanipulasi.
- **Dampak potensial:**
  - Server dipakai sebagai **proxy gratis** untuk sintesis suara (biaya/kuota,
    IP server kita terekspos ke Google).
  - **DoS ringan**: banjir request mengisi cache dan konsumsi bandwidth;
  - Google bisa **memblokir IP** Vercel karena pola tidak wajar.
- **Rekomendasi:**
  1. Tambah rate limit in-memory per IP (mis. token bucket, 30–60 request/menit)
     → `429` bila lewat.
   2. Validasi `lang` terhadap whitelist (`zh-CN`, dst).
   3. (Jangka menengah) ganti ke TTS ber-API key resmi (Azure Edge/Cloud, ElevenLabs)
      atau jalankan TTS di client (Web Speech sudah ada sebagai fallback).

**Status:** Rate limit token-bucket 60 req/menit/IP (`RATE_LIMIT_WINDOW_MS`,
`RATE_LIMIT_MAX`) + whitelist bahasa (`ALLOWED_LANGS`) diterapkan di
`app/api/tts/route.ts`; `429` dikembalikan bila lewat. Rekomendasi 3 tetap
berlaku sebagai peningkatan jangka menengah.

### S2 — Tidak ada Content Security Policy (CSP) — ✅ diperbaiki

- **Severity:** Sedang · **Lokasi:** `next.config.ts`, `app/layout.tsx:45-52`
- **Deskripsi:** Belum ada header CSP. Aplikasi memakai **script inline**
  (skrip tema di `<head>`), sehingga CSP ketat (`script-src 'self'`) akan
  memblokirnya tanpa penyesuaian.
- **Dampak:** Tanpa CSP, risiko XSS (jika ditemukan celah) meningkat — attacker
  bisa membaca localStorage (progress) dan melakukan aksi atas nama user.
- **Rekomendasi:**
  1. Pindahkan skrip tema inline ke file eksternal (`public/theme-init.js`)
     yang di-serve dengan `Content-Security-Policy` tepat.
  2. Tambah header CSP minimal:
     `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
     img-src 'self' data:; connect-src 'self' https://<ref>.supabase.co;
     media-src 'self'`.
   3. Verifikasi via `next.config.ts` → `headers()` atau platform (Vercel).

**Status:** Skrip tema dipindah ke `public/theme-init.js`; CSP + header keamanan
dipasang di `next.config.ts` `headers()` (lihat "Proteksi yang sudah baik").
Karena statis-rendered, `script-src` memakai `'unsafe-inline'` untuk skrip RSC
bawaan Next; adopsi nonce = keputusan terpisah (butuh dynamic rendering).

### S3 — Parameter `next` di callback tidak divalidasi — ✅ diperbaiki

- **Severity:** Rendah · **Lokasi:** `app/auth/callback/route.ts:15,26`
- **Deskripsi:** `next` dipakai langsung pada redirect `${origin}${next}`.
  Karena `origin` di-prefix, **open redirect klasik tidak terjadi**, tetapi
  `next` tidak dipastikan dimulai dengan `/` (bukan `//`).
- **Dampak:** Nilai aneh seperti `next=//evil.com` menghasilkan URL
  `https://levio.app//evil.com` — masih di origin, tapi bentuknya mencurigakan
  dan bisa disalahgunakan untuk phishing.
- **Rekomendasi:** validasi: `const safe = next?.startsWith("/") && !next.startsWith("//") ? next : "/profile";`

**Status:** `safeNext` di `app/auth/callback/route.ts` — menolak `//`, `://`, dan
`\`, serta apa pun yang tidak diawali `/`; default `/profile`. Tipe `recovery`
diarahkan ke `/auth/reset-password`.

### S4 — Parameter `lang` TTS tidak divalidasi — ✅ diperbaiki

- **Severity:** Rendah · **Lokasi:** `app/api/tts/route.ts:13`
- **Deskripsi:** `tl` (target language) diterima langsung dari query tanpa
  whitelist. Sebagian besar bahasa tetap bisa disintesis Google; ini bukan
  eksploitasi, tapi permukaan yang tidak perlu.
- **Rekomendasi:** whitelist bahasa yang dipakai aplikasi (`zh-CN`, `en`, `id`).

**Status:** `ALLOWED_LANGS = new Set(["zh-CN", "en", "id"])` di
`app/api/tts/route.ts`; `400 "unsupported language"` selain itu.

### S5 — Data localStorage tanpa enkripsi & sensitif terhadap XSS — desain diterima

- **Severity:** Rendah · **Lokasi:** `lib/progress.ts:300-327`, `lib/settings.ts`
- **Deskripsi:** Progress/settings disimpan sebagai JSON plaintext di
  localStorage (wajar untuk data non-sensitif). Yang perlu diingat: siapa pun
  yang bisa mengeksekusi JS di halaman ini (XSS) bisa membaca/mengganti seluruh
  state lokal dan memaksa sync ke cloud.
- **Dampak:** Melengkapi S2 — proteksi terbaik adalah mencegah XSS (CSP) dan
  memvalidasi input (sudah ada `sanitizeProgress`).
- **Rekomendasi:** jangan pernah simpan token/PII selain nama di localStorage;
  pertimbangkan memindahkan data rahasia ke IndexedDB dengan enkripsi bila
  kebijakan berubah.

### S6 — Import progress bisa menaikkan statistik (curang via file) — ✅ sebagian

- **Severity:** Rendah · **Lokasi:** `components/profile-view.tsx:116-131`,
  `lib/progress.ts:108-166`
- **Deskripsi:** Fitur impor menerima JSON apa pun dan langsung menuliskannya ke
  state + cloud. `sanitizeProgress` mencegah nilai tak valid, tapi tidak
  mencegah user mengimpor file buatan sendiri berisi XP/streak besar.
- **Dampak:** Bukan eksploitasi server (RLS tetap membatasi), hanya integritas
  gamifikasi. Relevan bila nanti ada leaderboard global.
- **Rekomendasi:** bila leaderboard/peringkat jadi fitur, tandai akun yang
  melakukan import (kolom `imported_at`) atau batasi import hanya untuk migrasi.

**Status:** Kolom `imported_at` ditambahkan (migration `0005_add_imported_at.sql`)
dan di-set saat `importProgress`. Penegakan (batasi/pelabelan saat leaderboard)
tetap keputusan produk di masa depan.

### S7 — Header keamanan dasar belum diatur — ✅ diperbaiki

- **Severity:** Rendah · **Lokasi:** `next.config.ts`
- **Deskripsi:** Tidak ada `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, atau `Strict-Transport-Security`.
- **Dampak:** Rendah untuk aplikasi ini (tanpa iframe/embed penting), tapi
  menaikkan standar perlindungan.
- **Rekomendasi:** tambahkan lewat `next.config.ts` `headers()`:
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `X-Frame-Options: DENY` (atau `frame-ancestors 'none'`)
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`

**Status:** Semua header dipasang di `next.config.ts` `headers()`; `frame-ancestors 'none'`
sudah ada di CSP, HSTS hanya di produksi (HTTPS).

## Checklist rilis (security)

Sebelum setiap rilis ke produksi:

- [ ] `git ls-files | grep -E "\.env"` hanya berisi `.env.example`.
- [ ] Tidak ada secret baru di kode/bundle (scan `NEXT_PUBLIC_`, `sk-`, `service_role`).
- [ ] Supabase: RLS aktif di semua tabel (cek SQL Editor → RLS Policies).
- [ ] Supabase: hanya provider yang diinginkan aktif (Email ± Google);
      "Confirm email" per kebijakan produk.
- [ ] Supabase: `Site URL` & `Redirect URLs` benar (tidak ada `*` terbuka).
- [ ] `/api/tts` rate limit aktif (60 req/menit/IP) & `text` ≤ 200; bahasa ter-whitelist.
- [ ] CSP & header keamanan hadir di produksi (cek `curl -sI https://<host>/`).
- [ ] Migrasi `0005_add_imported_at.sql` sudah dijalankan di Supabase.
- [ ] Bump versi cache service worker bila aset statis berubah.
- [ ] Tidak ada dependensi baru yang mencurigakan (`npm audit` bersih).

## Referensi silang

- Struktur & alur data: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Skema DB & RLS: [`data-model.md`](./data-model.md)
- Daftar bug fungsional: [`BUGS.md`](./BUGS.md)
