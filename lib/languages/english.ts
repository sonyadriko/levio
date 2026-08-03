import { ENGLISH_COUNTS, ENGLISH_TOTAL } from "../english/data/counts";
import { CEFR_LABELS, cefrLabel } from "../english/levels";
import { createLevelWordStore } from "./loader";
import type { LanguageModule, VocabItem } from "./types";

// Data English disimpan sebagai VocabItem langsung (term = kata, reading opsional).
const loaders: Record<number, () => Promise<VocabItem[]>> = {
  1: () => import("../english/data/a1").then((m) => m.a1Words),
  2: () => import("../english/data/a2").then((m) => m.a2Words),
  3: () => Promise.resolve([]),
  4: () => Promise.resolve([]),
  5: () => Promise.resolve([]),
  6: () => Promise.resolve([]),
};

const store = createLevelWordStore(loaders);

export const englishModule: LanguageModule = {
  id: "english",
  nameKey: "learn.moduleEnglish",
  descriptionKey: "learn.moduleEnglishDesc",
  icon: "A",
  maxLevel: 6,
  // Iterasi pertama: hanya flashcard, daftar kata, dan mock test.
  // Latihan bertuliskan (pelajaran, kalimat) menyusul.
  supportsTyping: false,
  supportsLesson: false,
  supportsSentences: false,
  questionTypes: ["term-meaning", "meaning-term"],
  levelName: (index) => cefrLabel(index),
  levelDescriptionKey: (index) => `levelDesc.en.${index}`,
  wordIdPrefix: (index) => `en-${cefrLabel(index).toLowerCase()}-`,
  levels: () =>
    CEFR_LABELS.map((label, i) => {
      const index = i + 1;
      return {
        index,
        name: label,
        descriptionKey: `levelDesc.en.${index}`,
      };
    }),
  countWordsByLevel: (level) => ENGLISH_COUNTS[level] ?? 0,
  totalWordCount: () => ENGLISH_TOTAL,
  loadWords: store.loadWords,
  getWordsByLevel: store.getWordsByLevel,
  subscribeLevelWords: store.subscribe,
};
