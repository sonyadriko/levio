# Modul — Cara Menambahkan Bahasa & Fitur Baru

Levio dirancang modular: tiap domain (bahasa, kesehatan) berdiri sendiri di atas **shared foundation** (progress, XP, streak, layout). Dokumen ini menjelaskan pola untuk menambahkan bahasa baru (Jepang, Inggris) dan modul kesehatan (gym) sesuai roadmap.

Arsitektur modul belajar **sudah generik**: HSK (Mandarin), **English (CEFR)**, dan **Japanese (JLPT)** berjalan di atas antarmuka `LanguageModule` (lihat bagian "Arsitektur LanguageModule").

## Pola Satu Modul

Setiap modul mengikuti struktur yang sama:

```
lib/<domain>/          → logic murni (types, data, helper) — bisa di server & client
components/<domain>-*  → UI interaktif ("use client")
app/<route>/           → halaman
```

### Kontrak antar-modul (shared foundation)

| Kebutuhan | Dipenuhi oleh |
|---|---|---|
| Navigasi | tambah entry di `lib/nav.ts` (muncul otomatis di sidebar & bottom nav) |
| XP & streak | `lib/progress.ts` + `ProgressProvider` (otomatis, tidak perlu modifikasi) |
| Layout responsive | `components/app-shell.tsx` (tidak perlu modifikasi) |
| Progress per item | store `words` di `ProgressState` — atau tambah map baru sesuai domain |
| Badge | `lib/badges.ts` — derivasi otomatis dari `ProgressState`, tanpa storage baru |
| Pengingat harian | `lib/reminder.ts` + `components/daily-reminder.tsx` (dipasang di AppShell) |
| Ikon | tambah nama ke `IconName` (`lib/nav.ts`) + path SVG di `components/icons.tsx` |

## Contoh: Bahasa Baru (Jepang — sudah live)

Modul **Japanese (JLPT)** sudah terdaftar (N5 starter, 100 kata; N4–N1 menyusul).
Langkah-langkah berikut adalah pola yang dipakai (berlaku untuk bahasa baru lain):

1. **Buat data**: folder `lib/japanese/` untuk data kosakata per level (mengikuti pola `lib/english/data/`) — atau langsung sebagai `VocabItem[]` (kanji/kana → `term`, furigana/romaji → `reading`).

2. **Daftarkan modul**: tambah `japaneseModule` di `lib/languages/japanese.ts` mengikuti antarmuka `LanguageModule` (`lib/languages/types.ts`), lalu daftarkan di `LANGUAGE_MODULES` (`lib/languages/index.ts`). Ikon + i18n key (`learn.module<Name>*`) wajib ditambahkan.

3. **Halaman & komponen**: otomatis — `app/learn/[lang]` + `app/learn/[lang]/[level]`, hub `/learn`, `/practice?module=`, `/mock-test?module=` membaca registry. Komponen generik (`WordList`, `FlashcardDeck`, `MockTest`, `LevelTest`, `LevelProgress`) sudah berbasis `VocabItem`.

4. **Kemampuan modul**: set `supports*` dan `questionTypes` sesuai konten (mis. Jepang dengan huruf → `supportsTyping` dsb.). Rute CJK (susun kalimat, mendengarkan, membaca) di `/practice` hanya tampil untuk `hsk`.

> Target desain: **komponen belajar tidak peduli bahasanya**. Mereka hanya menerima `VocabItem[]` (`{ term, reading?, meaning, ... }`) + callback. Perbedaan bahasa hanya di data & label UI.

## Contoh: Modul Gym (V2)

Modul gym **sudah berjalan** (rilis 0.9.0–0.10.0). Pola yang dipakai:

1. **Data**: `lib/gym.ts` (model sesi + logika murni) + `lib/gym-exercises.ts` (master data latihan) + `lib/gym-programs.ts` (program multi-minggu: target set/reps per hari kerja). Skema DB target di `docs/data-model.md`.
2. **State**: `components/gym/use-gym.ts` — hook `useSyncExternalStore` di atas localStorage `levio.gym.v2` (sesi aktif tersimpan aman saat refresh).
3. **Sync cloud**: `components/gym/gym-sync.tsx` + `lib/supabase/sync.ts` (`pushGym`/`pullGym`/`mergeGym`) — sesi selesai + XP harian + penanda program tersinkron ke Supabase (`gym_sessions`, `gym_xp_by_date`).
4. **Halaman**: `app/gym/` (sesi + template + **program multi-minggu** + riwayat + volume mingguan), `app/gym/exercises/` (database latihan), `app/gym/exercises/[id]/` (detail + grafik progress).
5. **Komponen**: `gym-session-form.tsx` (editor sesi: set per-row, rest timer, pemilih latihan dari DB), `gym-program.tsx` (grid Pekan × Hari kerja dengan target set/reps + status selesai), `gym-log.tsx` (riwayat expandable), `exercise-chart.tsx` (LineChart SVG tanpa dependensi).
6. **Integrasi XP**: `applyGymXp` di `lib/progress.ts` — 10 XP/sesi (maks 30/hari) masuk ke pool XP **tanpa** menyentuh streak belajar; streak gym dihitung terpisah di `gymStreak`.

Pola menambah modul baru (Jepang, modul kesehatan lain) tetap sama: `lib/<domain>/`
(logika murni) → `app/<route>/` (halaman) → `components/<domain>-*` (UI client),
dengan i18n id+en untuk semua teks baru dan `npm run lint`/`build`/`test` lolos.

## Arsitektur LanguageModule (sudah berjalan)

Antarmuka modul bahasa generik di `lib/languages/types.ts` (sudah diimplementasikan, HSK + English + Japanese):

```ts
interface LanguageModule {
  id: "hsk" | "english" | "japanese";
  nameKey: string;
  descriptionKey: string;
  icon: string;                           // "汉" | "A" | "あ"
  maxLevel: number;                       // HSK/English = 6 (CEFR A1–C2), Japanese = 5 (JLPT N5–N1)
  supportsTyping: boolean;                // mengetik pelafalan (pinyin)
  supportsLesson: boolean;
  supportsSentences: boolean;
  questionTypes: QuestionType[];          // subset "term-meaning" | "meaning-term" | "reading-term" | "term-reading"
  levelName: (index: number) => string;   // "HSK 1" | "A1"
  levelDescriptionKey: (index: number) => string;
  wordIdPrefix: (index: number) => string; // "hsk1-" | "en-a1-"
  levels: () => LanguageLevelMeta[];
  countWordsByLevel: (index: number) => number;
  totalWordCount: () => number;
  loadWords: (level: number) => Promise<VocabItem[]>;
  getWordsByLevel: (level: number) => VocabItem[];
  subscribeLevelWords: (subscriber: () => void) => () => void;
}
```

- **Data**: `lib/languages/loader.ts` (`createLevelWordStore` — cache + pending + subscribe), adapter HSK di `lib/languages/hsk.ts` (memetakan `VocabWord` → `VocabItem`), modul English di `lib/languages/english.ts` + data `lib/english/`, modul Japanese di `lib/languages/japanese.ts` + data `lib/japanese/`.
- **Routes**: `app/learn/[lang]/[level]` satu rute dinamis untuk semua bahasa (SSG via `generateStaticParams`); redirect legacy `/learn/{n}` → `/learn/hsk/{n}`.
- **Progress per modul**: `unlockedByModule` di `lib/progress.ts` + helper `unlockedFor(progress, moduleId)`; HSK tetap memakai `unlockedUpTo` (backward-compatible).
- **Boundary RSC**: server page cukup meneruskan `moduleId` (string); komponen client me-resolve modul via `getLanguageModule(moduleId)` — objek modul berisi fungsi sehingga tidak boleh dilewatkan lintas boundary.

## Checklist Menambah Modul Baru

- [ ] Folder `lib/<domain>/` dengan types, data, helper (logic murni, tanpa DOM)
- [ ] Halaman di `app/` (Server Component) + komponen interaktif (`"use client"` minimal)
- [ ] Navigasi: bahasa → daftarkan di `LANGUAGE_MODULES` (`lib/languages/index.ts`); modul lain → `lib/nav.ts`
- [ ] Data progress masuk ke `lib/progress.ts` (reuse atau extend)
- [ ] Setiap teks UI baru ditambahkan ke kedua kamus i18n (`lib/i18n.ts`: `id` + `en`)
- [ ] `docs/data-model.md` diperbarui
- [ ] `npm run lint` dan `npm run build` lolos
- [ ] Responsive: cek di viewport mobile (bottom nav) & desktop (sidebar)
