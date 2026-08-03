# Data Model — Levio

Dokumen ini mendeskripsikan struktur data aplikasi, baik yang sudah diimplementasikan (localStorage) maupun skema target untuk backend (Supabase/PostgreSQL) di V2.

## Skema Target (PostgreSQL / Supabase)

### `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` PK | Diisi Supabase Auth |
| `email` | `text` | Dari auth |
| `display_name` | `text` | Nama tampilan |
| `created_at` | `timestamptz` | |

### `languages` (data master — mendukung V2)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `text` PK | `mandarin`, `japanese`, `english` |
| `name` | `text` | Nama bahasa |
| `script` | `text` | `hanzi`, `kana`, `latin` |
| `active` | `boolean` | |

### `levels`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `text` PK | `hsk-1` … `hsk-6`, `jlpt-n5` … |
| `language_id` | `text` FK → `languages.id` | |
| `name` | `text` | `HSK 1`, `JLPT N5` |
| `order` | `int` | Urutan kurikulum |

### `vocab_items`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `text` PK | `hsk1-001` |
| `level_id` | `text` FK → `levels.id` | |
| `script` | `text` | Hanzi / kana / kata |
| `reading` | `text` | Pinyin / romaji / fonetik |
| `meaning` | `text` | Arti (Bahasa Indonesia) |
| `example` | `text` | Contoh kalimat |
| `example_reading` | `text` | Pembacaan contoh |
| `example_meaning` | `text` | Arti contoh |
| `audio_url` | `text` | URL audio native (V3) |

### `user_progress` (diimplementasikan sebagai `profiles`)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `user_id` | `uuid` FK → `users.id` | |
| `name` | `text` | Nama tampilan |
| `daily_targets` | `jsonb` | `{"vocab":10,"reviews":15,"xp":100}` |
| `xp` | `int` | XP total |
| `streak` | `int` | Streak hari |
| `last_active_date` | `date` | Tanggal aktivitas terakhir |
| `completed_reviews` | `int` | Total kartu direview |
| `completed_tests` | `int` | Total tes selesai |
| `unlocked_up_to` | `int` | Level HSK terbuka (default 1; naik saat lulus tes kelulusan) |
| `unlocked_by_module` | `jsonb` | Level terbuka per modul bahasa, contoh `{"hsk":3,"english":2}` (migration 0008; `null` untuk akun lama) |
| `imported_at` | `timestamptz` | Tanda akun yang pernah import progress (migration 0005) |
| `updated_at` | `timestamptz` | |

### `srs_cards` (Spaced Repetition per kata)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `user_id` | `uuid` FK | |
| `vocab_id` | `text` FK → `vocab_items.id` | |
| `reviews` | `int` | Total review |
| `correct` | `int` | Total benar |
| `mastered` | `boolean` | Sudah hafal |
| `next_review` | `date` | Jadwal review berikutnya |
| `ease` | `real` | (opsional, SM-2) |

PK gabungan: `(user_id, vocab_id)`.

### `workout_logs` (V2 — modul gym)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK | |
| `exercise_name` | `text` | Nama latihan |
| `muscle_group` | `text` | Chest, Back, Legs, … |
| `sets` | `int` | |
| `reps` | `int` | |
| `weight_kg` | `real` | |
| `logged_at` | `date` | |

### `routines` (V2)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | `uuid` PK | |
| `user_id` | `uuid` FK | |
| `name` | `text` | `Push Day` |
| `is_template` | `boolean` | Template bawaan vs milik user |

### `gym_sessions` (V2 — sync gym, migration 0006)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `user_id` | `uuid` FK | |
| `session_id` | `text` | id sesi lokal (UUID) |
| `title` | `text` | Judul sesi |
| `template_id` | `text` | Template rutin (opsional) |
| `program_id` | `text` | Program multi-minggu (opsional, migration 0007) |
| `program_week` | `int` | Pekan program, 1-indexed (opsional) |
| `program_day` | `int` | Hari kerja dalam pekan, 0-indexed (opsional) |
| `date` | `text` | `YYYY-MM-DD` |
| `started_at` | `bigint` | epoch ms |
| `completed_at` | `bigint` | null bila belum selesai |
| `exercises` | `jsonb` | array `GymExerciseLog` ber-nesting (set, muscles, restSeconds) |
| `updated_at` | `timestamptz` | |

PK gabungan: `(user_id, session_id)`.

### `gym_xp_by_date` (V2 — cap XP gym harian, migration 0006)

| Kolom | Tipe | Keterangan |
|---|---|---|
| `user_id` | `uuid` FK | |
| `date` | `text` | `YYYY-MM-DD` |
| `xp` | `int` | XP gym yang sudah didapat hari itu (anti-farming, cap 30/hari) |

PK gabungan: `(user_id, date)`.

## Implementasi Saat Ini (localStorage)

Key: `levio.progress.v1`

```ts
interface ProgressState {
  xp: number;                      // total XP
  streak: number;                  // streak hari berturut-turut
  lastActiveDate: string | null;   // "YYYY-MM-DD"
  completedReviews: number;        // total kartu direview
  completedTests: number;          // total mock test selesai
  words: Record<string, WordProgress>; // key = vocab id
  activityByDate: Record<string, ActivityDay>; // aktivitas harian
  lastTest: LastTest | null;          // hasil mock test terakhir
  unlockedUpTo: number;               // level HSK tertinggi yang terbuka (1..6, default 1)
}

interface ActivityDay {
  xp: number;      // XP didapat hari itu
  reviews: number; // kartu direview hari itu
  tests: number;   // mock test selesai hari itu
  newWords: number; // kata BARU (pertama kali direview) hari itu
}

interface LastTest {
  correct: number;
  total: number;
  date: string; // "YYYY-MM-DD"
}

interface WordProgress {
  reviews: number;       // total review kata ini
  correct: number;       // total benar
  mastered: boolean;     // hafal: reviews ≥ 3 && correct ≥ 2
  nextReview: string;    // "YYYY-MM-DD" jadwal review (SRS)
  ease: number;          // ease factor SM-2 (default 2.5, min 1.3)
  repetitions: number;   // jumlah benar berturut-turut (SRS)
}
```

`activityByDate` adalah sumber agregasi **harian → mingguan → bulanan → tahunan** (logika di `lib/stats.ts`). Setiap `applyReview` / `applyTest` menambah entri untuk hari ini.

Sumber kode: `lib/progress.ts`.

### Aturan SRS (SM-2, `lib/progress.ts`)

| Jawaban | Efek |
|---|---|
| Benar | `reviews +1`, `correct +1`, +10 XP, `repetitions +1`, `ease +0.1` |
| Salah | `reviews +1`, +3 XP, `repetitions = 0`, `ease −0.15` (min 1.3) |
| Interval | benar berurutan: 1 → 6 → `6×ease` → `6×ease²` → … (kap 365 hari) |
| `nextReview` | `hari ini + interval` |
| Mastered | tercapai saat `reviews ≥ 3` dan `correct ≥ 2` |

### Aturan streak

- Aktivitas hari ini & kemarin beruntun → `streak + 1`.
- Aktivitas di hari yang sama → tidak berubah.
- Ada jeda > 1 hari → reset ke `1`.

### Mock test (XP)

`applyTest(state, correct, total)` → XP = `correct × 5 × (0.5 + akurasi × 0.5)`, update streak & `completedTests + 1`. Akurasi tinggi → bonus XP lebih besar.

### Gating level modul (`unlockedUpTo` / `unlockedByModule`)

- `unlockedUpTo` = level HSK tertinggi yang terbuka, rentang `1..6` (`MAX_HSK_LEVEL`), default `1`.
- `unlockedByModule` = `Record<moduleId, level>` untuk gating per modul (mis. `{hsk:1, english:2}`); `unlockedFor(progress, moduleId)` = `max(unlockedUpTo, unlockedByModule[moduleId])`.
- `applyModuleLevelPass(state, moduleId, level)` → naik ke `level + 1` saat lulus tes kelulusan (skor ≥ `MIN_PASS_PCT` = 60%); untuk HSK `unlockedUpTo` ikut dinaikkan agar tetap sinkron dengan `applyLevelPass` legacy. Disinkronkan ke cloud via `profiles.unlocked_up_to` (HSK) + `profiles.unlocked_by_module` (semua modul).
- `applyXp(state, xp)` → XP murni tanpa menyentuh kata/tes (dipakai latihan kalimat); streak & aktivitas harian tetap dihitung.

### Badge (derivasi, tanpa storage)

Badge **tidak disimpan** — dihitung ulang dari `ProgressState` oleh `lib/badges.ts` (`getBadges(progress)`). Badge kosakata ("master") dan kelulusan ("graduate") digenerate per modul × level dari registry `lib/languages/`, sehingga otomatis mengikuti bahasa & data yang tersedia. Menambah badge = cukup tambah `BadgeDef` + kunci i18n (id/en).

### Pengingat harian (`levio.reminder.v1`)

```ts
interface ReminderSettings {
  enabled: boolean;            // pengingat aktif?
  time: string;                // "HH:MM" jam kirim
  lastSentKey: string | null;  // tanggal notifikasi terakhir dikirim ("YYYY-MM-DD")
}
```

Disimpan lokal (tidak di-sync ke cloud). `components/daily-reminder.tsx` memeriksa tiap 60 detik dan mengirim `Notification` hanya bila sudah lewat `time`, belum dikirim hari ini, dan `activityByDate` hari ini kosong.

### Modul Gym (`levio.gym.v2`)

Sumber kode: `lib/gym.ts`. Sync ke cloud: tabel `gym_sessions` + `gym_xp_by_date`
(migration 0006), diorkestrasi `components/gym/gym-sync.tsx` — pull + merge
`mergeGym` saat login, push debounce saat berubah (pola sama dengan progress).

```ts
interface GymState {
  activeSession: GymSession | null;
  sessions: GymSession[];
  xpByDate: Record<string, number>; // XP gym per tanggal ("YYYY-MM-DD") — anti-farming
}

interface GymSession {
  id: string;
  title: string;
  templateId?: string;        // "push" | "pull" | "legs" | "upper" | "lower" | "full"
  date: string;               // "YYYY-MM-DD"
  startedAt: number;          // epoch ms
  completedAt: number | null;
  exercises: GymExerciseLog[];
}

interface GymExerciseLog {
  id: string;                 // id lokal (UUID)
  name: string;
  muscles: MuscleGroup[];     // chest|back|shoulders|arms|legs|core
  sets: GymSet[];
  notes: string;
  exerciseId?: string;        // referensi ke EXERCISE_DB (opsional, data lama tanpa ini)
  restSeconds?: number;       // durasi istirahat per latihan (opsional)
}

interface GymSet {
  weightKg: number;
  reps: number;
  done: boolean;
}
```

Aturan:
- **XP gym:** `completeSession` memberi 10 XP/sesi (`GYM_XP_PER_SESSION`), maks 30/hari (`MAX_GYM_XP_PER_DAY`) di `xpByDate`. XP dikirim ke akun via `applyGymXp` (tanpa menyentuh streak belajar).
- **Estimasi 1RM:** `estOneRepMax(set)` = Epley `weightKg × (1 + reps/30)`, reps di-clamp 0–30.
- **Progress per latihan:** `exerciseProgressPoints(state, key)` mengagregasi per tanggal sesi (`topWeight`/`est1RM`/`volume`/`sets`); `key` = `exerciseId` **atau** nama bebas-text (case-insensitive) untuk data lama. `topWeight` hanya menghitung set valid (`reps > 0 && weightKg > topWeight`).

#### Database latihan (`lib/gym-exercises.ts`)

Master data 56 latihan (`EXERCISE_DB`), tiap entry:

```ts
interface ExerciseDef {
  id: string;         // "bench-press", "squat", dst — dipakai sebagai exerciseId di log
  nameKey: string;    // kunci i18n "gym.exercise.*"
  muscles: MuscleGroup[];
  restSeconds: number; // 45–180 dtk (default rest timer)
}
```

- `getExerciseDef(id)` → `ExerciseDef | undefined`; `defaultRestSeconds(def)` → rest dari DB, fallback `DEFAULT_REST_SECONDS = 90`.
- Template rutin (`ROUTINE_TEMPLATES`) memetakan tiap latihan ke `exerciseId`; `templateSessionDraft` mengisi `exerciseId` + `restSeconds` dari DB saat sesi dimulai.

## Kontrak Data Kosakata (kode)

```ts
interface VocabWord {
  id: string;         // "hsk1-001"
  hanzi: string;      // 你好
  pinyin: string;     // nǐ hǎo
  meaning: string;    // halo
  hsk: HskLevel;      // 1 | 2 | 3 | 4 | 5 | 6
  example?: string;
  examplePinyin?: string;
  exampleMeaning?: string;
}
```

Sumber kode: `lib/hsk/types.ts`.
