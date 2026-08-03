import { JAPANESE_COUNTS, JAPANESE_TOTAL } from "../japanese/data/counts";
import { JLPT_LEVELS, jlptLabel } from "../japanese/levels";
import { createLevelWordStore } from "./loader";
import type { LanguageModule, VocabItem } from "./types";

// Data Jepang disimpan sebagai VocabItem langsung (term = kanji/kana,
// reading = hiragana). Level N4–N1 menyusul.
const loaders: Record<number, () => Promise<VocabItem[]>> = {
  1: () => import("../japanese/data/n5").then((m) => m.n5Words),
  2: () => import("../japanese/data/n4").then((m) => m.n4Words),
  3: () => import("../japanese/data/n3").then((m) => m.n3Words),
  4: () => import("../japanese/data/n2").then((m) => m.n2Words),
  5: () => import("../japanese/data/n1").then((m) => m.n1Words),
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
  script: {
    path: "/learn/japanese/kana",
    titleKey: "kana.title",
    descKey: "kana.desc",
    icon: "あ",
  },
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
