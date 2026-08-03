import { describe, expect, it } from "vitest";
import {
  allJapaneseThemes,
  getJapaneseTheme,
} from "../lib/japanese/themes";
import { n5Words } from "../lib/japanese/data/n5";
import { n4Words } from "../lib/japanese/data/n4";
import { n3Words } from "../lib/japanese/data/n3";
import { n2Words } from "../lib/japanese/data/n2";
import { n1Words } from "../lib/japanese/data/n1";
import type { VocabItem } from "../lib/languages/types";

const ALL_DATA: Record<string, VocabItem> = Object.fromEntries(
  [...n5Words, ...n4Words, ...n3Words, ...n2Words, ...n1Words].map((w) => [
    w.id,
    w,
  ]),
);

describe("paket tematik Jepang", () => {
  it("mendefinisikan 4 tema (travel, office, food, daily)", () => {
    expect(allJapaneseThemes().map((t) => t.id)).toEqual([
      "travel",
      "office",
      "food",
      "daily",
    ]);
    for (const theme of allJapaneseThemes()) {
      expect(theme.titleKey.startsWith("theme.")).toBe(true);
      expect(theme.descKey.startsWith("theme.")).toBe(true);
    }
  });

  it("setiap tema punya minimal 24 kata (pool yang cukup untuk berlatih)", () => {
    for (const theme of allJapaneseThemes()) {
      expect(theme.words.length).toBeGreaterThanOrEqual(24);
    }
  });

  it("tidak ada id duplikat dalam satu tema", () => {
    for (const theme of allJapaneseThemes()) {
      const ids = theme.words.map((w) => w.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("setiap kata lengkap: term, reading, meaning, level, dan kalimat contoh", () => {
    for (const theme of allJapaneseThemes()) {
      for (const word of theme.words) {
        expect(word.term.length).toBeGreaterThan(0);
        expect(word.reading?.length ?? 0).toBeGreaterThan(0);
        expect(word.meaning.length).toBeGreaterThan(0);
        expect(word.level).toBeGreaterThanOrEqual(1);
        expect(word.level).toBeLessThanOrEqual(5);
        expect(word.example?.length ?? 0).toBeGreaterThan(0);
        expect(word.exampleReading?.length ?? 0).toBeGreaterThan(0);
        expect(word.exampleMeaning?.length ?? 0).toBeGreaterThan(0);
        expect(word.themes?.includes(theme.id)).toBe(true);
      }
    }
  });

  it("kata yang di-reuse dari kurikulum JLPT identik dengan data aslinya", () => {
    for (const theme of allJapaneseThemes()) {
      for (const word of theme.words) {
        if (!/^ja-n[1-5]-\d{3}$/.test(word.id)) continue;
        const original = ALL_DATA[word.id];
        expect(original, `${word.id} tidak ada di data JLPT`).toBeDefined();
        expect(word.term).toBe(original.term);
        expect(word.reading).toBe(original.reading);
        expect(word.meaning).toBe(original.meaning);
        expect(word.level).toBe(original.level);
      }
    }
  });

  it("tidak ada tabrakan id antara pack tematik dan data JLPT", () => {
    for (const theme of allJapaneseThemes()) {
      for (const word of theme.words) {
        if (word.id.startsWith("ja-theme-")) {
          expect(ALL_DATA[word.id]).toBeUndefined();
        }
      }
    }
  });

  it("getJapaneseTheme mengembalikan undefined untuk id tak dikenal", () => {
    expect(getJapaneseTheme("nope")).toBeUndefined();
    expect(getJapaneseTheme("travel")).toBeDefined();
  });
});
