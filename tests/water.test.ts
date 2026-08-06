import { describe, expect, it } from "vitest";
import {
  DEFAULT_WATER_TARGET_ML,
  WATER_XP_PER_GOAL,
  drinkWater,
  emptyWater,
  isWaterTargetMet,
  sanitizeWater,
  setWaterTarget,
  waterForDate,
} from "../lib/water";
import { todayKey } from "../lib/date";

describe("sanitizeWater", () => {
  it("mengembalikan kosong bila data invalid", () => {
    expect(sanitizeWater(null)).toEqual(emptyWater());
    expect(sanitizeWater("x")).toEqual(emptyWater());
  });

  it("menormalkan target, membuang tanggal invalid & nilai negatif", () => {
    const state = sanitizeWater({
      targetMl: 1500,
      byDate: { [todayKey()]: 400, "bukan-tanggal": 500, "2020-01-01": -10 },
      xpClaimedByDate: { [todayKey()]: true, "x": true },
    });
    expect(state.targetMl).toBe(1500);
    expect(waterForDate(state, todayKey())).toBe(400);
    expect(state.byDate["bukan-tanggal"]).toBeUndefined();
    expect(state.byDate["2020-01-01"]).toBe(0);
    expect(state.xpClaimedByDate[todayKey()]).toBe(true);
    expect(state.xpClaimedByDate.x).toBeUndefined();
  });
});

describe("drinkWater", () => {
  it("menambah asupan hari ini tanpa XP sebelum target", () => {
    const base = emptyWater();
    const { state, xpAwarded } = drinkWater(base, 500);
    expect(waterForDate(state, todayKey())).toBe(500);
    expect(xpAwarded).toBe(0);
    expect(isWaterTargetMet(state, todayKey())).toBe(false);
  });

  it("memberi XP sekali saat target tercapai, tidak dua kali", () => {
    const first = drinkWater(emptyWater(), 2000);
    expect(first.xpAwarded).toBe(WATER_XP_PER_GOAL);
    expect(isWaterTargetMet(first.state, todayKey())).toBe(true);

    const second = drinkWater(first.state, 500);
    expect(second.xpAwarded).toBe(0);
    expect(waterForDate(second.state, todayKey())).toBe(2500);
  });

  it("mengikuti target yang sudah disetel", () => {
    const base = setWaterTarget(emptyWater(), 1500);
    const { state, xpAwarded } = drinkWater(base, 1500);
    expect(xpAwarded).toBe(WATER_XP_PER_GOAL);
    expect(state.targetMl).toBe(1500);
  });
});

describe("setWaterTarget", () => {
  it("mempertahankan minimal 250 ml", () => {
    const state = setWaterTarget(emptyWater(), 100);
    expect(state.targetMl).toBe(250);
  });
  it("target default 2000 ml", () => {
    expect(emptyWater().targetMl).toBe(DEFAULT_WATER_TARGET_ML);
  });
});