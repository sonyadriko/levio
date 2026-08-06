import { describe, expect, it } from "vitest";
import {
  DEFAULT_SLEEP_TARGET_MIN,
  SLEEP_XP_PER_GOAL,
  emptySleep,
  isSleepTargetMet,
  logSleep,
  sanitizeSleep,
  setSleepTarget,
  sleepDurationMinutes,
  sleepForDate,
} from "../lib/sleep";
import { todayKey } from "../lib/date";

describe("sanitizeSleep", () => {
  it("mengembalikan kosong bila data invalid", () => {
    expect(sanitizeSleep(null)).toEqual(emptySleep());
    expect(sanitizeSleep([])).toEqual(emptySleep());
  });

  it("menormalkan target dan membuang tanggal invalid", () => {
    const state = sanitizeSleep({
      targetMin: 420,
      byDate: { [todayKey()]: 480, "x": 500, "2020-01-01": -60 },
      xpClaimedByDate: { [todayKey()]: true },
    });
    expect(state.targetMin).toBe(420);
    expect(sleepForDate(state, todayKey())).toBe(480);
    expect(state.byDate.x).toBeUndefined();
    expect(state.byDate["2020-01-01"]).toBe(0);
    expect(state.xpClaimedByDate[todayKey()]).toBe(true);
  });
});

describe("logSleep", () => {
  it("mencatat durasi dan memberi XP saat target tercapai", () => {
    const base = emptySleep();
    const { state, xpAwarded } = logSleep(base, 480);
    expect(sleepForDate(state, todayKey())).toBe(480);
    expect(xpAwarded).toBe(SLEEP_XP_PER_GOAL);
    expect(isSleepTargetMet(state, todayKey())).toBe(true);
  });

  it("tidak memberi XP dua kali pada hari yang sama", () => {
    const first = logSleep(emptySleep(), 480);
    const second = logSleep(first.state, 300);
    expect(second.xpAwarded).toBe(0);
    expect(sleepForDate(second.state, todayKey())).toBe(300);
  });

  it("menggantikan nilai lama dan XP hanya diklaim saat pertama mencapai target", () => {
    const a = logSleep(emptySleep(), 300);
    expect(a.xpAwarded).toBe(0);
    const b = logSleep(a.state, 480);
    expect(b.xpAwarded).toBe(SLEEP_XP_PER_GOAL);
  });
});

describe("sleepDurationMinutes", () => {
  it("menghitung durasi normal (tidur → bangun) dan lintas tengah malam", () => {
    expect(sleepDurationMinutes("23:00", "07:00")).toBe(8 * 60);
    expect(sleepDurationMinutes("22:30", "06:15")).toBe(7 * 60 + 45);
  });

  it("mengembalikan 0 untuk format invalid atau durasi > 24 jam", () => {
    expect(sleepDurationMinutes("", "07:00")).toBe(0);
    expect(sleepDurationMinutes("23:00", "07:00x")).toBe(0);
    expect(sleepDurationMinutes("99:00", "07:00")).toBe(0);
    expect(sleepDurationMinutes("00:00", "24:00")).toBe(0);
  });
});

describe("setSleepTarget", () => {
  it("mempertahankan minimal 15 menit dan target default 480", () => {
    expect(emptySleep().targetMin).toBe(DEFAULT_SLEEP_TARGET_MIN);
    expect(setSleepTarget(emptySleep(), 10).targetMin).toBe(15);
    expect(setSleepTarget(emptySleep(), 540).targetMin).toBe(540);
  });
});