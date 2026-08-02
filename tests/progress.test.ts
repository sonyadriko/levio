import { describe, expect, it } from "vitest";
import {
  MAX_TEST_XP_PER_DAY,
  applyLevelPass,
  applyReview,
  applyTest,
  emptyProgress,
  mergeProgress,
  sanitizeProgress,
  testXp,
  type ProgressState,
  type WordProgress,
} from "../lib/progress";
import { todayKey } from "../lib/date";
import type { VocabWord } from "../lib/hsk/types";

const word: VocabWord = {
  id: "hsk1-1",
  hanzi: "你",
  pinyin: "nǐ",
  meaning: "kamu",
};

function makeState(overrides: Partial<ProgressState> = {}): ProgressState {
  return { ...emptyProgress(), ...overrides };
}

describe("testXp", () => {
  it("menghitung XP berdasar akurasi", () => {
    expect(testXp(20, 40)).toBe(75);
    expect(testXp(40, 40)).toBe(200);
    expect(testXp(0, 40)).toBe(0);
  });

  it("total 0 tidak membagi nol", () => {
    expect(testXp(5, 0)).toBe(0);
  });
});

describe("applyTest", () => {
  it("menambah XP, streak, dan testXpByDate", () => {
    const { state, awarded } = applyTest(emptyProgress(), 40, 40);
    expect(awarded).toBe(200);
    expect(state.xp).toBe(200);
    expect(state.completedTests).toBe(1);
    expect(state.testXpByDate[todayKey()]).toBe(200);
    expect(state.lastTest?.correct).toBe(40);
  });

  it("memotong XP harian ke MAX_TEST_XP_PER_DAY", () => {
    const once = applyTest(emptyProgress(), 50, 50);
    expect(once.awarded).toBe(MAX_TEST_XP_PER_DAY);
    expect(once.state.xp).toBe(200);

    const twice = applyTest(once.state, 50, 50);
    expect(twice.awarded).toBe(0);
    expect(twice.state.xp).toBe(200);
    expect(twice.state.completedTests).toBe(2);
  });

  it("memberi sisa jatah harian bila sudah ada pemakaian", () => {
    const first = applyTest(emptyProgress(), 20, 40); // raw 75
    expect(first.awarded).toBe(75);
    const second = applyTest(first.state, 40, 40); // raw 200, sisa 125
    expect(second.awarded).toBe(125);
    expect(second.state.testXpByDate[todayKey()]).toBe(200);
  });
});

describe("applyLevelPass", () => {
  it("membuka level berikutnya", () => {
    const state = applyLevelPass(emptyProgress(), 1);
    expect(state.unlockedUpTo).toBe(2);
  });

  it("tidak menurunkan level yang sudah terbuka", () => {
    const state = applyLevelPass(makeState({ unlockedUpTo: 5 }), 1);
    expect(state.unlockedUpTo).toBe(5);
  });

  it("kap di MAX_HSK_LEVEL (6)", () => {
    const state = applyLevelPass(makeState({ unlockedUpTo: 6 }), 6);
    expect(state.unlockedUpTo).toBe(6);
  });
});

describe("applyReview", () => {
  it("jawaban benar menambah XP 10 dan menjadwalkan besok", () => {
    const state = applyReview(emptyProgress(), word, true);
    expect(state.xp).toBe(10);
    expect(state.completedReviews).toBe(1);
    const wp = state.words[word.id];
    expect(wp.reviews).toBe(1);
    expect(wp.correct).toBe(1);
    expect(wp.mastered).toBe(false);
    expect(wp.nextReview).toBeTruthy();
    expect(state.streak).toBe(1);
  });

  it("jawaban salah menambah XP 3 dan menjadwalkan ulang hari ini", () => {
    const state = applyReview(emptyProgress(), word, false);
    expect(state.xp).toBe(3);
    const wp = state.words[word.id];
    expect(wp.correct).toBe(0);
    expect(wp.repetitions).toBe(0);
    expect(wp.nextReview).toBe(todayKey());
    expect(wp.ease).toBeLessThan(2.5);
  });

  it("mastered setelah minimal 3 review, 2 benar, rasio >= 50%", () => {
    let state = emptyProgress();
    state = applyReview(state, word, true); // 1/1
    state = applyReview(state, word, true); // 2/2
    expect(state.words[word.id].mastered).toBe(false);
    state = applyReview(state, word, true); // 3/3
    expect(state.words[word.id].mastered).toBe(true);
  });

  it("tidak mastered bila rasio benar rendah", () => {
    let state = emptyProgress();
    state = applyReview(state, word, true);
    state = applyReview(state, word, false);
    state = applyReview(state, word, false); // 1/3
    expect(state.words[word.id].mastered).toBe(false);
  });

  it("streak bertahan jika masih hari yang sama", () => {
    const day = makeState({ lastActiveDate: todayKey(), streak: 4 });
    const state = applyReview(day, word, true);
    expect(state.streak).toBe(4);
  });

  it("streak naik jika aktivitas kemarin", () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const yesterday = `${y}-${m}-${day}`;
    const dayState = makeState({ lastActiveDate: yesterday, streak: 4 });
    const state = applyReview(dayState, word, true);
    expect(state.streak).toBe(5);
  });

  it("streak reset ke 1 bila jeda lebih dari sehari", () => {
    const dayState = makeState({ lastActiveDate: "2020-01-01", streak: 4 });
    const state = applyReview(dayState, word, true);
    expect(state.streak).toBe(1);
  });
});

describe("sanitizeProgress", () => {
  it("menolak non-object dan xp non-number", () => {
    expect(sanitizeProgress(null)).toBeNull();
    expect(sanitizeProgress("x")).toBeNull();
    expect(sanitizeProgress({ xp: NaN })).toBeNull();
    expect(sanitizeProgress({})).toBeNull();
  });

  it("clamp semua angka negatif ke 0 (B8)", () => {
    const state = sanitizeProgress({
      xp: 100,
      streak: -3,
      completedReviews: -1,
      completedTests: -5,
      activityByDate: { "2026-08-01": { xp: -10, reviews: -2, tests: -1, newWords: -1 } },
      testXpByDate: { "2026-08-01": -50 },
      lastTest: { correct: -1, total: 10, date: "2026-08-01" },
    });
    expect(state).not.toBeNull();
    expect(state!.streak).toBe(0);
    expect(state!.completedReviews).toBe(0);
    expect(state!.completedTests).toBe(0);
    expect(state!.activityByDate["2026-08-01"].xp).toBe(0);
    expect(state!.testXpByDate["2026-08-01"]).toBe(0);
    expect(state!.lastTest!.correct).toBe(0);
  });

  it("membuang kunci aktivitas yang bukan tanggal valid", () => {
    const state = sanitizeProgress({
      xp: 10,
      activityByDate: {
        "2026-08-01": { xp: 5, reviews: 1, tests: 0, newWords: 0 },
        "bukan-tanggal": { xp: 9, reviews: 1, tests: 0, newWords: 0 },
      },
    });
    expect(state!.activityByDate["2026-08-01"].xp).toBe(5);
    expect(state!.activityByDate["bukan-tanggal"]).toBeUndefined();
  });

  it("clamp unlockedUpTo ke 1..6 dan membulatkan", () => {
    expect(sanitizeProgress({ xp: 1, unlockedUpTo: 99 })!.unlockedUpTo).toBe(6);
    expect(sanitizeProgress({ xp: 1, unlockedUpTo: 0 })!.unlockedUpTo).toBe(1);
    expect(sanitizeProgress({ xp: 1, unlockedUpTo: 2.7 })!.unlockedUpTo).toBe(3);
  });

  it("menormalkan word progress dan membuang entri non-object", () => {
    const state = sanitizeProgress({
      xp: 1,
      words: {
        a: { reviews: 2, correct: 1, mastered: false, nextReview: null, ease: 2.3, repetitions: 1 },
        b: "bukan-object",
      },
    });
    expect(state!.words.a.reviews).toBe(2);
    expect(state!.words.b).toBeUndefined();
  });
});

describe("mergeProgress", () => {
  it("mengambil nilai kumulatif maksimum", () => {
    const a = makeState({ xp: 100, streak: 3, completedReviews: 5 });
    const b = makeState({ xp: 80, streak: 9, completedReviews: 2 });
    const merged = mergeProgress(a, b);
    expect(merged.xp).toBe(100);
    expect(merged.streak).toBe(9);
    expect(merged.completedReviews).toBe(5);
  });

  it("menggabungkan kata memakai pickWordProgress (review terbanyak)", () => {
    const wpA: WordProgress = {
      reviews: 3,
      correct: 2,
      mastered: true,
      nextReview: "2026-08-05",
      ease: 2.5,
      repetitions: 2,
    };
    const wpB: WordProgress = {
      reviews: 5,
      correct: 4,
      mastered: true,
      nextReview: "2026-08-10",
      ease: 2.6,
      repetitions: 4,
    };
    const a = makeState({ words: { "hsk1-1": wpA } });
    const b = makeState({ words: { "hsk1-1": wpB } });
    expect(mergeProgress(a, b).words["hsk1-1"]).toEqual(wpB);
  });

  it("aktivitas harian diambil maksimum per tanggal, bukan ditimpa", () => {
    const a = makeState({
      activityByDate: {
        "2026-08-01": { xp: 100, reviews: 5, tests: 1, newWords: 3 },
      },
    });
    const b = makeState({
      activityByDate: {
        "2026-08-01": { xp: 50, reviews: 9, tests: 2, newWords: 1 },
        "2026-08-02": { xp: 20, reviews: 1, tests: 0, newWords: 0 },
      },
    });
    const merged = mergeProgress(a, b);
    expect(merged.activityByDate["2026-08-01"]).toEqual({
      xp: 100,
      reviews: 9,
      tests: 2,
      newWords: 3,
    });
    expect(merged.activityByDate["2026-08-02"].xp).toBe(20);
  });

  it("lastTest diambil yang paling baru; testXpByDate maksimum", () => {
    const a = makeState({
      lastTest: { correct: 30, total: 40, date: "2026-08-01" },
      testXpByDate: { "2026-08-01": 150 },
    });
    const b = makeState({
      lastTest: { correct: 40, total: 40, date: "2026-08-02" },
      testXpByDate: { "2026-08-01": 200, "2026-08-02": 200 },
    });
    const merged = mergeProgress(a, b);
    expect(merged.lastTest?.date).toBe("2026-08-02");
    expect(merged.testXpByDate["2026-08-01"]).toBe(200);
  });

  it("unlockedUpTo diambil maksimum", () => {
    const a = makeState({ unlockedUpTo: 3 });
    const b = makeState({ unlockedUpTo: 5 });
    expect(mergeProgress(a, b).unlockedUpTo).toBe(5);
  });
});
