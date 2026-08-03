import { JAPANESE_COUNTS, JAPANESE_TOTAL } from "../japanese/data/counts";
import { JLPT_LEVELS, jlptLabel } from "../japanese/levels";
import { createLevelWordStore } from "./loader";
import type { LanguageModule, VocabItem } from "./types";

// Data Jepang disimpan sebagai VocabItem langsung (term = kanji/kana,
// reading = hiragana). Level N4–N1 menyusul.
const loaders: Record<number, () => Promise<VocabItem[]>> = {
  1: () => import("../japanese/data/n5").then((m) => m.n5Words),
  2: () => Promise.resolve([]),
  3: () => Promise.resolve([]),
  4: () => Promise.resolve([]),
  5: () => Promise.resolve([]),
};

const store = createLevelWordStore(loaders);

export const japaneseModule: LanguageModule = {
  id: "japanese",
  nameKey: "learn.moduleJapanese",
  descriptionKey: "learn.moduleJapaneseDesc",
  icon: "あ",
  maxLevel: 5,
  // Iterasi pertama: hanya flashcard, daftar kata, dan mock test.
  // Latihan bertuliskan & mengetik menyusul.
  supportsTyping: false,
  supportsLesson: false,
  supportsSentences: false,
  // Reading (hiragana) tersedia → semua tipe soal generik dipakai.
  questionTypes: [
    "term-meaning",
    "meaning-term",
    "reading-term",
    "term-reading",
  ],
  levelName: (index) => jlptLabel(index),
  levelDescriptionKey: (index) => `levelDesc.ja.${index}`,
  wordIdPrefix: (index) => `ja-n${6 - index}-`,
  levels: () =>
    JLPT_LEVELS.map((index) => ({
      index,
      name: jlptLabel(index),
      descriptionKey: `levelDesc.ja.${index}`,
    })),
  countWordsByLevel: (index) => JAPANESE_COUNTS[index] ?? 0,
  totalWordCount: () => JAPANESE_TOTAL,
  loadWords: store.loadWords,
  getWordsByLevel: store.getWordsByLevel,
  subscribeLevelWords: store.subscribe,
};
