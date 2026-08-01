# Modul — Cara Menambahkan Bahasa & Fitur Baru

Levio dirancang modular: tiap domain (bahasa, kesehatan) berdiri sendiri di atas **shared foundation** (progress, XP, streak, layout). Dokumen ini menjelaskan pola untuk menambahkan bahasa baru (Jepang, Inggris) dan modul kesehatan (gym) sesuai roadmap V2.

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

## Contoh: Tambah Bahasa Jepang (V2)

1. **Buat `lib/japanese/`** mengikuti `lib/hsk/`:
   - `types.ts` → `VocabItem { id, script, reading, meaning, levelId, example? }`
   - `levels.ts` → JLPT N5–N1 (atau Kaiwa/Kanji)
   - `data.ts` → kosakata & kanji N5
   - `index.ts` → helper query

2. **Buat halaman**: `app/learn/japanese/page.tsx` + daftar level, `app/learn/japanese/[level]/page.tsx`.

3. **Komponen**: reuse pola `WordList` dan `FlashcardDeck` — idealnya dipromosikan ke komponen generic (lihat bagian "Refactor V2" di bawah).

4. **Navigasi**: tambah ke `lib/nav.ts`.

> Target desain: **komponen belajar tidak peduli bahasanya**. Mereka hanya menerima `{ id, script, reading, meaning }[]` + callback. Perbedaan bahasa hanya di data & label UI.

## Contoh: Tambah Modul Gym (V2)

1. **Data**: `lib/gym/types.ts` → `WorkoutLog`, `Exercise`, `Routine`. (Skema DB di `docs/data-model.md`.)
2. **Halaman**: `app/gym/` sudah ada sebagai placeholder → isi dengan:
   - Log workout harian (form set/reps/beban)
   - Template rutinitas (Push/Pull/Legs)
   - Volume tracker
3. **Integrasi XP**: biarkan `applyReview` untuk kata; untuk gym, panggil `setProgress(...)` via provider dengan XP award sendiri (mis. +20 XP per sesi). Tambahkan API baru di `lib/progress.ts` seperti `applyWorkout(state, log)`.

## Refactor V2: Generic Language Module

Saat modul bahasa kedua masuk, refactor `lib/hsk/` menjadi antarmuka generic:

```ts
interface LanguageModule {
  id: string;                       // "mandarin" | "japanese"
  name: string;
  script: "hanzi" | "kana" | "latin";
  levels: LevelMeta[];
  getItems(levelId: string): VocabItem[];
}
```

- Simpan modul di `lib/languages/<id>/`.
- `app/learn/[language]/[level]` → satu rute dinamis untuk semua bahasa.
- `FlashcardDeck`, `WordList`, `LevelProgress` menerima `VocabItem[]` generic (field `hanzi/pinyin` → `script/reading`).

## Checklist Menambah Modul Baru

- [ ] Folder `lib/<domain>/` dengan types, data, helper (logic murni, tanpa DOM)
- [ ] Halaman di `app/` (Server Component) + komponen interaktif (`"use client"` minimal)
- [ ] Navigasi di `lib/nav.ts`
- [ ] Data progress masuk ke `lib/progress.ts` (reuse atau extend)
- [ ] Setiap teks UI baru ditambahkan ke kedua kamus i18n (`lib/i18n.ts`: `id` + `en`)
- [ ] `docs/data-model.md` diperbarui
- [ ] `npm run lint` dan `npm run build` lolos
- [ ] Responsive: cek di viewport mobile (bottom nav) & desktop (sidebar)
