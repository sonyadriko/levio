import type { HskLevel, VocabWord } from "./types";
import { getSentencesByLevel } from "./sentences";

export interface SentenceSource {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
}

export interface ChoiceQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
}

export interface OrderQuestion {
  id: string;
  chunks: string[];
  answer: string[];
  sentence: string;
  pinyin: string;
  meaning: string;
}

export interface ReadingQuestion {
  id: string;
  passage: SentenceSource[];
  options: string[];
  answer: string;
}

export function shuffle<T>(arr: T[]): T[] {
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

// Sumber kalimat gabungan: contoh kalimat dari kata + bank kalimat
// (lib/hsk/sentences.ts). Id unik per kalimat agar tidak dobel.
export function buildSentenceSource(
  words: VocabWord[],
  level: HskLevel,
): SentenceSource[] {
  const fromWords = words
    .filter((w) => w.example && w.examplePinyin && w.exampleMeaning)
    .map((w) => ({
      id: w.id,
      hanzi: w.example!,
      pinyin: w.examplePinyin!,
      meaning: w.exampleMeaning!,
    }));
  const fromBank = getSentencesByLevel(level).map((s) => ({
    id: s.id,
    hanzi: s.hanzi,
    pinyin: s.pinyin,
    meaning: s.meaning,
  }));
  const seen = new Set<string>();
  return [...fromWords, ...fromBank].filter((s) => {
    if (seen.has(s.hanzi)) return false;
    seen.add(s.hanzi);
    return true;
  });
}

// Pecah kalimat hanzi menjadi potongan kata (greedy longest-match terhadap
// kosakata level). Karakter di luar kosakata dijadikan potongan per karakter.
const PUNCTUATION = /[。！？，、；：,.!?;:]/g;

function segmentIntoWords(hanzi: string, vocab: string[]): string[] {
  const sorted = [...new Set(vocab)].sort((a, b) => b.length - a.length);
  const tokens: string[] = [];
  let i = 0;
  while (i < hanzi.length) {
    const ch = hanzi[i];
    if (PUNCTUATION.test(ch)) {
      i += 1;
      continue;
    }
    let matched: string | null = null;
    for (const word of sorted) {
      if (hanzi.startsWith(word, i)) {
        matched = word;
        break;
      }
    }
    if (matched) {
      tokens.push(matched);
      i += matched.length;
    } else {
      tokens.push(ch);
      i += 1;
    }
  }
  return tokens;
}

export function generateOrderQuestions(
  words: VocabWord[],
  level: HskLevel,
  count: number,
): OrderQuestion[] {
  const sources = buildSentenceSource(words, level);
  const vocab = words.map((w) => w.hanzi);
  const questions: OrderQuestion[] = [];

  for (const source of shuffle(sources)) {
    const chunks = segmentIntoWords(source.hanzi, vocab);
    if (chunks.length < 3) continue;
    let scrambled = shuffle(chunks);
    let guard = 0;
    while (scrambled.join("") === chunks.join("") && guard < 20) {
      scrambled = shuffle(chunks);
      guard += 1;
    }
    questions.push({
      id: source.id,
      chunks: scrambled,
      answer: chunks,
      sentence: source.hanzi,
      pinyin: source.pinyin,
      meaning: source.meaning,
    });
    if (questions.length >= count) break;
  }
  return questions;
}

export function generateListeningQuestions(
  words: VocabWord[],
  count: number,
): ChoiceQuestion[] {
  const pool = shuffle(words).slice(0, Math.min(count, words.length));
  return pool.map((word) => {
    const answer = word.meaning;
    const distractors = words.map((w) => w.meaning);
    return {
      id: `${word.id}-listen`,
      prompt: word.hanzi,
      options: buildOptions(distractors, answer),
      answer,
    };
  });
}

export function generateReadingQuestions(
  words: VocabWord[],
  level: HskLevel,
  count: number,
): ReadingQuestion[] {
  const sources = buildSentenceSource(words, level);
  const shuffled = shuffle(sources);
  const questions: ReadingQuestion[] = [];

  for (let i = 0; i < shuffled.length - 1 && questions.length < count; i += 2) {
    const a = shuffled[i];
    const b = shuffled[i + 1];
    const passage = [a, b];
    const answer = a.meaning;
    const distractors = sources
      .map((s) => s.meaning)
      .filter((m) => m !== answer && m !== b.meaning);
    questions.push({
      id: `${a.id}-${b.id}-read`,
      passage,
      options: buildOptions(distractors, answer),
      answer,
    });
  }
  return questions;
}
