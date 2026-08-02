import { describe, expect, it } from "vitest";
import {
  activeDates,
  overallStreak,
  todayStatus,
} from "../lib/habits";
import { emptyGym, type GymState } from "../lib/gym";
import { emptyProgress, type ProgressState } from "../lib/progress";
import { todayKey } from "../lib/date";

function progressWith(dates: string[]): ProgressState {
  const state = emptyProgress();
  for (const date of dates) {
    state.activityByDate[date] = { xp: 10, reviews: 1, tests: 0, newWords: 1 };
  }
  return state;
}

function gymWith(dates: string[]): GymState {
  const state = emptyGym();
  state.sessions = dates.map((date) => ({
    id: date,
    title: "Sesi",
    date,
    startedAt: 0,
    completedAt: 1,
    exercises: [],
  }));
  return state;
}

const d = (offset: number): string => {
  const today = new Date();
  const copy = new Date(today);
  copy.setDate(copy.getDate() + offset);
  return `${copy.getFullYear()}-${String(copy.getMonth() + 1).padStart(2, "0")}-${String(copy.getDate()).padStart(2, "0")}`;
};

describe("activeDates", () => {
  it("menggabungkan tanggal belajar dan gym tanpa duplikasi", () => {
    const progress = progressWith([d(0), d(-1)]);
    const gym = gymWith([d(-1), d(-2)]);
    const dates = activeDates(progress, gym);
    expect(dates.has(d(0))).toBe(true);
    expect(dates.has(d(-1))).toBe(true);
    expect(dates.has(d(-2))).toBe(true);
    expect(dates.size).toBe(3);
  });
});

describe("overallStreak", () => {
  it("menggabungkan streak belajar + gym (hari aktif = salah satu)", () => {
    // Belajar: hari ini, kemarin. Gym: dua hari lalu → streak gabungan 3.
    const progress = progressWith([d(0), d(-1)]);
    const gym = gymWith([d(-2)]);
    expect(overallStreak(progress, gym)).toBe(3);
  });

  it("streak tetap berjalan bila hanya ada gym", () => {
    const gym = gymWith([d(0), d(-1), d(-2)]);
    expect(overallStreak(emptyProgress(), gym)).toBe(3);
  });

  it("putus bila ada hari kosong di tengah", () => {
    const progress = progressWith([d(0), d(-1), d(-3)]);
    expect(overallStreak(progress, emptyGym())).toBe(2);
  });

  it("memperhitungkan hari ini yang masih kosong (mulai dari kemarin)", () => {
    const progress = progressWith([d(-1), d(-2)]);
    expect(overallStreak(progress, emptyGym())).toBe(2);
  });

  it("tanpa aktivitas sama sekali → 0", () => {
    expect(overallStreak(emptyProgress(), emptyGym())).toBe(0);
  });
});

describe("todayStatus", () => {
  it("mendeteksi belajar & gym hari ini", () => {
    const status = todayStatus(progressWith([todayKey()]), gymWith([todayKey()]));
    expect(status.studied).toBe(true);
    expect(status.workedOut).toBe(true);
  });

  it("mendeteksi hari kosong", () => {
    const status = todayStatus(emptyProgress(), emptyGym());
    expect(status.studied).toBe(false);
    expect(status.workedOut).toBe(false);
  });
});
