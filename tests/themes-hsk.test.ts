import { describe, expect, it } from "vitest";
import { allHskThemes, getHskTheme } from "../lib/hsk/themes";
import { hsk1Words } from "../lib/hsk/data/hsk1";
import { hsk2Words } from "../lib/hsk/data/hsk2";
import { hsk3Words } from "../lib/hsk/data/hsk3";
import { hsk4Words } from "../lib/hsk/data/hsk4";
import { hsk5Words } from "../lib/hsk/data/hsk5";
import { hsk6Words } from "../lib/hsk/data/hsk6";
import type { VocabWord } from "../lib/hsk/types";

const ALL_DATA: Record<string, VocabWord> = Object.fromEntries(
  [
    ...hsk1Words,
    ...hsk2Words,
    ...hsk3Words,
    ...hsk4Words,
    ...hsk5Words,
    ...hsk6Words,
  ].map((w) => [w.id, w]),
);

describe("paket tematik HSK", () => {
  it("mendefinisikan 4 tema (travel, office, food, daily)", () => {
    expect(allHskThemes().map((t) => t.id)).toEqual([
      "travel",
      "office",
      "food",
      "daily",
    ]);
    for (const theme of allHskThemes()) {
      expect(theme.titleKey.startsWith("theme.")).toBe(true);
      expect(theme.descKey.startsWith("theme.")).toBe(true);
    }
  });

  it("setiap tema punya minimal 24 kata (pool yang cukup untuk berlatih)", () => {
    for (const theme of allHskThemes()) {
      expect(theme.words.length).toBeGreaterThanOrEqual(24);
    }
  });

  it("tidak ada id duplikat dalam satu tema", () => {
    for (const theme of allHskThemes()) {
      const ids = theme.words.map((w) => w.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("setiap kata lengkap: term, reading, meaning, level, dan kalimat contoh", () => {
    for (const theme of allHskThemes()) {
      for (const word of theme.words) {
        expect(word.term.length).toBeGreaterThan(0);
        expect(word.reading?.length ?? 0).toBeGreaterThan(0);
        expect(word.meaning.length).toBeGreaterThan(0);
        expect(word.level).toBeGreaterThanOrEqual(1);
        expect(word.level).toBeLessThanOrEqual(6);
        expect(word.example?.length ?? 0).toBeGreaterThan(0);
        expect(word.exampleReading?.length ?? 0).toBeGreaterThan(0);
        expect(word.exampleMeaning?.length ?? 0).toBeGreaterThan(0);
        expect(word.themes?.includes(theme.id)).toBe(true);
      }
    }
  });

  it("kata yang di-reuse dari kurikulum HSK identik dengan data aslinya", () => {
    for (const theme of allHskThemes()) {
      for (const word of theme.words) {
        if (!/^hsk[1-6]-\d{3}$/.test(word.id)) continue;
        const original = ALL_DATA[word.id];
        expect(original, `${word.id} tidak ada di data HSK`).toBeDefined();
        expect(word.term).toBe(original.hanzi);
        expect(word.reading).toBe(original.pinyin);
        expect(word.meaning).toBe(original.meaning);
        expect(word.level).toBe(original.hsk);
      }
    }
  });

  it("tidak ada tabrakan id antara pack tematik dan data HSK", () => {
    for (const theme of allHskThemes()) {
      for (const word of theme.words) {
        if (word.id.startsWith("hsk-theme-")) {
          expect(ALL_DATA[word.id]).toBeUndefined();
        }
      }
    }
  });

  it("getHskTheme mengembalikan undefined untuk id tak dikenal", () => {
    expect(getHskTheme("nope")).toBeUndefined();
    expect(getHskTheme("travel")).toBeDefined();
  });
});
