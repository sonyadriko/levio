import type { VocabWord } from "./hsk/types";
import { dateKeyOf, todayKey } from "./date";

export const PROGRESS_STORAGE_KEY = "levio.progress.v1";
export const XP_PER_LEVEL = 500;
export const DEFAULT_EASE = 2.5;
export const MIN_EASE = 1.3;
export const MAX_INTERVAL_DAYS = 365;
export const MAX_HSK_LEVEL = 6;
export const MIN_PASS_PCT = 60;

export interface WordProgress {
  reviews: number;
  correct: number;
  mastered: boolean;
  nextReview: string | null;
  ease: number;
  repetitions: number;
}

export interface ActivityDay {
  xp: number;
  reviews: number;
  tests: number;
  newWords: number;
}

export interface LastTest {
  correct: number;
  total: number;
  date: string;
}

export interface ProgressState {
  xp: number;
  streak: number;
  lastActiveDate: string | null;
  words: Record<string, WordProgress>;
  completedReviews: number;
  completedTests: number;
  activityByDate: Record<string, ActivityDay>;
  lastTest: LastTest | null;
  // Level HSK tertinggi yang terbuka (1..6). Lulus tes level N → naik ke N+1.
  unlockedUpTo: number;
}

export function emptyProgress(): ProgressState {
  return {
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    words: {},
    completedReviews: 0,
    completedTests: 0,
    activityByDate: {},
    lastTest: null,
    unlockedUpTo: 1,
  };
}

function nextReviewDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Interval SRS ala SM-2: jarak review berikutnya dalam hari.
// Berurutan benar: 1 → 6 → 6×ease → 6×ease² → … (kap 365 hari).
function reviewInterval(repetitions: number, ease: number): number {
  if (repetitions <= 0) return 1;
  if (repetitions === 1) return 1;
  if (repetitions === 2) return 6;
  return Math.min(
    Math.round(6 * Math.pow(ease, repetitions - 2)),
    MAX_INTERVAL_DAYS,
  );
}

function defaultWordProgress(): WordProgress {
  return {
    reviews: 0,
    correct: 0,
    mastered: false,
    nextReview: null,
    ease: DEFAULT_EASE,
    repetitions: 0,
  };
}

function normalizeWordProgress(w: Partial<WordProgress>): WordProgress {
  return {
    reviews: w.reviews ?? 0,
    correct: w.correct ?? 0,
    mastered: w.mastered ?? false,
    nextReview: w.nextReview ?? null,
    ease: typeof w.ease === "number" ? w.ease : DEFAULT_EASE,
    repetitions: typeof w.repetitions === "number" ? w.repetitions : 0,
  };
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function sanitizeProgress(data: unknown): ProgressState | null {
  if (typeof data !== "object" || data === null) return null;
  const record = data as Record<string, unknown>;
  if (typeof record.xp !== "number" || !Number.isFinite(record.xp)) return null;

  const words: Record<string, WordProgress> = {};
  const rawWords = record.words;
  if (rawWords && typeof rawWords === "object" && !Array.isArray(rawWords)) {
    for (const [id, w] of Object.entries(rawWords)) {
      if (w && typeof w === "object") {
        words[id] = normalizeWordProgress(w as Partial<WordProgress>);
      }
    }
  }

  const activityByDate: Record<string, ActivityDay> = {};
  const rawActivity = record.activityByDate;
  if (
    rawActivity &&
    typeof rawActivity === "object" &&
    !Array.isArray(rawActivity)
  ) {
    for (const [key, day] of Object.entries(rawActivity)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
      if (day && typeof day === "object") {
        const d = day as Partial<ActivityDay>;
        activityByDate[key] = {
          xp: toNumber(d.xp),
          reviews: toNumber(d.reviews),
          tests: toNumber(d.tests),
          newWords: toNumber(d.newWords),
        };
      }
    }
  }

  const rawTest = record.lastTest;
  const lastTest =
    rawTest &&
    typeof rawTest === "object" &&
    typeof (rawTest as LastTest).correct === "number" &&
    typeof (rawTest as LastTest).total === "number" &&
    typeof (rawTest as LastTest).date === "string"
      ? (rawTest as LastTest)
      : null;

  return {
    xp: Math.max(0, record.xp),
    streak: Math.max(0, toNumber(record.streak)),
    lastActiveDate:
      typeof record.lastActiveDate === "string" ? record.lastActiveDate : null,
    words,
    completedReviews: toNumber(record.completedReviews),
    completedTests: toNumber(record.completedTests),
    activityByDate,
    lastTest,
    unlockedUpTo: clampLevel(toNumber(record.unlockedUpTo)),
  };
}

function clampLevel(level: number): number {
  return Math.min(MAX_HSK_LEVEL, Math.max(1, Math.round(level)));
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKeyOf(d);
}

function updateStreak(state: ProgressState, today: string): number {
  if (state.lastActiveDate === today) return state.streak;
  if (state.lastActiveDate === yesterdayKey()) return state.streak + 1;
  return 1;
}

function addActivity(
  activity: Record<string, ActivityDay>,
  date: string,
  delta: Partial<ActivityDay>,
): Record<string, ActivityDay> {
  const prev = activity[date] ?? { xp: 0, reviews: 0, tests: 0, newWords: 0 };
  return {
    ...activity,
    [date]: {
      xp: prev.xp + (delta.xp ?? 0),
      reviews: prev.reviews + (delta.reviews ?? 0),
      tests: prev.tests + (delta.tests ?? 0),
      newWords: (prev.newWords ?? 0) + (delta.newWords ?? 0),
    },
  };
}

export function applyReview(
  state: ProgressState,
  word: VocabWord,
  correct: boolean,
): ProgressState {
  const today = todayKey();
  const raw = state.words[word.id];
  const prev = raw ? normalizeWordProgress(raw) : defaultWordProgress();

  const reviews = prev.reviews + 1;
  const correctCount = prev.correct + (correct ? 1 : 0);
  const mastered =
    reviews >= 3 &&
    correctCount >= 2 &&
    correctCount / reviews >= 0.5;
  const ease = Math.max(MIN_EASE, prev.ease + (correct ? 0.1 : -0.15));
  const repetitions = correct ? prev.repetitions + 1 : 0;
  const xpEarned = correct ? 10 : 3;
  // Jawaban salah → jadwalkan ulang hari ini (retry cepat), bukan besok.
  const nextReview = nextReviewDate(
    correct ? reviewInterval(repetitions, ease) : 0,
  );
  const isNew = !state.words[word.id];

  return {
    ...state,
    xp: state.xp + xpEarned,
    streak: updateStreak(state, today),
    lastActiveDate: today,
    completedReviews: state.completedReviews + 1,
    activityByDate: addActivity(state.activityByDate, today, {
      xp: xpEarned,
      reviews: 1,
      newWords: isNew ? 1 : 0,
    }),
    words: {
      ...state.words,
      [word.id]: {
        reviews,
        correct: correctCount,
        mastered,
        ease,
        repetitions,
        nextReview,
      },
    },
  };
}

export function testXp(correct: number, total: number): number {
  const accuracy = total === 0 ? 0 : correct / total;
  return Math.round(correct * 5 * (0.5 + accuracy * 0.5));
}

export function applyTest(
  state: ProgressState,
  correct: number,
  total: number,
): ProgressState {
  const today = todayKey();
  const xp = testXp(correct, total);

  return {
    ...state,
    xp: state.xp + xp,
    streak: updateStreak(state, today),
    lastActiveDate: today,
    completedTests: state.completedTests + 1,
    activityByDate: addActivity(state.activityByDate, today, {
      xp,
      tests: 1,
    }),
    lastTest: { correct, total, date: today },
  };
}

// Lulus tes kelulusan level N membuka level N+1.
export function applyLevelPass(
  state: ProgressState,
  level: number,
): ProgressState {
  const next = Math.min(MAX_HSK_LEVEL, Math.max(state.unlockedUpTo, level + 1));
  if (next === state.unlockedUpTo) return state;
  return { ...state, unlockedUpTo: next };
}

// XP murni tanpa menyentuh kata/tes — dipakai latihan non-kosakata
// (mis. latihan kalimat). Streak & aktivitas harian tetap dihitung.
export function applyXp(state: ProgressState, xp: number): ProgressState {
  const today = todayKey();
  return {
    ...state,
    xp: state.xp + xp,
    streak: updateStreak(state, today),
    lastActiveDate: today,
    activityByDate: addActivity(state.activityByDate, today, { xp }),
  };
}

export function loadProgress(): ProgressState {
  if (typeof window === "undefined") return emptyProgress();
  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    const words: Record<string, WordProgress> = {};
    for (const [id, w] of Object.entries(parsed.words ?? {})) {
      words[id] = normalizeWordProgress(w ?? {});
    }
    return {
      ...emptyProgress(),
      ...parsed,
      words,
      unlockedUpTo: clampLevel(toNumber(parsed.unlockedUpTo)),
    };
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage penuh / tidak tersedia — abaikan.
  }
}
