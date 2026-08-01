# Levio

Satu platform untuk semua rutinitas self-improvement: **belajar HSK**, bahasa lain (Jepang/Inggris), dan **kesehatan** (gym daily tracking).

Rencana produk lengkap: [`PLAN.md`](./PLAN.md).

## Fitur Saat Ini (V1)

- 📚 **Kurikulum HSK 1–6** — daftar level + kosakata per level (`/learn`); **HSK 1–6 lengkap sesuai daftar resmi HSK 2.0 (150/156/287/598/1300/2499 kata baru per level, total 4990 kata)**
- 🎓 **Pelajaran interaktif** per level — exposure → retrieval practice pilihan ganda → feedback langsung; kata salah diuji ulang, kata benar dijadwalkan SRS besok (metode berbasis riset, terdokumentasi di kode)
- 🔒 **Gating antar level** — lulus **tes kelulusan** HSK N (skor ≥ 60%) untuk membuka HSK N+1; level terkunci menampilkan tes kelulusannya
- 🀄 **Latihan Kalimat** — baca kalimat HSK 1 utuh (hanzi + pinyin), pilih artinya dari konteks
- 🃏 **Flashcards + SRS** — ketuk untuk membalik kartu, nilai hafalan (`/practice`)
- 📝 **Mock Test HSK** — simulasi ujian: 4 tipe pilihan ganda, timer, skor, analisis per tipe & review jawaban salah (`/mock-test`)
- 📊 **Statistik** — progress **harian, mingguan, bulanan, tahunan**: heatmap 12 minggu, bar chart XP, streak, kata dikuasai, hasil mock test (`/stats`)
- 📈 **Grafik progress per level** — kosakata direview vs dikuasai per level HSK di halaman Statistik
- 🏅 **Badge & penghargaan** — 10 badge otomatis (streak 7/30 hari, XP, kosakata, tes) di halaman Profil
- 🔔 **Pengingat harian** — notifikasi web saat waktunya belajar (jam bisa diatur); kirim otomatis bila hari ini belum ada aktivitas
- 🌐 **Bilingual (ID/EN)** — ganti bahasa UI kapan saja via halaman Profil; pilihan tersimpan di browser
- 🌗 **Tema terang/gelap/otomatis** — dari halaman Profil; tanpa flash saat reload
- ⚡ **XP, level, streak** — tersimpan di browser (localStorage), muncul di dashboard
- ☁️ **Akun & sync cloud** — login email/password, progress otomatis di-upload/download; tetap jalan offline tanpa koneksi
- ✅ **Checklist harian** — target kosakata, review SRS, XP harian, & mock test dalam satu halaman
- 🏷️ **Versioning** — versi aplikasi & "Yang Baru" tampil di Profil (`lib/version.ts` + `CHANGELOG.md`)
- 🎞️ **Animasi halus** — kartu, transisi halaman (View Transitions), mikro-interaksi — tanpa dependensi tambahan
- 📱 **Mobile-first responsive** — bottom nav di hp, sidebar di desktop, PWA-ready

Menu: **Home · Belajar · Gym · Statistik · Profil** (flashcard & mock test berada dalam alur Belajar).

## Tech Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** — mobile-first responsive
- **Supabase** — backend (PostgreSQL + Auth email/password, sync cloud); berjalan offline bila belum dikonfigurasi
- Deploy: **Vercel**

## Dokumentasi

| Dokumen | Isi |
|---|---|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Struktur kode, alur data, prinsip desain |
| [`docs/data-model.md`](./docs/data-model.md) | Skema DB (target) & state localStorage |
| [`docs/hsk-curriculum.md`](./docs/hsk-curriculum.md) | Standar & cara menambah kosakata HSK |
| [`docs/modules.md`](./docs/modules.md) | Pola menambah bahasa/modul baru |
| [`CHANGELOG.md`](./CHANGELOG.md) | Riwayat rilis per versi |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Aturan berkontribusi |

## Struktur

```
app/           → routing (hub belajar `/learn/hsk`, practice, gym, stats, profile)
components/    → app-shell, sidebar, bottom-nav, flashcards, dll.
lib/           → logic murni: progress + data HSK
docs/          → dokumentasi teknis
PLAN.md        → roadmap produk & fitur
```

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Fungsi |
| --- | --- |
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build + type-check |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |

## Environment

Salin `.env.example` → `.env.local` lalu isi kredensial Supabase. Langkah lengkap
(setup proyek, SQL migration, aktifkan Email provider) ada di
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#mengaktifkan-backend).
Tanpa `.env.local`, aplikasi tetap berjalan penuh dalam mode offline.

## Roadmap Singkat

- **V1:** HSK + gamifikasi + habit ✅ (dasar; kosakata lengkap menyusul)
- **V2:** Bahasa Jepang (JLPT) + modul Gym
- **V3:** English + polish + monetisasi
