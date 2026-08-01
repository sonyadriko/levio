# Arsitektur — Levio

Dokumen ini menjelaskan arsitektur teknis aplikasi **Levio**: struktur kode, alur data, dan keputusan desain untuk mendukung modularitas (HSK → Jepang/Inggris → Kesehatan).

## Gambaran Umum

```
┌──────────────────────────────────────────────┐
│  Next.js 16 (App Router, Turbopack)          │
│  TypeScript + Tailwind CSS v4                │
├──────────────────────────────────────────────┤
│  app/             → routing & page           │
│  components/      → UI (shared + feature)    │
│  lib/             → logic & data murni       │
│  docs/            → dokumentasi              │
├──────────────────────────────────────────────┤
│  State lokal      → localStorage (offline-first)│
│  Audio            → proxy TTS (/api/tts) + SW │
│  Backend          → Supabase (Auth + PostgreSQL)│
└──────────────────────────────────────────────┘
```

> **Offline-first.** Tanpa `.env` Supabase, aplikasi tetap berfungsi penuh
> (mode offline). Saat env terisi dan user login, data lokal disinkronkan
> ke cloud (pull saat login, push debounce saat berubah). Service worker
> (`public/sw.js`) meng-cache shell aplikasi agar tetap bisa dibuka offline.

## Prinsip

1. **Server-first.** Layout & page default-nya Server Component. Interaktivitas (state, event) dibatasi di komponen `"use client"`.
2. **Logika murni di `lib/`.** Tanpa DOM/React, supaya bisa di-import di server maupun client, mudah diuji.
3. **Data terpisah dari UI.** Kosakata HSK hidup di `lib/hsk/data.ts`, bukan hardcode di komponen.
4. **Modular.** Tiap domain (bahasa, kesehatan) punya folder `lib/<domain>/`. Shared foundation di `lib/progress.ts`.

## Struktur Folder

```
app/
├── layout.tsx            → root layout (font, metadata, viewport, provider, SW register)
├── manifest.ts           → PWA manifest
├── globals.css           → Tailwind v4 + CSS global (termasuk keyframe animasi)
├── page.tsx              → Home / dashboard (streak, XP, checklist)
├── api/tts/route.ts      → proxy audio TTS (Google Translate TTS → MP3, cache in-memory)
├── learn/
│   ├── page.tsx          → hub modul (saat ini: HSK) — siap untuk bahasa lain
│   ├── hsk/
│   │   ├── page.tsx      → daftar level HSK 1–6
│   │   └── [level]/page.tsx → kosakata per level (SSG)
│   └── [level]/page.tsx  → redirect lama /learn/1 → /learn/hsk/1
├── practice/page.tsx     → latihan flashcards + link mock test
├── mock-test/page.tsx    → simulasi ujian HSK
├── gym/ page.tsx         → placeholder (V2)
├── stats/page.tsx        → dashboard statistik (harian/mingguan/bulanan/tahunan)
└── profile/page.tsx      → profil + preferensi + data (bahasa UI, ekspor/impor/reset)

components/
├── app-shell.tsx         → layout: sidebar (desktop) + bottom nav (mobile) + DailyReminder
├── sidebar.tsx           → "use client", navigasi desktop
├── bottom-nav.tsx        → "use client", navigasi mobile
├── icons.tsx             → SVG icons (tanpa dependensi eksternal)
├── auth-provider.tsx    → "use client", auth Supabase (email/password, login/daftar/keluar)
├── progress-provider.tsx → "use client", useSyncExternalStore(localStorage) + sync cloud
├── language-provider.tsx → "use client", locale (id/en) + t() terjemahan
├── settings-provider.tsx → "use client", settings (nama, target harian) + sync cloud
├── translate.tsx         → <T id vars /> untuk teks terjemahan di server component
├── greeting.tsx          → sapaan Home dengan nama user (client)
├── page-header.tsx       → header halaman (ikon + judul + subtitle) — dipakai semua halaman
├── back-link.tsx         → tautan kembali di halaman detail (client)
├── progress-bar.tsx      → bar progress reusable
├── pill.tsx              → tombol pilihan reusable (level, jumlah soal, waktu)
├── stat-card.tsx         → kartu angka statistik reusable
├── home-stats.tsx        → streak, XP, level (client)
├── daily-checklist.tsx   → checklist harian: kosakata, review SRS, XP, mock test (client)
├── level-progress.tsx    → progress bar per level (client)
├── word-list.tsx         → daftar kosakata + status hafal (client)
├── lesson.tsx            → alur pelajaran 3 fase: exposure → retrieval → hasil (client)
├── level-test.tsx        → tes kelulusan antar level: variant "gate" | "graduate" (client)
├── level-content.tsx     → konten halaman level: pelajaran, kalimat, kartu, tes (client)
├── sentence-practice.tsx → latihan pemahaman kalimat dari konteks (client)
├── flashcard-deck.tsx    → sesi latihan flashcards (client)
├── mock-test.tsx         → quiz mock test: config, timer, hasil (client)
├── stats-dashboard.tsx   → statistik: tab periode + heatmap + bar chart + progress per level (client)
├── profile-view.tsx      → ringkasan, badge, bahasa UI, pengingat, ekspor/impor/reset data (client)
├── reminder-card.tsx     → pengaturan pengingat harian (toggle + jam) (client)
├── daily-reminder.tsx    → mesin pengingat: polling & kirim Notification API (client)
├── sync-banner.tsx       → banner status sinkronisasi cloud (client)
├── listening-practice.tsx → latihan listening: audio native (/api/tts) + fallback Web Speech (client)
├── service-worker-register.tsx → daftarkan /sw.js untuk offline (client, production only)
├── confetti.tsx          → efek confetti ringan (CSS keyframe, tanpa dependensi)
├── progress-ring.tsx     → lingkaran progress SVG (stroke-dashoffset)
└── placeholder-page.tsx  → UI "dalam pengembangan"

lib/
├── nav.ts                → daftar menu navigasi (labelKey — diterjemahkan via i18n)
├── date.ts               → helper tanggal (key harian/minggu/bulan/tahun)
├── i18n.ts               → kamus id/en, translate(), load/save locale (localStorage)
├── settings.ts           → settings user: nama + target harian (localStorage)
├── progress.ts           → pure logic: XP, streak, SRS, gating level, aktivitas harian, localStorage
├── stats.ts              → agregasi harian/mingguan/bulanan/tahunan + series chart
├── badges.ts             → definisi & derivasi badge dari ProgressState (tanpa storage baru)
├── reminder.ts           → pengaturan pengingat harian (enabled/time, localStorage)
├── version.ts            → APP_VERSION + catatan rilis singkat (Profil → "Yang Baru")
├── use-count-up.ts       → hook animasi angka (rAF, easeOutCubic) — untuk counter XP/skor
└── hsk/
    ├── types.ts          → VocabWord, HskLevel, HskLevelMeta
    ├── levels.ts         → metadata level HSK 1–6
    ├── data.ts           → kosakata (HSK 1 + HSK 2 lengkap; lihat docs/hsk-curriculum.md)
    ├── sentences.ts      → bank kalimat contoh per level (HSK 1: 25 kalimat)
    ├── mock-test.ts      → generator soal mock test (4 tipe pilihan ganda)
    └── index.ts          → helper query kosakata

supabase/
└── migrations/
    ├── 0001_init.sql          → tabel (profiles, daily_activity, word_progress, last_test)
    │                            + RLS via auth.uid() + trigger updated_at
    ├── 0002_add_srs.sql       → kolom SRS (ease, repetitions) di word_progress
    ├── 0003_add_new_words.sql → kolom new_words di daily_activity
    └── 0004_add_unlocked_up_to.sql → kolom unlocked_up_to di profiles (gating level HSK)
```

> Jalankan migration **berurutan** (0001 → 0004) di Supabase SQL Editor.

## Alur Data

### Membaca progress (Server Component → Client)

```tsx
// app/page.tsx (Server Component)
import { HomeStats } from "@/components/home-stats";
export default function Page() {
  return <HomeStats />;
}
```

`HomeStats` adalah Client Component yang memakai `useProgress()`. Nilai progress dibaca dari **localStorage** lewat `useSyncExternalStore`:

- Server render → `getServerSnapshot()` mengembalikan state kosong (aman untuk hydration).
- Setelah mount → `getSnapshot()` membaca localStorage dan React re-render otomatis jika beda.
- Tanpa hydration mismatch, karena `useSyncExternalStore` menangani dua snapshot ini.

### Menulis progress (sesi latihan)

```
flashcard-deck.tsx  ──answer(correct)──▶  recordReview(word, correct)
                                                │
                                                ▼
                                lib/progress.ts: applyReview()
                                                │
                        +10 XP benar / +3 salah · update streak
                        + update word (reviews, mastered, nextReview)
                        + persist ke localStorage (saveProgress)
                                                │
                                                ▼
                        emit() → semua subscriber (home, learn, dst)
                                re-render otomatis
```

## State Management

| Lapisan | Tool | Dipakai untuk |
|---|---|---|
| Server state | Server Components + fetch | Konten statis (level, kosakata) |
| Client global | `useSyncExternalStore` + localStorage | Progress, XP, streak, settings |
| Client auth | Supabase `onAuthStateChange` | Session user (email/password) |
| Client lokal | `useState` | UI ephemeral (flipped, session, form) |

> **Kenapa bukan Redux/Zustand?** localStorage + context sudah cukup dan minim
> dependensi. Saat Supabase terhubung, provider tetap menjadi sumber kebenaran —
> cloud hanya jadi lapisan sinkronisasi di belakangnya.

## Sinkronisasi Cloud (Supabase)

Stack: `@supabase/ssr` + `@supabase/supabase-js`. Auth via **email + password**
(tabel `auth.users` bawaan Supabase, bukan tabel kustom).

- `lib/supabase/env.ts` → baca `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY`;
  `isSupabaseConfigured()` = true hanya jika keduanya terisi.
- `lib/supabase/client.ts` → singleton browser client (null tanpa env).
- `lib/supabase/server.ts` → server client (pakai `cookies()` dari `next/headers`).
- `lib/supabase/middleware.ts` + `proxy.ts` → refresh session di middleware.
- `lib/supabase/sync.ts` → `pullProfile/pullProgress/pullSettings/pushProgress/pushSettings`
  (upsert ke 4 tabel + merge ke `ProgressState`/`UserSettings`).
- `components/auth-provider.tsx` → `useAuth()`: user/ready/configured/signIn/signUp/signOut.
  `signUp` mengembalikan `needsConfirmation` (bila "Confirm email" aktif).
- `app/auth/callback/route.ts` → tukar `code` (OAuth) atau `token_hash` (konfirmasi email).

Alur sinkronisasi:

```
login (signInWithPassword)
   │
   ▼
progress-provider & settings-provider
   │  pullProfile (ada data cloud?) ── ada ──▶ pullProgress/pullSettings → setProgress
   │                                            (cloud menang)
   └── tidak ada ──▶ pushProgress/pushSettings (migrasi data lokal → cloud)
                        │
ubah progress/settings (dengan debounce 600/400ms) ──▶ push ke cloud
```

Kunci logika: `hasLocalData(state)` (apakah lokal punya data untuk di-migrasi)
dan `hasCloudData(profile)` (apakah cloud sudah punya riwayat). Semua tabel
dilindungi RLS (`auth.uid() = user_id`), sehingga user hanya mengakses datanya
sendiri. Migration ada di `supabase/migrations/` (0001 → 0004, jalankan
berurutan). `unlocked_up_to` (gating level HSK) ikut disinkronkan lewat
`profiles`.

### Mengaktifkan backend

1. Buat proyek di [supabase.com](https://supabase.com).
2. Isi `.env.local` (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
3. Jalankan `supabase/migrations/0001_init.sql` → `0002` → `0003` → `0004` di SQL Editor (berurutan).
4. Authentication → Sign In / Up → aktifkan **Email** (matikan "Confirm email" agar
   registrasi langsung aktif).
5. Authentication → URL Configuration → Site URL: `http://localhost:3000`.

## Badge & Gamifikasi

Badge **diderivasi dari `ProgressState`** — tidak ada kolom storage baru, sehingga
selalu konsisten dengan data nyata dan tidak bisa "curang":

- `lib/badges.ts` → daftar `BadgeDef` (ikon, judul/deskripsi i18n, fungsi `value(p)`,
  `target`). `getBadges(progress)` mengembalikan status tiap badge
  (`earned`, `current`, `target`).
- Contoh: streak 7/30 hari, XP 100/1000/5000, 100 kata direview, seluruh kosakata
  HSK 1/2 dikuasai, lulus tes kelulusan HSK 1, 10 tes selesai.
- UI: bagian "Penghargaan" di `components/profile-view.tsx` — badge diraih tampil
  berwarna amber, yang belum tampil redup + progress bar.
- Menambah badge baru = tambah satu `BadgeDef` + 2 kunci i18n (id/en). Ikon baru
  harus ditambahkan ke whitelist `IconName` (`lib/nav.ts`) + path SVG
  (`components/icons.tsx`).

## Versioning

- **Sumber versi tunggal:** `package.json` → `version`.
- `lib/version.ts` → `APP_VERSION` (untuk tampilan aplikasi) + `RELEASE_NOTES`
  (catatan rilis singkat, kunci i18n). Dua-duanya wajib **disinkronkan** saat rilis.
- `CHANGELOG.md` → riwayat rilis detail (Keep a Changelog) dengan aturan SemVer.
- UI: halaman Profil → bagian "Tentang" menampilkan `Levio · Versi X.Y.Z` dan
  tombol "Yang Baru" (catatan rilis terbaru).
- Alur rilis: bump `package.json` + `APP_VERSION` → tambah entri `CHANGELOG.md` +
  highlight di `RELEASE_NOTES` → commit `release: vX.Y.Z`.

## Pengingat Harian (Web Notification)

- `lib/reminder.ts` → pengaturan pengingat di localStorage (`levio.reminder.v1`):
  `{ enabled, time: "HH:MM", lastSentKey }`. Lokal (tidak di-sync ke cloud).
- `components/reminder-card.tsx` → toggle + pemilih jam di halaman Profil. Aksi
  toggle memicu `Notification.requestPermission()` (wajib dari user gesture).
- `components/daily-reminder.tsx` → mesin polling dipasang di `AppShell` (selalu
  hidup selama aplikasi terbuka). Setiap 60 detik: jika sudah lewat jam,
  belum dikirim hari ini, dan belum ada aktivitas hari ini → kirim `Notification`
  lalu tandai `lastSentKey = hari ini`.
- Batasan: notifikasi aktif hanya saat tab aplikasi terbuka. Notifikasi saat app
  tertutup (mobile) butuh Service Worker push — rencana V2/PWA lanjutan.

## Audio & PWA Offline

### Audio native (listening)

- `app/api/tts/route.ts` → proxy GET `/api/tts?text=...&tl=zh-CN`. Mengambil audio MP3
  dari Google Translate TTS (tanpa API key), lalu mengembalikannya dengan
  `Content-Type: audio/mpeg` + `Cache-Control` lama. Cache in-memory (`Map`) 7 hari
  untuk menghindari request berulang ke upstream; batas 200 karakter per teks.
- `components/listening-practice.tsx` → `useSpeech()` memutar `<audio>` dari proxy
  TTS (suara native, konsisten antar browser). Bila audio gagal (offline/error),
  otomatis fallback ke **Web Speech API** (`speechSynthesis`, lang `zh-CN`, rate 0.8).
- Tombol putar ulang memakai ikon `volume` (ditambahkan ke `lib/nav.ts` + `components/icons.tsx`).

### PWA & offline

- `app/manifest.ts` → PWA installable (name, icons 192/512, display standalone).
- `public/sw.js` → service worker (network-first untuk navigasi, cache-first untuk
  aset statis hashed, di-skip untuk `/api/*` dan origin lain). Precache `/`,
  manifest, dan ikon.
- `components/service-worker-register.tsx` → mendaftarkan `/sw.js` hanya di
  production (`process.env.NODE_ENV === "production"`) agar tidak mengganggu dev.
- Dampak: setelah kunjungan pertama, shell aplikasi + aset JS/CSS yang sudah dimuat
  tersedia offline (belajar & latihan tetap jalan tanpa internet). Audio TTS tetap
  butuh koneksi — fallback Web Speech menanganinya saat offline.

## Animasi

Semua animasi murni CSS + sedikit React hook, **tanpa dependensi eksternal**:

- `app/globals.css` `@theme` → keyframe: `fade-in`, `card-in`, `slide-up/down`,
  `pop`, `shake`, `pulse-soft`, `bar-grow`, plus `shimmer` (loading skeleton),
  `flame` (streak), `ring-fill` (progress ring), `confetti-fall`.
- `components/confetti.tsx` → efek selebrasi pada layar selesai latihan.
- `components/progress-ring.tsx` → lingkaran progress SVG (`stroke-dashoffset`
  animasi `ring-fill`); dipakai di layar selesai pelajaran.
- `lib/use-count-up.ts` → hook counter angka (rAF, easing easeOutCubic); dipakai
  untuk XP total, skor %, dll. (juga di mock test via hook yang sama).
- Sudah ada sebelumnya: flip kartu flashcards (CSS `perspective`/`rotateY`),
  view transitions antar halaman (`experimental.viewTransition`), dan
  stagger list pada `word-list`.

## Routing & Rendering

- Rute belajar mengikuti pola modul: `/learn` (hub) → `/learn/hsk` (daftar level) → `/learn/hsk/[level]` (kosakata). Bahasa berikutnya tinggal menambah folder `app/learn/<id>/`.
- `/learn/hsk/[level]` pakai `generateStaticParams` → 6 halaman statis (SSG).
- `/learn/[level]` (rute lama) → redirect 307 ke `/learn/hsk/[level]`.
- Level tidak valid → `notFound()` → 404.
- Semua halaman lain statis (di-prerender saat build).

## Responsive & Mobile-first

- `components/app-shell.tsx`:
  - Mobile: bottom navigation tetap (`lg:hidden`), konten `pb-24` agar tidak tertutup nav.
  - Desktop (≥ `lg`): sidebar tetap 256px (`lg:flex`, `lg:pl-64`).
- PWA: `app/manifest.ts` → installable; `viewport.themeColor` menyesuaikan light/dark.

## Menguji

```bash
npm run lint     # ESLint
npm run build    # tipe-check + production build + SSG
npm run dev      # development server
```

Tidak ada framework test terpasang saat ini. Rencana: tambah Vitest untuk unit test logika murni di `lib/` (progress, helper kosakata) sebelum V2.

## Jalan Menuju V2 (Modularitas)

- Refactor domain bahasa ke antarmuka generic (`docs/modules.md`).
- Perluas sync Supabase ke reset (DELETE cloud) saat user reset progress.
- Tambah modul gym dengan pola yang sama: `lib/gym/` + halaman + komponen.
