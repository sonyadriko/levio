import { describe, expect, it } from "vitest";
import {
  avgNewWordsPerDay,
  estimateDaysToMaster,
  retentionMetrics,
  suggestDailyTarget,
} from "../lib/stats";
import { emptyProgress, type ProgressState } from "../lib/progress";
import { dateKeyOf } from "../lib/date";
import type { DailyTargets } from "../lib/settings";

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

describe("suggestDailyTarget", () => {
  const targets: DailyTargets = { vocab: 10, reviews: 15, xp: 100 };

  function stateWithRetention(
    reviewed: number,
    retentionRate: number,
    leeches = 0,
  ): ProgressState {
    const due = reviewed - Math.round((reviewed * retentionRate) / 100);
    const words: ProgressState["words"] = {};
    for (let i = 0; i < reviewed; i++) {
      const isLeech = i < leeches;
      words[`w${i}`] = {
        reviews: isLeech ? 8 : 5,
        correct: isLeech ? 2 : 4,
        mastered: false,
        nextReview: i < due ? daysAgo(0) : dateKeyOf(new Date(Date.now() + 86400000)),
        ease: 2.5,
        repetitions: 3,
      };
    }
    return { ...emptyProgress(), words };
  }

  it("null saat belum ada kata direview", () => {
    expect(suggestDailyTarget(emptyProgress(), targets)).toBeNull();
  });

  it("menyarankan menurunkan target saat retensi rendah", () => {
    const s = stateWithRetention(20, 40); // retensi 40%
    const suggestion = suggestDailyTarget(s, targets);
    expect(suggestion).not.toBeNull();
    expect(suggestion!.field).toBe("vocab");
    expect(suggestion!.suggested).toBeLessThan(targets.vocab);
    expect(suggestion!.reasonKey).toBe("profile.targetReasonRetention");
  });

  it("menyarankan menaikkan target saat retensi tinggi tanpa leech", () => {
    const s = stateWithRetention(20, 100); // retensi 100%, 0 leech
    const suggestion = suggestDailyTarget(s, targets);
    expect(suggestion).not.toBeNull();
    expect(suggestion!.field).toBe("vocab");
    expect(suggestion!.suggested).toBeGreaterThan(targets.vocab);
    expect(suggestion!.reasonKey).toBe("profile.targetReasonGood");
  });

  it("tidak menyarankan naik bila masih ada leech", () => {
    const s = stateWithRetention(20, 100, 3);
    expect(suggestDailyTarget(s, targets)).toBeNull();
  });

  it("null saat retensi di zona sehat (70–90)", () => {
    const s = stateWithRetention(20, 75);
    expect(suggestDailyTarget(s, targets)).toBeNull();
  });
});
