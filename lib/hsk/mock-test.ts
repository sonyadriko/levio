import type { VocabWord } from "./types";

export type QuestionType =
  | "hanzi-meaning"
  | "meaning-hanzi"
  | "pinyin-hanzi"
  | "hanzi-pinyin";

export interface MockQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  answer: string;
  word: VocabWord;
}

export const QUESTION_TYPES: QuestionType[] = [
  "hanzi-meaning",
  "meaning-hanzi",
  "pinyin-hanzi",
  "hanzi-pinyin",
];

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildOptions(pool: string[], answer: string): string[] {
  const unique = [...new Set(pool.filter((x) => x && x !== answer))];
  shuffle(unique);
  const distractors = unique.slice(0, 3);
  return shuffle([answer, ...distractors]);
}

// Nilai kata untuk tiap tipe soal: jawaban (atau prompt) yang dipakai di opsi.
function poolValue(word: VocabWord, type: QuestionType): string {
  switch (type) {
    case "hanzi-meaning":
      return word.meaning;
    case "meaning-hanzi":
    case "pinyin-hanzi":
      return word.hanzi;
    case "hanzi-pinyin":
      return word.pinyin;
  }
}

// Kata dianggap "sama jawabannya" bila berbagi nilai prompt (meaning/pinyin).
// Misal 吧 & 吗 sama-sama "partikel tanya", 他 & 她 sama-sama "tā".
function promptKey(word: VocabWord, type: QuestionType): string {
  return type === "meaning-hanzi" || type === "hanzi-meaning"
    ? word.meaning
    : word.pinyin;
}

export function generateMockTest(
  words: VocabWord[],
  count: number,
): MockQuestion[] {
  const selected = shuffle(words).slice(0, Math.min(count, words.length));

  return selected.map((word, i) => {
    const type = QUESTION_TYPES[i % QUESTION_TYPES.length];
    let prompt = "";
    let answer = "";

    switch (type) {
      case "hanzi-meaning":
        prompt = word.hanzi;
        answer = word.meaning;
        break;
      case "meaning-hanzi":
        prompt = word.meaning;
        answer = word.hanzi;
        break;
      case "pinyin-hanzi":
        prompt = word.pinyin;
        answer = word.hanzi;
        break;
      case "hanzi-pinyin":
        prompt = word.hanzi;
        answer = word.pinyin;
        break;
    }

    // Buang semua opsi yang dimiliki kata lain dengan meaning/pinyin yang sama,
    // agar tidak ada "jawaban benar ganda" atau soal yang identik.
    const excluded = new Set(
      words
        .filter((w) => promptKey(w, type) === promptKey(word, type))
        .map((w) => poolValue(w, type)),
    );
    const pool = words
      .map((w) => poolValue(w, type))
      .filter((value) => !excluded.has(value));

    return {
      id: `${word.id}-${type}`,
      type,
      prompt,
      options: buildOptions(pool, answer),
      answer,
      word,
    };
  });
}
