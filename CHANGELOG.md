# Changelog

Semua perubahan penting dicatat di file ini. Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

Format: `MAJOR.MINOR.PATCH`
- **MAJOR** — perubahan tidak kompatibel.
- **MINOR** — fitur baru (kompatibel).
- **PATCH** — perbaikan bug (kompatibel).

Sumber versi tunggal: **`package.json` → `version`**. `lib/version.ts` memuat versi
untuk tampilan aplikasi + catatan rilis singkat ("Yang Baru"). Keduanya harus
selalu disinkronkan saat rilis (lihat `docs/CONTRIBUTING` tidak ada; aturan ada di
`docs/ARCHITECTURE.md`).

## Cara rilis

1. Bump `version` di `package.json` + `APP_VERSION` di `lib/version.ts`.
2. Tambahkan entri di sini (Urutan: terbaru di atas) + highlight di `RELEASE_NOTES`.
3. Commit dengan pesan `release: vX.Y.Z`.

---

## [0.8.0] — 2026-08-02

### Ditambahkan
- **Lupa kata sandi** — mode "Lupa sandi" di kartu login (`AuthCard`) mengirim tautan reset via email; halaman `/auth/reset-password` untuk menetapkan sandi baru; tipe `recovery` pada callback auth diarahkan ke halaman tersebut.
- **Keamanan:** Content-Security-Policy + header keamanan (`X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS di produksi) via `next.config.ts`; skrip tema dipindah ke `public/theme-init.js` agar tetap bekerja tanpa flash di bawah CSP.
- **Rate limit & whitelist bahasa** pada API TTS (`/api/tts`): maksimal 60 request/menit per IP + hanya `zh-CN`/`en`/`id`.

### Perbaikan
- **Sync cloud:** hapus baris `daily_activity`/`word_progress` basi per-chunk saat import/progress (B4/B9); state baru `testXpByDate` ikut di-merge saat login (B3); tekan push jika data lokal masih default (mencegah profil kosong dibuat ulang).
- **XP tes harian:** cap XP dari mock/level-test di `testXpByDate` (maks 200/hari) — tampilan XP kini memakai XP yang benar-benar diberikan (B5).
- **Pelajaran:** review kata salah langsung dijadwalkan ulang di tiap percobaan (B2); kartu flashcard tidak tersangkut setelah swipe (B1).
- **Checklist harian** tidak lagi menampilkan item Gym; label tes mengikuti level terbuka (B6).
- **HSK 6** tidak menampilkan tombol wisuda; hanya kartu "level tertinggi" (B14).
- **Pengingat harian:** validasi jam (00–23/00–59) agar tidak membuat notifikasi tak terjadwal (B7).
- **Robustness:** `sanitizeProgress` memotong nilai negatif (B8); pertanyaan latihan distabilkan dengan `useMemo` & builder di luar komponen (B10); versi service worker `levio-shell-v2` + pembersihan cache aset lama (B11).
- `testXp` mengembalikan 0 bila total soal 0 (defensif, ditemukan lewat unit test).

### Keamanan
- `safeNext` pada `app/auth/callback` memblokir `next` non-internal (open-redirect) dan mengarahkan `recovery` ke halaman reset.

### Teknis
- Migrasi Supabase baru: `0005_add_imported_at.sql` (kolom `imported_at` di `profiles`) — jalankan berurutan setelah 0004.

---

## [0.7.0] — 2026-08-02

### Ditambahkan
- **Audio native** untuk latihan Mendengarkan: proxy TTS di `app/api/tts` (Google Translate TTS → MP3, cache in-memory) diputar lewat `<audio>`, dengan fallback otomatis ke Web Speech API saat offline. Tombol putar ulang kini memakai ikon speaker.
- **Mode offline (PWA):** service worker `public/sw.js` (network-first untuk navigasi, cache-first untuk aset) + registrasi production-only. Setelah kunjungan pertama, shell aplikasi bisa dibuka tanpa internet.
- **Paket animasi tanpa dependensi:** confetti pada layar selesai latihan, lingkaran progress SVG (`progress-ring`), counter angka animasi (`useCountUp`) untuk XP & skor, skeleton shimmer saat memuat kartu, efek flame pada streak, dan pop pada badge yang baru diraih.

### Perbaikan
- Kalimat contoh HSK 5 yang duplikat (`hsk5-172` 措施 kini "这个措施很有效。").

### Perubahan
- Ikon baru `volume` ditambahkan ke whitelist `IconName` (`lib/nav.ts`) + SVG di `components/icons.tsx`.
- `lib/use-count-up.ts` menggantikan `useCountUp` lokal di `mock-test`.

---

## [0.6.0] — 2026-08-02

### Ditambahkan
- **Kalimat contoh lengkap untuk seluruh kosakata**: setiap kata HSK 1–6 (4.990 kata) kini memiliki contoh kalimat (hanzi + pinyin + arti Bahasa Indonesia) untuk latihan Susun Kalimat & Reading.
- Latihan **Susun Kalimat** dan **Reading** kini berfungsi untuk **HSK 2–6** (sebelumnya hanya HSK 1 yang memiliki data kalimat).

### Perbaikan
- Memperbaiki kalimat contoh HSK 6 yang salah/kosong di banyak entry, termasuk blok kata 2251–2300 yang bergeser secara sistematis (+10) dan melengkapi 80 entry yang hilang (kata 671–750).

### Perubahan
- `lib/hsk/data.ts` dipecah menjadi per-level di `lib/hsk/data/`; contoh kalimat disimpan sebagai field `example*` di setiap kata (`lib/hsk/data/hsk*.ts`) dan digabung dengan bank statis `lib/hsk/sentences.ts` oleh `buildSentenceSource()` di `lib/hsk/exercises.ts`.

---

## [0.5.0] — 2026-08-01

### Ditambahkan
- Kosakata **HSK 6** lengkap (**2499 kata baru**, di luar HSK 1–5, sesuai daftar resmi HSK 2.0 dari XLS chinesetest.cn) di `lib/hsk/data.ts`.
- **HSK 5 dibangun ulang** mengikuti daftar resmi HSK 2.0: dari 1235 kata (dengan 53% kesalahan) menjadi **1300 kata resmi**; 366 kata lama yang ternyata HSK 6 dipindahkan ke level yang benar.
- Semua arti HSK 5 & HSK 6 dalam **Bahasa Indonesia** ditulis ulang/dilengkapi; pinyin & hanzi mengikuti daftar resmi.

### Perubahan
- Total kosakata aplikasi: **4.990 kata** (HSK 1: 150, HSK 2: 156, HSK 3: 287, HSK 4: 598, HSK 5: 1300, HSK 6: 2499).

## [0.4.0] — 2026-08-01

### Ditambahkan
- Kosakata **HSK 5** lengkap (**1235 kata baru**, di luar HSK 1–4, sesuai daftar resmi HSK 2.0) di `lib/hsk/data.ts`.
- `lib/hsk/data.ts` dipecah menjadi blok per level (`hsk1Words`–`hsk5Words`) + ekspor gabungan `hskWords` (menghindari limit inferensi TypeScript pada array raksasa).
- **Rebrand: Leveling → Levio** — nama tampilan, kunci localStorage (`levio.*` dengan migrasi otomatis dari `leveling.*`), nama file export progress, dan nama package.

### Perubahan
- Total kosakata aplikasi: **2.426 kata** (HSK 1: 150, HSK 2: 156, HSK 3: 287, HSK 4: 598, HSK 5: 1235).

## [0.3.0] — 2026-08-01

### Ditambahkan
- Kosakata **HSK 4** lengkap (**598 kata baru**, sesuai daftar resmi HSK 2.0; 得 & 等 sudah ada di HSK 2) di `lib/hsk/data.ts`.
- **Urutan kata pelajaran diacak** tiap sesi (bukan selalu urut daftar HSK) di `components/lesson.tsx`.

### Perubahan
- Total kosakata aplikasi: **1.191 kata** (HSK 1: 150, HSK 2: 156, HSK 3: 287, HSK 4: 598).

## [0.2.0] — 2026-08-01

### Ditambahkan
- Kosakata **HSK 3** lengkap (**287 kata baru**, dedup terhadap HSK 1/2 + direview terhadap daftar resmi HSK 2.0) di `lib/hsk/data.ts`.
- **Target XP harian** — item baru di Daily Checklist (`{n} XP hari ini`) + pengatur "XP/hari" di Profil; ikut di-sync cloud via `daily_targets` (jsonb).
- **Badge & penghargaan** (10 badge otomatis) di halaman Profil — diderivasi dari progress, tanpa storage baru (`lib/badges.ts`).
- **Grafik progress per level** (direview vs dikuasai per HSK) di halaman Statistik.
- **Pengingat harian** — notifikasi web (Notification API) dengan jam yang bisa diatur di Profil (`lib/reminder.ts`).
- **Sistem versioning** — `lib/version.ts` + CHANGELOG.md; versi & "Yang Baru" tampil di Profil.

### Perubahan
- `DailyTargets` kini memuat `xp` (default 100); sync cloud (`pullSettings`/`pushSettings`) menanganinya.
- Ikon baru: `trophy`, `star` (whitelist `lib/nav.ts` + `components/icons.tsx`).

### Teknis
- Migrasi Supabase baru: `0004_add_unlocked_up_to.sql` (kolom `unlocked_up_to` di `profiles`) — jalankan berurutan 0001→0004.

## [0.1.0] — Rilis awal

### Ditambahkan
- Auth email/password (Supabase), sync progress cloud, mode offline.
- Kurikulum HSK 1 (150 kata) & HSK 2 (156 kata baru).
- Pelajaran interaktif, flashcards + SRS (SM-2), mock test (4 tipe), latihan kalimat HSK 1.
- Tes kelulusan antar level (gating HSK N+1).
- Statistik harian/mingguan/bulanan/tahunan + heatmap.
- Tema terang/gelap/otomatis, UI bilingual (ID/EN).
- PWA installable, mobile-first responsive.
