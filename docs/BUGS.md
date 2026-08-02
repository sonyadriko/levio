# Potensi Bug — Levio

Hasil **audit kode manual** pada rilis saat ini (`v0.8.0`).
Dokumen ini mendaftar potensi bug, masalah kebersihan data, dan celah
gamifikasi yang ditemukan selama review, lengkap dengan lokasi kode, dampak,
dan rekomendasi perbaikan.

> Status: **B1–B14 ✅ diperbaiki di v0.8.0**. Baris di bawah mencatat temuan asli
> dan lokasi perbaikannya. Nomor `[B-n]` dipakai sebagai ID referensi di PR/issue.
> **B15 ✅ diperbaiki di v0.10.0** (ditemukan saat E2E modul gym).

## Ringkasan

| ID | Severity | Area | Ringkasan | Status |
|---|---|---|---|---|
| B1 | Sedang | Flashcard | Kartu bergeser setelah swipe menjawab (dragX tidak direset) | ✅ |
| B2 | Sedang | Pelajaran | Hasil retest kata yang salah tidak tercatat ke SRS | ✅ |
| B3 | Tinggi | Sync | Data lokal perangkat kedua hilang saat login (cloud menang tanpa konfirmasi) | ✅ |
| B4 | Rendah | Sync | Baris cloud lama tidak pernah dihapus saat state menyusut | ✅ |
| B5 | Sedang | Gamifikasi | XP farming tanpa batas lewat mock test / tes kelulusan | ✅ |
| B6 | Rendah | Checklist | Item Gym selalu belum selesai; label "HSK 1" hardcode | ✅ |
| B7 | Rendah | Pengingat | Validasi waktu pengingat menerima nilai invalid ("99:99") | ✅ |
| B8 | Rendah | Import | `sanitizeProgress` tidak clamp nilai negatif | ✅ |
| B9 | Rendah | Sync | Reset progress meninggalkan baris cloud lama / membuat ulang profil kosong | ✅ |
| B10 | Rendah | Performa | `build()` dipanggil ulang di setiap render layar setup | ✅ |
| B11 | Rendah | PWA | Cache service worker tidak di-version; aset lama menumpuk | ✅ |
| B12 | Rendah | Auth | Tidak ada flow "Lupa kata sandi" walau callback sudah mendukung recovery | ✅ |
| B13 | Rendah | Kebersihan | Dua kunci i18n dalam satu baris (`lib/i18n.ts`) | ✅ |
| B14 | Rendah | UI | Tes wisuda HSK 6 muncul tapi tidak bisa membuka level apa pun | ✅ |
| B15 | Rendah | Gym | Grafik progress: `topWeight` hanya menghitung set `done`, inkonsisten dengan `est1RM` yang menghitung semua set | ✅ |

Detail tiap temuan di bawah. Referensi lokasi memakai `file:baris`.

## Status perbaikan (v0.8.0)

Semua temuan B1–B14 diperbaiki. Lokasi perbaikan:

| ID | Perbaikan |
|---|---|
| B1 | Reset `setDragX(0)` di `answer()` — `components/flashcard-deck.tsx` |
| B2 | `recordReview(word, true)` dipanggil saat retest benar — `components/lesson.tsx` |
| B3 | `mergeProgress` dua arah saat login bila snapshot lokal tak berubah — `lib/progress.ts` + `components/progress-provider.tsx` |
| B4 | `deleteStaleRows` per-chunk di `pushProgress` — `lib/supabase/sync.ts` |
| B5 | Cap XP tes harian `MAX_TEST_XP_PER_DAY = 200` via state `testXpByDate`; UI memakai XP yang benar-benar diberikan (`awarded`) — `lib/progress.ts` + komponen tes |
| B6 | Item Gym dihapus dari checklist; label memakai level dinamis (`unlockedUpTo`) — `components/daily-checklist.tsx` |
| B7 | Validasi jam 00–23 & menit 00–59 (`isValidTime`) — `lib/reminder.ts` + `components/reminder-card.tsx` |
| B8 | Semua angka di-`Math.max(0, …)` — `sanitizeProgress` di `lib/progress.ts` |
| B9 | `deleteStaleRows` + skip push saat state default — `lib/supabase/sync.ts` + `components/progress-provider.tsx` |
| B10 | `useMemo` untuk `questionCount`; builder di-hoist ke module scope — `components/practice-session.tsx`, `sentence-builder.tsx`, `listening-practice.tsx`, `reading-practice.tsx` |
| B11 | `CACHE_NAME = "levio-shell-v2"` + pruner aset berumur > 30 hari — `public/sw.js` |
| B12 | Mode "Lupa sandi" di `AuthCard` + halaman `/auth/reset-password` + `resetPassword` di provider — `components/profile-view.tsx`, `app/auth/reset-password/page.tsx` |
| B13 | Kunci `profile.role` dipisah ke baris masing-masing — `lib/i18n.ts` |
| B14 | Blok wisuda disembunyikan saat `level === MAX_HSK_LEVEL`; tampil kartu `level.maxReached` — `components/level-content.tsx` |

---

## B15 — `topWeight` inkonsisten dengan `est1RM` di progress per latihan

- **Severity:** Rendah · **Area:** Gym / Logika
- **Lokasi:** `lib/gym.ts` — `exerciseProgressPoints` (sebelum perbaikan)
- **Deskripsi:** Saat E2E halaman detail latihan (rilis 0.10.0), grafik metrik
  "Beban" (topWeight) menampilkan 0 untuk sesi yang set-nya belum ditandai
  `done` (mis. Squat 100×5 done:false), padahal metrik "1RM" sudah benar
  menghitung semua set. Akar masalah: `topWeight` hanya menjumlah set `done`,
  sedangkan `estOneRepMax` menghitung seluruh set — hasil dua metrik tidak
  konsisten untuk data lama.
- **Dampak:** Grafik beban kosong/menyesatkan untuk latihan yang log-nya tidak
  mencentang done (umum pada data sebelum fitur done).
- **Rekomendasi:** hitung `topWeight` untuk semua set valid
  (`set.reps > 0 && set.weightKg > topWeight`), bukan hanya yang `done`.
- **Perbaikan:** `lib/gym.ts` `exerciseProgressPoints` — kondisi update
  `topWeight` diubah ke `set.reps > 0 && set.weightKg > topWeight`; ditutup
  unit test di `tests/gym.test.ts` (E2E Squat: PR 116.7 kg Epley, Beban 100 kg).

---

## B1 — Kartu flashcard bergeser setelah swipe menjawab

- **Severity:** Sedang · **Area:** UI/Interaksi
- **Lokasi:** `components/flashcard-deck.tsx:60-75`, `components/flashcard-deck.tsx:97-113`, `components/flashcard-deck.tsx:237`
- **Deskripsi:** `answer()` tidak mereset state `dragX`. Saat user menggeser kartu
  melewati ambang 80px, `onPointerUp` memanggil `answer(dx > 0)`, tetapi `dragX`
  tetap berisi sisa geseran (mis. `120`). Kartu berikutnya (indeks baru) dirender
  dengan `style.transform: translateX(dragXpx)` sehingga tampak bergeser ke
  samping. Kondisi baru beres saat pointer menyentuh kartu lagi
  (`onPointerDown` mereset `dragX` ke 0).
- **Dampak:** Glitch visual di kartu setelah menjawab via swipe; pada kasus swipe
  jauh, kartu berikutnya tampak keluar dari viewport.
- **Rekomendasi:** reset `setDragX(0)` di `answer()` (sebelum index maju), atau
  set `dragX` ke 0 saat `session.index` berubah.

## B2 — Hasil retest kata yang salah di pelajaran tidak tercatat

- **Severity:** Sedang · **Area:** SRS / Logika
- **Lokasi:** `components/lesson.tsx:127-152`
- **Deskripsi:** `pick()` mencatat `recordReview` hanya sekali per kata per sesi
  (guard `recorded.current`). Kata yang salah ditambahkan lagi ke akhir antrean
  (siklus inferensi-feedback), tetapi jawaban **benar saat retest tidak
  di-record** ke SRS. `WordProgress` kata tetap memakai hasil jawaban salah
  pertama, sehingga `nextReview` tetap "hari ini" (retry cepat) dan tidak naik
  interval.
- **Dampak:** Kata yang sudah benar saat diuji ulang tetap dianggap salah oleh
  SRS — muncul kembali di Latihan SRS di hari yang sama; statistik "benar"
  menjadi lebih rendah dari performa nyata.
- **Rekomendasi:** catat hasil retest (mis. `recordReview(word, true)` saat
  retest benar), sambil tetap memakai `firstTryCorrect` untuk skor layar selesai.

## B3 — Data lokal perangkat kedua hilang saat login (cloud menang tanpa konfirmasi)

- **Severity:** Tinggi (risiko kehilangan data) · **Area:** Sync
- **Lokasi:** `components/progress-provider.tsx:153-161`
- **Deskripsi:** Saat login di perangkat yang sudah punya progress lokal, jika
  cloud sudah punya data (`hasCloudData(profile)`), kode langsung
  `setProgress(cloud)` — seluruh state lokal ditimpa **tanpa merge dan tanpa
  konfirmasi**. Data lokal yang belum pernah ter-push hilang diam-diam. Tidak ada
  penyatuan dua arah; kebijakannya last-writer-wins dengan prioritas cloud.
- **Dampak:** Pengguna multi-perangkat bisa kehilangan progress lokal perangkat
  yang jarang login (yang seharusnya ikut digabung).
- **Rekomendasi:**
  1. Tampilkan dialog "cloud vs lokal" (pilih sumber data),
  2. atau implement merge dua arah: XP/streak = nilai maksimum, gabungkan
     `words` dan `activityByDate` (baris yang tidak ada di salah satu sisi
     ditambahkan, bukan ditimpa).

## B4 — Baris cloud lama tidak pernah dihapus saat state menyusut

- **Severity:** Rendah · **Area:** Sync / Kebersihan data
- **Lokasi:** `lib/supabase/sync.ts:88-93`
- **Deskripsi:** `pushProgress` hanya melakukan `upsert` — tidak ada `delete`
  untuk baris yang sudah tidak ada di state lokal. Jika state menyusut (import
  dataset lebih kecil, kata direset, atau penghapusan), baris lama di
  `daily_activity` / `word_progress` tetap ada di cloud dan **bangkit kembali**
  saat pull berikutnya (pull menggabungkan seluruh baris cloud).
- **Dampak:** Statistik bisa menampilkan data usang; database membesar seiring
  waktu. `importProgress` sudah benar (hapus dulu lalu push) — tetapi jalur
  normal tidak.
- **Rekomendasi:** di `pushProgress`, lakukan `delete` untuk baris milik user
  yang id-nya tidak ada di state, atau gunakan pola hapus-lalu-upsert seperti
  `importProgress`.

## B5 — XP farming tanpa batas lewat mock test / tes kelulusan

- **Severity:** Sedang · **Area:** Gamifikasi / Fairness
- **Lokasi:** `lib/progress.ts:250-253`, `components/mock-test.tsx:154-161,202`,
  `components/level-test.tsx:60-75`
- **Deskripsi:** `testXp` memberikan XP pada setiap ujian selesai **termasuk
  gagal** (`correct * 5 * (0.5 + accuracy * 0.5)`), dan mock test / tes
  kelulusan bisa diulang tanpa batas. Tidak ada cap harian.
- **Dampak:** Pengguna bisa mengumpulkan XP, streak, dan badge tanpa belajar
  sungguhan; merusak fairness level/XP di leaderboard.
- **Rekomendasi:** cap XP per hari, beri XP hanya saat skor membaik/lulus, atau
  batasi jumlah percobaan per hari.

## B6 — Checklist: item Gym selalu belum selesai + label "HSK 1" hardcode

- **Severity:** Rendah · **Area:** UI/i18n
- **Lokasi:** `components/daily-checklist.tsx:28,63`
- **Deskripsi:** Item gym `done: false` selalu (modul masih placeholder), dan
  label `checklist.learn.label` di-hardcode ke "kosakata **HSK 1**" padahal
  kosakata baru bisa dipelajari dari level mana pun.
- **Dampak:** User bisa menganggap harus menyelesaikan item yang belum ada;
  label tidak akurat saat belajar di level lain.
- **Rekomendasi:** sembunyikan item gym sampai V2; jadikan level pada label
  dinamis (dari `progress.unlockedUpTo` atau level aktif).

## B7 — Validasi waktu pengingat menerima nilai invalid

- **Severity:** Rendah · **Area:** Logika
- **Lokasi:** `lib/reminder.ts:23`
- **Deskripsi:** Regex `/^\d{2}:\d{2}$/` hanya memeriksa format, tidak
  memvalidasi range. Nilai seperti `"99:99"` lolos; `isPastTime` akan
  menghasilkan `now.getHours() > 99` yang selalu `false`, sehingga pengingat
  tidak pernah terkirim.
- **Dampak:** Pengingat macet jika storage berisi nilai korup; umumnya aman
  karena `<input type="time">` memberi nilai valid, tapi defensif lebih baik.
- **Rekomendasi:** validasi jam `00-23` dan menit `00-59`.

## B8 — `sanitizeProgress` tidak clamp nilai negatif

- **Severity:** Rendah · **Area:** Import
- **Lokasi:** `lib/progress.ts:160-161`
- **Deskripsi:** `xp` dan `streak` di-clamp ≥ 0, tetapi `completedReviews`,
  `completedTests`, dan angka di `activityByDate` bisa bernilai negatif bila file
  import diedit tangan (`toNumber` mengizinkan bilangan negatif).
- **Dampak:** Statistik aneh (total review negatif, bar chart negatif).
- **Rekomendasi:** bungkus semua angka dengan `Math.max(0, toNumber(...))`.

## B9 — Reset progress: baris cloud lama tertinggal + profil kosong dibuat ulang

- **Severity:** Rendah · **Area:** Sync / Kebersihan data
- **Lokasi:** `components/progress-provider.tsx:98-105,182-193`
- **Deskripsi:** `resetProgress` menghapus data cloud (`deleteAllData`), tetapi
  efek push debounce (600ms) ikut berjalan dan meng-`upsert` profil kosong
  (baris `profiles` dibuat ulang). Sebaliknya, baris `daily_activity` /
  `word_progress` lama dari sesi sebelumnya tidak ikut dihapus oleh push karena
  state sudah kosong (push hanya mengirim baris yang ada).
- **Dampak:** Sisa baris lama tetap di DB; profil kosong tercipta ulang. Tidak
  merusak fungsi (`hasCloudData` = false), tapi tidak bersih.
- **Rekomendasi:** buat `pushProgress` ikut menghapus baris yang tidak ada di
  state; atau tangguhkan push sampai operasi reset selesai (mis. flag `isResetting`).

## B10 — `build()` dipanggil ulang di setiap render layar setup

- **Severity:** Rendah · **Area:** Performa
- **Lokasi:** `components/practice-session.tsx:99`, `components/sentence-builder.tsx:74-75`
- **Deskripsi:** `questionCount = build(words, level).length` dieksekusi di tiap
  render untuk menampilkan jumlah soal. Untuk HSK 5–6 (1.300–2.499 kata), ini
  berarti generate + shuffle + segmentasi kalimat berulang kali walau input
  tidak berubah.
- **Dampak:** Sedikit jank pada level besar saat render; tidak fatal.
- **Rekomendasi:** bungkus dengan `useMemo(() => build(words, level).length, [words, level])`.

## B11 — Cache service worker tidak di-version; aset lama menumpuk

- **Severity:** Rendah · **Area:** PWA / Offline
- **Lokasi:** `public/sw.js:1,13-22`
- **Deskripsi:** `CACHE_NAME = "levio-shell-v1"` bersifat statis. Navigasi
  memakai network-first (HTML baru tiap rilis), tetapi aset JS/CSS hashed lama
  tetap dicache (cache-first) dan tidak pernah dibersihkan — `activate` hanya
  menghapus cache yang berbeda nama. Cache tumbuh tanpa batas antar rilis.
- **Dampak:** Konsumsi storage browser membesar; aset lama tidak pernah diprune.
- **Rekomendasi:** naikkan versi `CACHE_NAME` per rilis (mis. `levio-shell-v2`),
  atau tambahkan pruner berdasarkan tanggal/umur aset.

## B12 — Tidak ada flow "Lupa kata sandi"

- **Severity:** Rendah · **Area:** Auth (fitur tidak lengkap)
- **Lokasi:** `app/auth/callback/route.ts:4-11`, `components/profile-view.tsx:234-439`
- **Deskripsi:** Callback auth sudah mendukung `type: "recovery"`, tetapi tidak
  ada tombol/link "Lupa kata sandi" di `AuthCard` dan tidak ada pemanggilan
  `supabase.auth.resetPasswordForEmail`.
- **Dampak:** User yang lupa sandi tidak bisa memulihkan akun dari aplikasi.
- **Rekomendasi:** tambah link "Lupa kata sandi" di `AuthCard` yang memanggil
  `resetPasswordForEmail(email, { redirectTo: origin + "/auth/callback" })`.

## B13 — Dua kunci i18n dalam satu baris

- **Severity:** Rendah · **Area:** Kebersihan kode
- **Lokasi:** `lib/i18n.ts:309`
- **Deskripsi:** `"profile.role": "Pebelajar HSK", "profile.name": "Nama",`
  ditulis dalam satu baris. Berfungsi benar, tetapi tidak rapi dan berisiko
  konflik saat merge.
- **Rekomendasi:** pisahkan ke baris masing-masing.

## B14 — Tes wisuda HSK 6 muncul tapi tidak membuka level apa pun

- **Severity:** Rendah · **Area:** UI/i18n
- **Lokasi:** `components/level-content.tsx:48-49,57-78`
- **Deskripsi:** Untuk level 6 (frontier), `next = min(6, 7) = 6`, sehingga
  kalimat "buka HSK {next}" berbunyi "buka HSK 6" padahal sedang di HSK 6, dan
  `recordLevelPass(6)` tidak mengubah apa pun.
- **Dampak:** Teks menyesatkan di level tertinggi; tes hanya jadi sumber XP.
- **Rekomendasi:** sembunyikan blok wisuda saat `level === MAX_HSK_LEVEL`, atau
  tampilkan teks "level tertinggi tercapai".

---

## Catatan desain (bukan bug)

Temuan berikut **sengaja** dirancang demikian, namun perlu disadari:

1. **Mastered bisa turun.** `applyReview` menghitung ulang `mastered` dari
   `reviews/correct` tiap review, sehingga kata yang sudah dikuasai bisa
   menjadi belum dikuasai jika sering salah. Ini sesuai deskripsi UI
   (`word.masterHint`).
2. **Pengingat hanya aktif saat tab terbuka.** `DailyReminder` berjalan di
   `AppShell` (client). Notifikasi saat app tertutup butuh Push API — rencana V2.
3. **Tema tidak di-sync ke cloud.** `pullSettings` selalu memakai theme lokal.
   Disengaja agar tampilan perangkat tetap independen.
4. **Normalisasi pinyin "type" mode bersifat longgar.** `ü`/`v` → `u` dan nada
   dihilangkan, jadi `lǜ` dan `lù` sama-sama diterima. Ini membantu pengguna
   mengetik tanpa nada, tapi tidak bisa membedakan homofon.
5. **XP tanpa batas untuk latihan non-tes** (listening/reading/order). Konsisten
   dengan desain gamifikasi, tapi batasan harian bisa ditambahkan di V2.

## Cara berkontribusi

- Perbaiki satu ID per commit, referensikan `[B-n]` di pesan commit.
- Tambahkan uji (Vitest — rencana) untuk logika murni di `lib/` bila memungkinkan.
- Setelah perbaikan, tandai ID di dokumen ini sebagai `✅ diperbaiki`.
