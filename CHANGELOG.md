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
