import { describe, expect, it } from "vitest";
import { leaderName, rankMedal } from "../lib/leaderboard";

describe("rankMedal", () => {
  it("medali untuk 3 besar, null untuk lainnya", () => {
    expect(rankMedal(1)).toBe("gold");
    expect(rankMedal(2)).toBe("silver");
    expect(rankMedal(3)).toBe("bronze");
    expect(rankMedal(4)).toBeNull();
    expect(rankMedal(0)).toBeNull();
  });
});

describe("leaderName", () => {
  it("nama kosong memakai fallback", () => {
    expect(leaderName("", "Pemain")).toBe("Pemain");
    expect(leaderName("   ", "Pemain")).toBe("Pemain");
  });

  it("nama yang terisi di-trim", () => {
    expect(leaderName("  Andi  ", "Pemain")).toBe("Andi");
  });
});