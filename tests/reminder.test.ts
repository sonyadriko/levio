import { afterEach, describe, expect, it, vi } from "vitest";
import { isValidTime, isPastTime } from "../lib/reminder";

describe("isValidTime (B7)", () => {
  it("menerima jam valid", () => {
    expect(isValidTime("00:00")).toBe(true);
    expect(isValidTime("08:30")).toBe(true);
    expect(isValidTime("19:00")).toBe(true);
    expect(isValidTime("23:59")).toBe(true);
  });

  it("menolak jam/menit di luar rentang", () => {
    expect(isValidTime("24:00")).toBe(false);
    expect(isValidTime("12:60")).toBe(false);
    expect(isValidTime("99:99")).toBe(false);
  });

  it("menolak format salah", () => {
    expect(isValidTime("9:00")).toBe(false);
    expect(isValidTime("ab:cd")).toBe(false);
    expect(isValidTime("")).toBe(false);
    expect(isValidTime("12:00:00")).toBe(false);
  });
});

describe("isPastTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("membandingkan dengan jam saat ini", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15, 10, 0, 0)); // 10:00

    expect(isPastTime("09:00")).toBe(true);
    expect(isPastTime("10:00")).toBe(true);
    expect(isPastTime("10:01")).toBe(false);
    expect(isPastTime("23:00")).toBe(false);
  });
});
