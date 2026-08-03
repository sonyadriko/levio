export type LanguageId = "hsk" | "english" | "japanese";

// Bentuk kanonik kosakata lintas modul bahasa. HSK memetakan hanzi→term,
// pinyin→reading; English langsung memakai term (kata) dan membaca reading
// opsional (IPA). Semua komponen generik hanya melihat tipe ini.
export interface VocabItem {
  id: string;
  term: string;
  reading?: string;
  meaning: string;
  level: number;
  example?: string;
  exampleReading?: string;
  exampleMeaning?: string;
}

// Tipe soal mock test generik:
// - "term-meaning":  tampilkan term, pilih arti   (hanzi→arti / kata→arti)
// - "meaning-term":  tampilkan arti, pilih term    (arti→hanzi / arti→kata)
// - "reading-term":  tampilkan pelafalan, pilih term (pinyin→hanzi)
// - "term-reading":  tampilkan term, pilih pelafalan (hanzi→pinyin)
export type QuestionType =
  | "term-meaning"
  | "meaning-term"
  | "reading-term"
  | "term-reading";

export interface LanguageLevelMeta {
  index: number;
  name: string;
  descriptionKey: string;
}

// Kontrak modul bahasa. Data kosakata dimuat per level secara lazy dan
// reaktif (cache + subscribe) sehingga komponen tidak perlu tahu dari mana
// kata berasal.
export interface LanguageModule {
  id: LanguageId;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  maxLevel: number;
  // Kemampuan modul yang menentukan komponen mana yang relevan. Modul CJK
  // (HSK) punya pelajaran + mengetik pinyin; English iterasi pertama hanya
  // flashcard + daftar kata + mock test.
  supportsTyping: boolean;
  supportsLesson: boolean;
  supportsSentences: boolean;
  questionTypes: QuestionType[];
  levelName: (index: number) => string;
  levelDescriptionKey: (index: number) => string;
  wordIdPrefix: (index: number) => string;
  levels: () => LanguageLevelMeta[];
  countWordsByLevel: (index: number) => number;
  totalWordCount: () => number;
  loadWords: (level: number) => Promise<VocabItem[]>;
  getWordsByLevel: (level: number) => VocabItem[];
  subscribeLevelWords: (subscriber: () => void) => () => void;
}
