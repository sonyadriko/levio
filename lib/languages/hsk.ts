import { countWordsByLevel, loadLevelWords, totalWordCount } from "@/lib/hsk";
import { allLevels } from "@/lib/hsk/levels";
import type { HskLevel, VocabWord } from "@/lib/hsk/types";
import { createLevelWordStore } from "./loader";
import type { LanguageModule, VocabItem } from "./types";

// Adapter HSK → kontrak generik. Data & store asli tetap di `lib/hsk`
// (dipakai komponen HSK-spesifik: lesson, sentence, listening, reading, dsb);
// di sini hanya dipetakan ke VocabItem agar komponen generik bisa memakainya.
function toItem(w: VocabWord): VocabItem {
  return {
    id: w.id,
    term: w.hanzi,
    reading: w.pinyin,
    meaning: w.meaning,
    level: w.hsk,
    example: w.example,
    exampleReading: w.examplePinyin,
    exampleMeaning: w.exampleMeaning,
  };
}

const loaders: Record<number, () => Promise<VocabItem[]>> = {};
for (const level of allLevels()) {
  loaders[level] = async () => (await loadLevelWords(level)).map(toItem);
}

const store = createLevelWordStore(loaders);

export const hskModule: LanguageModule = {
  id: "hsk",
  nameKey: "learn.moduleMandarin",
  descriptionKey: "learn.moduleHskDesc",
  icon: "汉",
  maxLevel: 6,
  supportsTyping: true,
  supportsLesson: true,
  supportsSentences: true,
  questionTypes: [
    "term-meaning",
    "meaning-term",
    "reading-term",
    "term-reading",
  ],
  levelName: (index) => `HSK ${index}`,
  levelDescriptionKey: (index) => `levelDesc.${index}`,
  wordIdPrefix: (index) => `hsk${index}-`,
  levels: () =>
    allLevels().map((index) => ({
      index,
      name: `HSK ${index}`,
      descriptionKey: `levelDesc.${index}`,
    })),
  countWordsByLevel: (index) => countWordsByLevel(index as HskLevel),
  totalWordCount,
  loadWords: store.loadWords,
  getWordsByLevel: store.getWordsByLevel,
  subscribeLevelWords: store.subscribe,
};
