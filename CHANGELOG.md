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

## [0.12.1] — 2026-08-03

### Diperbaiki
- **Sync cloud level per modul:** level terbuka modul English (dan modul lain selain HSK) kini tersimpan & dipulihkan lintas perangkat. Kolom `unlocked_by_module` (jsonb) ditambahkan ke `profiles` (migration **0008**) — `unlocked_up_to` tetap sumber otoritatif untuk HSK.

### Ditambahkan
- **Badge per modul:** badge kuasai & lulus digenerate otomatis untuk setiap bahasa (HSK, English) dari registry modul.
- **Statistik per modul:** halaman Statistik mengelompokkan progress per level berdasarkan modul; legenda label master/kuasai berlaku per modul.
- **Checklist harian netral modul:** target kosakata harian ("{n} kosakata baru") & mock test tidak lagi mengacu spesifik HSK.

### Teknis
- `lib/badges.ts` → badge digenerate dari `allLanguageModules()` (`master-<module>-<level>`, `graduate-<module>-1`).
- `components/stats-dashboard.tsx` → `ModuleLevelProgress({ module })` per modul.
- `components/daily-checklist.tsx` → label netral modul.
- `lib/supabase/sync.ts` + `types.ts` → push/pull `unlocked_by_module`.

---

## [0.12.0] — 2026-08-03

### Ditambahkan
- **Belajar multi-bahasa:** refactor modul belajar HSK menjadi arsitektur generik — hub `/learn` menampilkan pilihan modul, rute `app/learn/[lang]/[level]` melayani semua bahasa (SSG), redirect legacy `/learn/{n}` → `/learn/hsk/{n}` tetap berlaku.
- **Modul English (CEFR):** iterasi pertama A1–A2 (100 kosakata, arti bahasa Indonesia) untuk flashcard, daftar kata & mock test; level B1–C2 tampil untuk roadmap. Latihan bertuliskan (lesson/susun kalimat) dan mengetik pinyin hanya untuk modul CJK (HSK).
- **Progress per modul:** `unlockedByModule` + helper `unlockedFor` — level terbuka dihitung terpisah per bahasa; HSK tetap kompatibel (legacy `unlockedUpTo`).
- **Mock test & flashcards per modul:** `/practice` & `/mock-test` menerima `?module=`; tipe soal menyesuaikan kemampuan modul (English: kata↔arti; HSK: + pelafalan).

### Teknis
- `lib/languages/` (types, loader dengan cache+subscribe, mock-test generik, adapter HSK, modul English, registry) + `lib/english/` (data & level CEFR).
- Komponen belajar digeneralisasi dan menerima `moduleId` (objek modul berisi fungsi sehingga tidak dilewatkan lintas boundary RSC).

### Catatan
- English data awal terbatas (A1–A2); pengisian B1–C2 menyusul di rilis berikutnya.

---

## [0.11.0] — 2026-08-03

### Ditambahkan
- **Item gym di Daily Checklist & reminder workout:** task baru `checklist.gym` di beranda (ikon dumbbell, link ke `/gym`, selesai bila ada sesi hari ini via `workoutDoneOn`); reminder web kini membedakan — sudah belajar tapi belum workout → body khusus gym.
- **Sync gym ke cloud (Supabase):** sesi selesai + XP harian + progres program tersinkron antar perangkat via `gym_sessions` & `gym_xp_by_date` (migration 0006), diorkestrasi `gym-sync.tsx` (pull + `mergeGym` saat login, push debounce 600 ms); reset akun turut menghapus data gym cloud.
- **Program workout multi-minggu:** `lib/gym-programs.ts` + UI `gym-program.tsx` di `/gym` — program contoh PPL 4 pekan (Push/Pull/Legs 3×/minggu) dengan target set/reps per latihan & estimasi durasi; sesi dari program membawa penanda `programId/programWeek/programDay` (migration 0007) sehingga progres ter-tracking per pekan × hari dan ikut tersinkron.
- **Streak gabungan & reminder pintar:** `lib/habits.ts` — hari aktif = belajar ATAU gym; `overallStreak` ditampilkan di beranda; reminder memilih body sesuai aktivitas yang belum dikerjakan (`studyNotifyBody` saat gym sudah, belajar belum).
- **Custom domain:** panduan Opsi A/B DNS di `docs/DEPLOY.md` (`levio.space` → A `76.76.21.21` + CNAME `cname.vercel-dns.com`; hapus record A ganda agar Vercel tidak misconfigured).

### Catatan
- Migration Supabase **0006 & 0007** wajib dijalankan (SQL Editor) agar sync cloud aktif.

---

## [0.10.0] — 2026-08-02

### Ditambahkan
- **Database latihan (56 latihan):** halaman `/gym/exercises` untuk browse + cari + filter muscle group (Dada/Punggung/Bahu/Lengan/Kaki/Perut), menampilkan total sesi & PR (best est. 1RM) per latihan; halaman detail `/gym/exercises/[id]` dengan 4 kartu stat (PR + tanggal, jumlah sesi, total set, volume total), tab metrik **1RM / Beban / Volume**, grafik garis, dan daftar sesi terbaru.
- **Grafik progress per latihan:** `LineChart` SVG kustom (area gradient + garis teal + titik data, tanpa dependensi) memakai `estOneRepMax` (Epley `beban × (1 + reps/30)`, reps ≤ 30) dan `exerciseProgressPoints` yang mengagregasi per tanggal sesi — key = `exerciseId` atau nama bebas-text (case-insensitive, cocok untuk data lama tanpa exerciseId).
- **Rest timer per latihan:** durasi istirahat per latihan (45–180 dtk, default dari DB), **auto-start** saat satu set ditandai selesai, countdown mm:ss, tombol **skip**, dan **beep** (Web Audio) + **vibrate** (`navigator.vibrate`) saat waktu habis.
- **Pemilih latihan dari DB** di form sesi ("Tambah Latihan"): cari + filter muscle group + tombol "Latihan kustom" — latihan ditambahkan dengan `exerciseId` + rest default dari `EXERCISE_DB`.
- **Link riwayat ke detail:** nama latihan di riwayat sesi kini menaut ke `/gym/exercises/[exerciseId]` + label muscle group.

### Teknis
- `lib/gym-exercises.ts` (baru): `EXERCISE_DB` (56 entry dengan `id`, `nameKey`, `muscles`, `restSeconds` 45–180), `getExerciseDef`, `defaultRestSeconds` (`DEFAULT_REST_SECONDS = 90`).
- `GymExerciseLog` mendapat field opsional `exerciseId?: string` & `restSeconds?: number` — data `levio.gym.v2` lama tetap valid (backward-compat; `normalizeExercise` hanya menyimpan `restSeconds` bila > 0).
- `RoutineExercise` kini wajib punya `exerciseId`; `templateSessionDraft` memetakan `exerciseId` + `restSeconds` dari DB.
- `lib/gym.ts` + `use-gym.ts`: `addExerciseFromDb`, `setExerciseRest`, `estOneRepMax`, `exerciseProgressPoints`.
- Perbaikan bug yang ditemukan saat E2E: `exerciseProgressPoints` kini menghitung `topWeight` hanya untuk set valid (`reps > 0 && weightKg > topWeight`) — sebelumnya `topWeight` hanya menjumlah set `done` padahal `est1RM` menghitung semua set.

---

## [0.9.0] — 2026-08-02

### Ditambahkan
- **Modul Gym (V2) berbasis sesi:** latihan dicatat dalam sesi (mulai dari template Push/Pull/Legs PPL, Upper/Lower, Full Body — latihan, set, & muscle group ter-prefill — atau sesi bebas). Set disimpan **per-row**: tiap set punya beban (kg), repetisi, dan status selesai (done). Sesi aktif tersimpan di `levio.gym.v2` sehingga aman saat refresh.
- **Riwayat sesi expandable:** daftar per tanggal, detail per-latihan/per-set, hapus sesi dengan konfirmasi.
- **Volume per muscle group** (chest, back, shoulders, arms, legs, core) dari Σ beban×repetisi tiap set.
- **XP gym terintegrasi ke akun:** 10 XP per sesi selesai (maks 30/hari, anti-farming via `xpByDate`) masuk ke pool XP & aktivitas harian, TANPA menaikkan streak belajar — `applyGymXp` tidak menyentuh `lastActiveDate`; streak gym dihitung terpisah dari tanggal sesi selesai.
- **shadcn/ui** diadopsi (base-ui): Button, Card, Dialog, Input, Label, Select, Sheet, Textarea + `cn()`; tema global selaras palette stone/teal.

### Teknis
- `lib/gym.ts` ditulis ulang ke model sesi (`GymSession`/`GymExerciseLog`/`GymSet`) menggantikan model entri agregat; key storage `levio.gym.v1` → `levio.gym.v2` (belum pernah dirilis, tanpa migrasi).
- `lib/progress.ts` mendapat `applyGymXp` (XP murni tanpa update streak); `ProgressProvider` mengekspos `awardGymXp`.

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
