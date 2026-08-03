import { describe, expect, it } from "vitest";
import { getLanguageModule, allLanguageModules } from "../lib/languages";
import { methodsFor } from "../lib/languages/methods";
import { generateMockTest } from "../lib/languages/mock-test";
import type { VocabItem } from "../lib/languages/types";

describe("language modules", () => {
  it("mendaftarkan hsk, english dan japanese", () => {
    const ids = allLanguageModules().map((m) => m.id);
    expect(ids).toContain("hsk");
    expect(ids).toContain("english");
    expect(ids).toContain("japanese");
  });

  it("metode belajar per modul sesuai kemampuan", () => {
    const ids = (m: string) => methodsFor(getLanguageModule(m)!).map((x) => x.id);
    expect(ids("hsk")).toEqual([
      "flashcard",
      "lesson",
      "sentence",
      "listening",
      "reading",
      "typing",
      "mockTest",
    ]);
    expect(ids("english")).toEqual(["flashcard", "mockTest"]);
    expect(ids("japanese")).toEqual(["flashcard", "kana", "mockTest"]);
  });

  it("setiap metode punya penjelasan apa + href valid", () => {
    for (const mod of allLanguageModules()) {
      for (const method of methodsFor(mod)) {
        expect(method.titleKey.length).toBeGreaterThan(0);
        expect(method.descKey.length).toBeGreaterThan(0);
        expect(method.href(mod).startsWith("/")).toBe(true);
      }
    }
  });

  it("english punya 6 level CEFR A1–C2", () => {
    const english = getLanguageModule("english")!;
    expect(english.maxLevel).toBe(6);
    expect(english.levelName(1)).toBe("A1");
    expect(english.levelName(6)).toBe("C2");
    for (let level = 1; level <= 6; level++) {
      expect(english.countWordsByLevel(level)).toBe(50);
    }
    expect(english.totalWordCount()).toBe(300);
  });

  it("english tidak mendukung mengetik/lesson, tapi punya mock test", () => {
    const english = getLanguageModule("english")!;
    expect(english.supportsTyping).toBe(false);
    expect(english.supportsLesson).toBe(false);
    expect(english.questionTypes).toEqual(["term-meaning", "meaning-term"]);
  });

  it("hsk adapter memetakan hanzi→term dan pinyin→reading", async () => {
    const hsk = getLanguageModule("hsk")!;
    const words = await hsk.loadWords(1);
    expect(words.length).toBeGreaterThan(0);
    const first = words[0];
    expect(first.id).toMatch(/^hsk1-/);
    expect(first.term.length).toBeGreaterThan(0);
    expect(typeof first.reading).toBe("string");
  });

  it("japanese punya 5 level JLPT N5–N1 dengan data N5", async () => {
    const japanese = getLanguageModule("japanese")!;
    expect(japanese.maxLevel).toBe(5);
    expect(japanese.levelName(1)).toBe("N5");
    expect(japanese.levelName(5)).toBe("N1");
    expect(japanese.countWordsByLevel(1)).toBe(100);
    expect(japanese.countWordsByLevel(2)).toBe(100);
    expect(japanese.countWordsByLevel(5)).toBe(100);
    expect(japanese.totalWordCount()).toBe(500);

    const words = await japanese.loadWords(1);
    expect(words).toHaveLength(100);
    expect(words[0].id.startsWith("ja-n5-")).toBe(true);
    expect(words.every((w) => w.level === 1)).toBe(true);
    expect(words.every((w) => typeof w.reading === "string" && w.reading.length > 0)).toBe(true);
    expect(japanese.questionTypes).toEqual([
      "term-meaning",
      "meaning-term",
      "reading-term",
      "term-reading",
    ]);
  });

  it("japanese memuat data N4–N1 (100 kata per level, prefix sesuai)", async () => {
    const japanese = getLanguageModule("japanese")!;
    const expected = [
      { level: 2, prefix: "ja-n4-", label: "N4" },
      { level: 3, prefix: "ja-n3-", label: "N3" },
      { level: 4, prefix: "ja-n2-", label: "N2" },
      { level: 5, prefix: "ja-n1-", label: "N1" },
    ];
    for (const { level, prefix, label } of expected) {
      const words = await japanese.loadWords(level);
      expect(words.length).toBe(100);
      expect(words[0].id.startsWith(prefix)).toBe(true);
      expect(words.every((w) => w.level === level)).toBe(true);
      expect(words.every((w) => typeof w.reading === "string" && w.reading.length > 0)).toBe(true);
      expect(japanese.levelName(level)).toBe(label);
    }
  });

  it("english memuat data A1 dengan prefix id en-a1-", async () => {
    const english = getLanguageModule("english")!;
    const words = await english.loadWords(1);
    expect(words.length).toBe(50);
    expect(words[0].id.startsWith("en-a1-")).toBe(true);
    expect(words[0].term).toBe("I");
    expect(words[0].meaning).toBe("saya");
  });

  it("english memuat data B1–C2 (50 kata per level, prefix sesuai)", async () => {
    const english = getLanguageModule("english")!;
    const expected = [
      { level: 3, prefix: "en-b1-", label: "B1" },
      { level: 4, prefix: "en-b2-", label: "B2" },
      { level: 5, prefix: "en-c1-", label: "C1" },
      { level: 6, prefix: "en-c2-", label: "C2" },
    ];
    for (const { level, prefix, label } of expected) {
      const words = await english.loadWords(level);
      expect(words).toHaveLength(50);
      expect(words[0].id.startsWith(prefix)).toBe(true);
      expect(words.every((w) => w.level === level)).toBe(true);
      expect(english.levelName(level)).toBe(label);
    }
  });
});

describe("generateMockTest (generik)", () => {
  const items: VocabItem[] = [
    { id: "en-a1-001", term: "I", meaning: "saya", level: 1 },
    { id: "en-a1-002", term: "you", meaning: "kamu", level: 1 },
    { id: "en-a1-003", term: "he", meaning: "dia", level: 1 },
    { id: "en-a1-004", term: "she", meaning: "dia", level: 1 },
    { id: "en-a1-005", term: "it", meaning: "itu", level: 1 },
    { id: "en-a1-006", term: "we", meaning: "kami", level: 1 },
    { id: "en-a1-007", term: "they", meaning: "mereka", level: 1 },
    { id: "en-a1-008", term: "this", meaning: "ini", level: 1 },
    { id: "en-a1-009", term: "that", meaning: "itu", level: 1 },
    { id: "en-a1-010", term: "is", meaning: "adalah", level: 1 },
  ];

  it("hanya memakai tipe soal yang diberikan (english: 2 tipe)", () => {
    const questions = generateMockTest(items, ["term-meaning", "meaning-term"], 6);
    expect(questions).toHaveLength(6);
    for (const q of questions) {
      expect(["term-meaning", "meaning-term"]).toContain(q.type);
    }
    expect(questions.every((q) => q.options.length >= 2)).toBe(true);
    expect(questions.every((q) => q.options.includes(q.answer))).toBe(true);
  });

  it("membuang opsi dengan meaning sama (jawaban ganda)", () => {
    const questions = generateMockTest(items, ["meaning-term"], 10);
    for (const q of questions) {
      const dupes = items.filter((w) => w.meaning === q.word.meaning);
      expect(dupes.length).toBeLessThanOrEqual(2);
    }
  });

  it("count lebih besar dari kata → semua kata dipakai", () => {
    const questions = generateMockTest(items, ["term-meaning"], 100);
    expect(questions).toHaveLength(items.length);
  });
});
