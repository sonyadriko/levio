import type { QuestionType, VocabItem } from "./types";

export interface MockQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  answer: string;
  word: VocabItem;
}

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
function poolValue(word: VocabItem, type: QuestionType): string {
  switch (type) {
    case "term-meaning":
      return word.meaning;
    case "meaning-term":
    case "reading-term":
      return word.term;
    case "term-reading":
      return word.reading ?? "";
  }
}

// Kata dianggap "sama jawabannya" bila berbagi nilai prompt (meaning/reading).
// Mis. 吧 & 吗 sama-sama "partikel tanya", 他 & 她 sama-sama "tā".
function promptKey(word: VocabItem, type: QuestionType): string {
  return type === "meaning-term" || type === "term-meaning"
    ? word.meaning
    : word.reading ?? "";
}

export function generateMockTest(
  words: VocabItem[],
  types: QuestionType[],
  count: number,
): MockQuestion[] {
  const selected = shuffle(words).slice(0, Math.min(count, words.length));

  return selected.map((word, i) => {
    const type = types[i % types.length];
    let prompt = "";
    let answer = "";

    switch (type) {
      case "term-meaning":
        prompt = word.term;
        answer = word.meaning;
        break;
      case "meaning-term":
        prompt = word.meaning;
        answer = word.term;
        break;
      case "reading-term":
        prompt = word.reading ?? "";
        answer = word.term;
        break;
      case "term-reading":
        prompt = word.term;
        answer = word.reading ?? "";
        break;
    }

    // Buang semua opsi yang dimiliki kata lain dengan meaning/reading yang
    // sama, agar tidak ada "jawaban benar ganda" atau soal yang identik.
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
