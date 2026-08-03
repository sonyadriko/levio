import { describe, expect, it } from "vitest";
import {
  HIRAGANA,
  KATAKANA,
  KANA_GROUPS,
  KANA_ITEMS,
  kanaByAlphabet,
} from "@/lib/japanese/kana";
import {
  EMPTY_KANA_PROGRESS,
  markKanaKnown,
  toggleKanaKnown,
  knownKanaCount,
  isKanaKnown,
} from "@/lib/kana-progress";

describe("data kana", () => {
  const expectedCounts = { base: 46, dakuten: 20, handakuten: 5, combination: 33 };

  const checkAlphabet = (name: string, items: typeof HIRAGANA) => {
    it(`${name} berisi 104 huruf (46 dasar, 20 dakuten, 5 handakuten, 33 kombinasi)`, () => {
      expect(items).toHaveLength(104);
      for (const [group, count] of Object.entries(expectedCounts)) {
        expect(items.filter((i) => i.group === group)).toHaveLength(count);
      }
    });

    it(`${name} punya kana unik`, () => {
      const kanas = items.map((i) => i.kana);
      expect(new Set(kanas).size).toBe(kanas.length);
    });

    it(`${name} semua item valid (alphabet & group benar)`, () => {
      for (const item of items) {
        expect(item.alphabet).toBe(name === "hiragana" ? "hiragana" : "katakana");
        expect(KANA_GROUPS).toContain(item.group);
        expect(item.kana.length).toBeGreaterThan(0);
        expect(item.romaji.length).toBeGreaterThan(0);
      }
    });
  };

  checkAlphabet("hiragana", HIRAGANA);
  checkAlphabet("katakana", KATAKANA);

  it("total gabungan 208 huruf", () => {
    expect(KANA_ITEMS).toHaveLength(208);
  });

  it("kanaByAlphabet mengembalikan alfabet yang benar", () => {
    expect(kanaByAlphabet("hiragana")).toBe(HIRAGANA);
    expect(kanaByAlphabet("katakana")).toBe(KATAKANA);
  });
});

describe("progres kana", () => {
  it("markKanaKnown menambahkan tanpa duplikat", () => {
    const next = markKanaKnown(EMPTY_KANA_PROGRESS, "hiragana", "あ");
    expect(isKanaKnown(next, "hiragana", "あ")).toBe(true);
    const again = markKanaKnown(next, "hiragana", "あ");
    expect(again.hiragana).toHaveLength(1);
  });

  it("toggleKanaKnown menghapus bila sudah ada", () => {
    const marked = markKanaKnown(EMPTY_KANA_PROGRESS, "katakana", "ア");
    const toggled = toggleKanaKnown(marked, "katakana", "ア");
    expect(isKanaKnown(toggled, "katakana", "ア")).toBe(false);
  });

  it("knownKanaCount ter-clamp ke total", () => {
    const over = { hiragana: ["あ", "い", "う"], katakana: [] };
    expect(knownKanaCount(over, "hiragana", 2)).toBe(2);
    expect(knownKanaCount(EMPTY_KANA_PROGRESS, "hiragana", 104)).toBe(0);
  });
});
