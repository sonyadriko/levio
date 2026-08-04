import { describe, expect, it } from "vitest";
import {
  avgNewWordsPerDay,
  estimateDaysToMaster,
  retentionMetrics,
} from "../lib/stats";
import { emptyProgress, type ProgressState } from "../lib/progress";
import { dateKeyOf } from "../lib/date";

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dateKeyOf(d);
}

describe("avgNewWordsPerDay", () => {
  it("0 bila tidak ada aktivitas", () => {
    expect(avgNewWordsPerDay({})).toBe(0);
  });

  it("merata-ratakan kata baru selama 30 hari kalender", () => {
    const activity = {
      [daysAgo(0)]: { xp: 10, reviews: 10, tests: 0, newWords: 10 },
      [daysAgo(5)]: { xp: 10, reviews: 10, tests: 0, newWords: 20 },
    };
    expect(avgNewWordsPerDay(activity)).toBe(1); // 30 / 30
  });

  it("mengabaikan aktivitas yang lebih tua dari jendela", () => {
    const activity = {
      [daysAgo(60)]: { xp: 10, reviews: 10, tests: 0, newWords: 900 },
    };
    expect(avgNewWordsPerDay(activity)).toBe(0);
  });
});

describe("retentionMetrics", () => {
  it("menghitung retensi, leech, dan jatuh tempo", () => {
    const state: ProgressState = {
      ...emptyProgress(),
      words: {
        a: { reviews: 6, correct: 5, mastered: true, nextReview: dateKeyOf(new Date(Date.now() + 86400000)), ease: 2.5, repetitions: 5 },
        b: { reviews: 3, correct: 2, mastered: true, nextReview: dateKeyOf(new Date(Date.now() + 86400000)), ease: 2.5, repetitions: 2 },
        c: { reviews: 8, correct: 2, mastered: false, nextReview: null, ease: 1.3, repetitions: 0 },
        d: { reviews: 5, correct: 4, mastered: true, nextReview: daysAgo(0), ease: 2.5, repetitions: 4 },
      },
    };
    const m = retentionMetrics(state);
    expect(m.reviewed).toBe(4);
    expect(m.mastered).toBe(3);
    expect(m.leeches).toBe(1); // hanya c
    expect(m.dueToday).toBe(1); // hanya d
    expect(m.remembered).toBe(3);
    expect(m.retentionRate).toBe(75);
  });

  it("0% saat tidak ada kata direview", () => {
    const m = retentionMetrics(emptyProgress());
    expect(m.retentionRate).toBe(0);
    expect(m.reviewed).toBe(0);
  });
});

describe("estimateDaysToMaster", () => {
  it("0 bila sudah tuntas", () => {
    expect(estimateDaysToMaster(emptyProgress(), 100, 100)).toBe(0);
  });

  it("null bila tidak ada kecepatan belajar", () => {
    expect(estimateDaysToMaster(emptyProgress(), 100, 40)).toBeNull();
  });

  it("menghitung hari tersisa berdasar kecepatan kata baru", () => {
    const state: ProgressState = {
      ...emptyProgress(),
      activityByDate: {
        [daysAgo(0)]: { xp: 10, reviews: 10, tests: 0, newWords: 10 },
      },
    };
    // pace = 10/30 ≈ 0.3 → sisa 60 kata → 200 hari
    expect(estimateDaysToMaster(state, 100, 40)).toBe(200);
  });
});
