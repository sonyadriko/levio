import { describe, expect, it } from "vitest";
import { countEarnedBadges, getBadges } from "../lib/badges";
import { emptyProgress, type ProgressState } from "../lib/progress";

function makeProgress(overrides: Partial<ProgressState> = {}): ProgressState {
  return { ...emptyProgress(), ...overrides };
}

function masteredWords(ids: string[]): ProgressState["words"] {
  const words: ProgressState["words"] = {};
  for (const id of ids) {
    words[id] = {
      reviews: 3,
      correct: 3,
      mastered: true,
      nextReview: null,
      ease: 2.5,
      repetitions: 2,
    };
  }
  return words;
}

describe("getBadges", () => {
  it("tidak ada badge diraih dari progress kosong", () => {
    const badges = getBadges(emptyProgress());
    expect(badges.every((b) => !b.earned)).toBe(true);
    expect(countEarnedBadges(emptyProgress())).toBe(0);
  });

  it("badge XP pertama pada 100 XP", () => {
    const badges = getBadges(makeProgress({ xp: 100 }));
    const firstSteps = badges.find((b) => b.id === "first-steps")!;
    expect(firstSteps.earned).toBe(true);
    expect(firstSteps.current).toBe(100);
    expect(firstSteps.target).toBe(100);
  });

  it("badge XP besar tidak termasuk yang lebih kecil saat melewatinya", () => {
    const badges = getBadges(makeProgress({ xp: 5000 }));
    const earned = badges.filter((b) => b.earned).map((b) => b.id);
    expect(earned).toContain("first-steps");
    expect(earned).toContain("xp-1000");
    expect(earned).toContain("xp-5000");
  });

  it("badge streak dihitung dari streak", () => {
    const badges = getBadges(makeProgress({ streak: 7 }));
    expect(badges.find((b) => b.id === "streak-7")!.earned).toBe(true);
    expect(badges.find((b) => b.id === "streak-30")!.earned).toBe(false);
  });

  it("badge words-100 dihitung dari jumlah kata", () => {
    const words: ProgressState["words"] = {};
    for (let i = 0; i < 100; i++) {
      words[`hsk1-${i}`] = {
        reviews: 1,
        correct: 1,
        mastered: false,
        nextReview: null,
        ease: 2.5,
        repetitions: 0,
      };
    }
    const badge = getBadges(makeProgress({ words })).find((b) => b.id === "words-100")!;
    expect(badge.earned).toBe(true);
    expect(badge.current).toBe(100);
  });

  it("badge graduate-1 diraih setelah membuka level 2", () => {
    const badges = getBadges(makeProgress({ unlockedUpTo: 2 }));
    expect(badges.find((b) => b.id === "graduate-1")!.earned).toBe(true);
  });

  it("badge master-hsk1 menghitung kata hsk1 yang dikuasai", () => {
    const progress = makeProgress({ words: masteredWords(["hsk1-1", "hsk1-2", "hsk1-3"]) });
    const badge = getBadges(progress).find((b) => b.id === "master-hsk1")!;
    expect(badge.earned).toBe(false);
    expect(badge.current).toBe(3);
    expect(badge.target).toBeGreaterThan(3);
  });

  it("hanya kata berawalan hsk1 yang dihitung untuk master-hsk1", () => {
    const progress = makeProgress({
      words: {
        ...masteredWords(["hsk1-1", "hsk1-2", "hsk2-1"]),
        hsk2X: {
          reviews: 3,
          correct: 3,
          mastered: true,
          nextReview: null,
          ease: 2.5,
          repetitions: 2,
        },
      },
    });
    const badge = getBadges(progress).find((b) => b.id === "master-hsk1")!;
    expect(badge.current).toBe(2);
  });
});
