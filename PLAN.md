# Plan Aplikasi "Levio"

Aplikasi belajar **HSK (Hanyu Shuiping Kaoshi)** berbasis web, dengan arsitektur modul yang extensible untuk versi selanjutnya: belajar bahasa **Jepang (JLPT)** / **Inggris**, plus fitur **kesehatan** (contoh: gym daily tracking).

---

## 1. Visi Produk

> "Satu platform untuk semua rutinitas self-improvement: bahasa + kesehatan, berbasis level dan konsistensi harian."

- **Core value:** belajar HSK jadi terstruktur, terukur, dan konsisten lewat sistem level/XP (gamifikasi).
- **Filosofi desain:** *modular*. Setiap "domain" (Bahasa Mandarin, Bahasa Jepang, English, Gym) adalah modul terpisah yang berbagi fondasi yang sama (user, streak, XP, progress tracking).

---

## 2. Target Pengguna & Masalah

| Persona | Masalah | Solusi |
|---|---|---|
| Pelajar HSK level 1–6 | Materi tercecer, susah tracking progres | Kurikulum terstruktur per level HSK + progress bar |
| Orang yang belajar otodidak | Kurang motivasi & konsistensi | Streak, XP, badge, reminder harian |
| Orang yang juga pengen jaga kesehatan | Aplikasi bahasa & gym terpisah-pisah | Satu akun untuk semua habit (bahasa + gym) |

---

## 3. Struktur Aplikasi (Modular)

```
Levio
├── Domain Bahasa (core)
│   ├── Mandarin (HSK)      ← V1
│   ├── Jepang (JLPT)       ← V2
│   └── English             ← V3
├── Domain Kesehatan
│   ├── Gym / Workout Log   ← V2 (paralel)
│   └── (future: tracking air, tidur, dll)
└── Shared Foundation
    ├── User & Auth
    ├── Streak / XP / Level / Badge
    ├── Daily Checklist & Reminder
    └── Analytics Dashboard
```

**Keuntungan modular:** nambah bahasa baru atau fitur kesehatan = hanya menambah modul, tanpa mengubah fondasi.

---

## 4. Fitur MVP (V1 — HSK Only)

### 4.1 Modul Belajar HSK
- **Kurikulum per level** (HSK 1–6, sesuai daftar kosakata resmi terbaru).
- **Vocabulary deck:** kata, hanzi, pinyin, arti, contoh kalimat, audio.
- **Pelajaran interaktif** per level (✅ V1): exposure singkat → retrieval practice pilihan ganda → feedback langsung; kata salah diuji ulang di akhir sesi, kata benar dijadwalkan SRS besok (berbasis riset: Roediger & Karpicke 2006; Karpicke & Roediger 2008; Cepeda et al. 2006).
- **Gating antar level** (✅ V1): lulus **tes kelulusan** HSK N (skor ≥ 60%) untuk membuka HSK N+1; level terkunci menampilkan tesnya.
- **Latihan pemahaman kalimat** (✅ V1, HSK 1): baca kalimat utuh (hanzi + pinyin), pilih artinya — dukungan konteks semantik (Mulder et al. 2018).
- **Flashcards / SRS** (Spaced Repetition System): review otomatis di hari ke-3, 7, 14, dst (✅ V1, interval SM-2).
- **Latihan per kategori:**
  - Pinyin → Hanzi
  - Hanzi → Arti
  - Susun kalimat (word order)
  - Listening (pilihan ganda)
  - Reading comprehension pendek
- **Mock test / simulasi ujian** per level (menit, skor, analisis lemah/kuat).

### 4.2 Sistem Gamifikasi (Shared)
- XP per aktivitas, level user, streak harian (✅ V1).
- Badge (✅ V1: 10 badge otomatis — streak 7/30 hari, XP, kosakata, tes — diderivasi dari progress, di halaman Profil).
- Leaderboard (opsional, mingguan — V3).

### 4.3 Dashboard & Habit
- Daily checklist: target kosakata hari ini, target XP harian (✅ V1: checklist + pengatur target di Profil).
- Kalender streak + grafik progress per level (✅ V1: grafik per level di Statistik).
- Reminder harian (✅ V1: notifikasi web via Notification API; email menyusul).

### 4.4 Akun & Data
- Auth (email/password via Supabase; Google OAuth menyusul).
- Progress sync (karena web, data di server / localStorage untuk MVP).
- Dark mode (✅ V1: terang/gelap/otomatis, disinkronkan antar perangkat via settings), bahasa UI: Indonesia + English.

---

## 5. Roadmap Bertahap

### V1 — MVP: Mandarin HSK (3–4 bulan)
- [x] Auth + profil + setting (login email/password, bahasa UI, tema, target harian)
- [x] Kurikulum HSK 1 (150 kata resmi) + HSK 2 (156) + HSK 3 (287) + HSK 4 (598) — HSK 5–6 menyusul
- [x] Pelajaran interaktif per level (retrieval practice + feedback + spacing)
- [x] Flashcards + SRS
- [x] Latihan pinyin / hanzi / arti (mock test, 4 tipe pilihan ganda)
- [x] Latihan pemahaman kalimat (bank kalimat HSK 1)
- [x] Tes kelulusan antar level (lulus HSK N → buka HSK N+1)
- [x] XP, streak, dashboard statistik (harian/mingguan/bulanan/tahunan)
- [x] Daily checklist + target XP harian (kosakata, review SRS, XP, mock test)
- [x] Badge (10 badge otomatis: streak, XP, kosakata, tes — di halaman Profil)
- [x] Grafik progress per level (direview vs dikuasai per level HSK — di Statistik)
- [x] Reminder harian (notifikasi web; jam diatur di Profil — sedangkan email menyusul)
- [x] Responsive mobile-first (bottom nav, touch-friendly, uji di layar hp) + PWA installable

### V2 — Modularitas + Jepang + Kesehatan (bulan ke-5–8)
- [x] Refactor modul bahasa → generic "Language Module" (konfigurasi skrip, audio, deck per bahasa) — HSK + English + Japanese
- [x] Bahasa Jepang: kurikulum JLPT N5 (kana → kosakata → kanji) — N5 starter live; N4–N1 menyusul
- [x] **Modul Gym (MVP → paritas kompetitor):**
  - [x] Log workout sesi (latihan, set per-row: beban/reps/done)
  - [x] Template rutinitas (Push/Pull/Legs PPL, Upper/Lower, Full Body)
  - [x] Streak latihan masuk ke sistem XP & kalender yang sama (10 XP/sesi, maks 30/hari)
  - [x] Rest timer per latihan (auto-start, skip, beep + vibrate, durasi pilihan)
  - [x] Database latihan (56 latihan: browse/cari/filter muscle group) + halaman detail
  - [x] Grafik progress per latihan (1RM/beban/volume) — rilis 0.10.0
  - [x] Sinkronisasi gym ke cloud (Supabase) — rilis 0.11.0
  - [x] Checklist harian "gym" (item workout di Daily Checklist)
  - [x] Streak gabungan belajar+gym + reminder workout — rilis 0.11.0
- [x] Homepage unified: satu checklist "bahasa + gym" per hari

### V3 — English + Sempurnakan (bulan ke-9–12)
- [x] Modul English (kosakata CEFR A1–C2, 300 kata + tematik) — rilis 0.12.0/0.13.0/0.15.0; listening & grammar belum
- [x] Bahasa Jepang lanjut ke JLPT N4 — rilis 0.14.0 (N5–N1 lengkap, 500 kata)
- [x] Import/export data, backup — di Profil (Ekspor/Impor/Reset, `levio.*.v1` + cloud sync)
- [ ] Audio native speaker rekaman (sekarang: proxy TTS di `app/api/tts` ✅ V1)
- [ ] Leaderboard mingguan
- [ ] English listening & grammar (latihan interaktif per level)

### Mobile Responsive (Sejak V1)
- **Mobile-first design:** UI di-desain dan diuji untuk layar kecil (iPhone/Android) lebih dulu, lalu di-scale ke desktop.
- **PWA (Progressive Web App):** bisa di-install ke home screen hp seperti aplikasi native, dengan offline mode (belajar tanpa internet). (✅ V1: manifest + service worker `public/sw.js` untuk app-shell offline.)
- **Bottom navigation** di mobile (Home / Belajar / Statistik / Profil) → pindah ke sidebar di desktop.
- Touch-friendly: tombol besar, swipe antar kartu flashcards, dukungan landscape & portrait.
- Satu codebase (web) → nanti tinggal bungkus jadi app store lewat Capacitor/PWA.

### Future / Nice-to-have
- App store native (via Capacitor/PWA), offline mode penuh
- AI tutor / pengoreksi jawaban
- Modul kesehatan lain: step counter, water tracker, sleep
- Komunitas & belajar bareng (group challenge)
- Marketplace premium content / subscription
- **Integrasi donasi mayar.id (V3/Future):** halaman "Dukung Levio" + redirect ke
  checkout mayar.id → webhook untuk catat donasi → opsi subscription via mayar.id.

---

## 6. Fitur Modul Gym (Detail V2)

Status: **MVP selesai (0.9.0) + paritas inti (0.10.0: DB latihan, rest timer, grafik progress).**

✅ **Sudah jalan:**
- **Workout sesi:** mulai dari template (PPL, Upper/Lower, Full Body) atau sesi bebas; tiap latihan punya set per-row (beban kg, repetisi, centang done).
- **Rest timer per latihan:** auto-start saat set selesai, durasi pilihan (45–180 dtk, default dari DB), tombol skip, beep (Web Audio) + vibrate saat habis.
- **Database latihan:** 56 latihan, browse + cari + filter muscle group; halaman detail per latihan (PR, sesi, set, volume, grafik 1RM/beban/volume).
- **Volume tracker:** total volume mingguan per muscle group.
- **Streak gym** terpisah dari streak belajar, tapi XP-nya masuk satu akun (10/sesi, maks 30/hari).

⏭️ **Berikutnya (V2 lanjutan):**
- Sync gym ke cloud (Supabase) bersama XP-nya.
- Item "Gym" di Daily Checklist + reminder "Jangan lupa workout hari ini 🔥".
- Program workout terstruktur (durasi, jumlah set/reps target).
- Grafik volume mingguan per muscle group di dashboard gym.

Contoh flow:
1. Buka dashboard → lihat checklist hari ini
2. Ceklis "Latihan 10 kosakata HSK2" ✅
3. Ceklis "Gym: Push Day" → form log set/reps/beban → save
4. XP masuk, streak naik, kalender terisi

---

## 7. Arsitektur & Tech Stack (Ringkas)

```
Frontend : Next.js (App Router) + TypeScript + Tailwind CSS
           → mobile-first responsive, PWA-ready, satu codebase
Backend  : Supabase (BaaS: PostgreSQL + Auth + Storage)
           → cepat untuk MVP, nanti bisa migrasi ke backend custom
Database : PostgreSQL (tabel user, deck, progress, workout_log)
Storage  : Supabase Storage (audio, gambar)
Auth     : Supabase Auth (email/password; Google menyusul)
State    : TanStack Query (server state) + Zustand (client state)
Deploy   : Vercel (frontend) + Supabase (backend/DB)
```

### Kenapa Stack Ini?
- **Next.js + Tailwind:** responsive mobile-first sudah jadi bawaan, cepat untuk MVP web, bisa jadi PWA.
- **Supabase:** backend siap pakai (auth, DB, storage) → hemat waktu buat MVP; modul HSK dan gym tinggal fokus ke logic & konten.
- **TypeScript:** aman untuk nambah modul bahasa/gym di V2 (data terstruktur, refactor aman).

### Skema Tabel Inti
- `users`
- `languages` (mandarin, japanese, english) → data master
- `levels` (HSK1–6, JLPT N5–N1) → per bahasa
- `vocab_items` (kata, script, pinyin, arti, audio)
- `user_progress` (XP, level, streak, per-module)
- `srs_cards` (review scheduling per kata)
- `workout_logs` (tanggal, latihan, set, reps, beban)
- `routines` (template latihan)

---

## 8. KPI & Sukses Produk

- **Retention:** % user aktif kembali dalam 7 hari (target > 30%)
- **Streak:** rata-rata streak harian aktif
- **Progress:** rata-rata kosakata dikuasai per bulan
- **Completion:** % user lulus mock test per level
- **Daily Active Users (DAU)** & session length

---

## 9. Monetisasi (Opsional / Future)

- **Donasi via [mayar.id](https://mayar.id) (langkah pertama):** integrasi payment gateway
  lokal Indonesia. Mulai dari halaman/ tombol **"Dukung Levio"** (sekali klik, tanpa
  akun belanja) → menyusul opsi berlangganan. Detail implementasi & versi target ada di
  roadmap bawah (`Future / Nice-to-have`).
- Freemium: level dasar gratis, premium untuk HSK 3–6 + semua bahasa.
- Subscription bulanan/tahunan (mode, mock test unlimited, analytics detail).
- Premium template workout + program gym terstruktur.

> **Alur integrasi mayar.id (draft):**
> 1. Buat link/API checkout donasi di dashboard mayar.id (title, nominal nominal default).
> 2. Tambahkan halaman/komponen "Dukung" di aplikasi (mis. `/support`) yang menampilkan
>    nominal & tombol donasi → redirect ke link mayar.id.
> 3. Opsional: webhook mayar.id untuk mencatat donasi (tabel baru `donations`) — bisa
>    dilewati di iterasi pertama (cukup redirect ke halaman terima kasih).

---

## 10. Risiko & Catatan

- **Konten HSK:** pastikan daftar kosakata sesuai standar resmi terbaru & lisensi audio.
- **Scope creep:** jangan bangun banyak bahasa di awal — MVP harus fokus HSK dulu supaya kualitas konten bagus.
- **Kualitas audio/native speaker** = pembeda utama vs kompetitor (Duolingo, SuperChinese).
- Desain modular sejak awal (Jangan hardcode Mandarin) supaya V2 hemat biaya.

---

## Ringkasan Jalur Pengembangan

1. **V1:** Web app HSK + gamifikasi + habit. (Fokus & solid.)
2. **V2:** Refactor modular → tambah JLPT + Gym module. (Nilai tambah, 2-in-1.)
3. **V3:** English + polish + skala. (Broad market.)
4. **Future:** PWA/mobile, AI, komunitas, premium.
