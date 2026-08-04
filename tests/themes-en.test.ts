import { describe, expect, it } from "vitest";
import {
  allEnglishThemes,
  getEnglishTheme,
} from "../lib/english/themes";
import { a1Words } from "../lib/english/data/a1";
import { a2Words } from "../lib/english/data/a2";
import { b1Words } from "../lib/english/data/b1";
import { b2Words } from "../lib/english/data/b2";
import { c1Words } from "../lib/english/data/c1";
import { c2Words } from "../lib/english/data/c2";
import type { VocabItem } from "../lib/languages/types";

const ALL_DATA: Record<string, VocabItem> = Object.fromEntries(
  [...a1Words, ...a2Words, ...b1Words, ...b2Words, ...c1Words, ...c2Words].map(
    (w) => [w.id, w],
  ),
);

describe("paket tematik English", () => {
  it("mendefinisikan 4 tema (travel, office, food, daily)", () => {
    expect(allEnglishThemes().map((t) => t.id)).toEqual([
      "travel",
      "office",
      "food",
      "daily",
    ]);
    for (const theme of allEnglishThemes()) {
      expect(theme.titleKey.startsWith("theme.")).toBe(true);
      expect(theme.descKey.startsWith("theme.")).toBe(true);
    }
  });

  it("setiap tema punya minimal 24 kata (pool yang cukup untuk berlatih)", () => {
    for (const theme of allEnglishThemes()) {
      expect(theme.words.length).toBeGreaterThanOrEqual(24);
    }
  });

  it("tidak ada id duplikat dalam satu tema", () => {
    for (const theme of allEnglishThemes()) {
      const ids = theme.words.map((w) => w.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("setiap kata lengkap: term, meaning, level, dan kalimat contoh", () => {
    for (const theme of allEnglishThemes()) {
      for (const word of theme.words) {
        expect(word.term.length).toBeGreaterThan(0);
        expect(word.meaning.length).toBeGreaterThan(0);
        expect(word.level).toBeGreaterThanOrEqual(1);
        expect(word.level).toBeLessThanOrEqual(6);
        expect(word.example?.length ?? 0).toBeGreaterThan(0);
        expect(word.exampleMeaning?.length ?? 0).toBeGreaterThan(0);
        expect(word.themes?.includes(theme.id)).toBe(true);
      }
    }
  });

  it("kata yang di-reuse dari kurikulum English identik dengan data aslinya", () => {
    for (const theme of allEnglishThemes()) {
      for (const word of theme.words) {
        if (!/^en-[a-z]\d-\d{3}$/.test(word.id)) continue;
        const original = ALL_DATA[word.id];
        expect(original, `${word.id} tidak ada di data English`).toBeDefined();
        expect(word.term).toBe(original.term);
        expect(word.meaning).toBe(original.meaning);
        expect(word.level).toBe(original.level);
      }
    }
  });

  it("tidak ada tabrakan id antara pack tematik dan data English", () => {
    for (const theme of allEnglishThemes()) {
      for (const word of theme.words) {
        if (word.id.startsWith("en-theme-")) {
          expect(ALL_DATA[word.id]).toBeUndefined();
        }
      }
    }
  });

  it("getEnglishTheme mengembalikan undefined untuk id tak dikenal", () => {
    expect(getEnglishTheme("nope")).toBeUndefined();
    expect(getEnglishTheme("travel")).toBeDefined();
  });
});
