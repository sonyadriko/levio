import { describe, expect, it } from "vitest";
import {
  addDays,
  dateKeyOf,
  mondayOf,
  monthKeyOf,
  monthLabel,
  yearKeyOf,
} from "../lib/date";

describe("dateKeyOf", () => {
  it("memformat YYYY-MM-DD dengan nol depan", () => {
    expect(dateKeyOf(new Date(2026, 7, 2))).toBe("2026-08-02");
    expect(dateKeyOf(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("mondayOf", () => {
  it("Minggu (0) jatuh ke Senin sebelumnya", () => {
    // 2026-08-02 adalah Minggu
    const d = mondayOf(new Date(2026, 7, 2));
    expect(dateKeyOf(d)).toBe("2026-07-27");
  });

  it("hari Senin tetap hari itu", () => {
    // 2026-07-27 adalah Senin
    const d = mondayOf(new Date(2026, 6, 27));
    expect(dateKeyOf(d)).toBe("2026-07-27");
  });

  it("Rabu jatuh ke Senin minggu yang sama", () => {
    // 2026-07-29 adalah Rabu
    const d = mondayOf(new Date(2026, 6, 29));
    expect(dateKeyOf(d)).toBe("2026-07-27");
  });
});

describe("addDays", () => {
  it("menambah dan mengurangi hari", () => {
    expect(dateKeyOf(addDays(new Date(2026, 7, 2), 1))).toBe("2026-08-03");
    expect(dateKeyOf(addDays(new Date(2026, 7, 2), -2))).toBe("2026-07-31");
  });
});

describe("monthKeyOf / yearKeyOf", () => {
  it("memformat bulan dan tahun", () => {
    expect(monthKeyOf(new Date(2026, 7, 2))).toBe("2026-08");
    expect(yearKeyOf(new Date(2026, 7, 2))).toBe("2026");
  });
});

describe("monthLabel", () => {
  it("mengembalikan nama bulan Indonesia", () => {
    expect(monthLabel(new Date(2026, 0, 1))).toBe("Jan");
    expect(monthLabel(new Date(2026, 7, 1))).toBe("Agu");
    expect(monthLabel(new Date(2026, 11, 1))).toBe("Des");
  });
});
