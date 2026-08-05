/**
 * Generator latihan English (listening & grammar) yang bekerja di atas
 * VocabItem generik. Data `example`/`exampleMeaning` di modul English menjadi
 * bahan cloze grammar; term (kata) menjadi bahan listening.
 */

import type { VocabItem } from "../languages/types";

export interface EnglishListeningQuestion {
  id: string;
  prompt: string;
  options: string[];
  answer: string;
}

export interface EnglishGrammarQuestion {
  id: string;
  sentence: string;
  blanked: string;
  meaning: string;
  options: string[];
  answer: string;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Opsi: jawaban + hingga 3 pengganggu yang nilainya beda dari jawaban.
function buildOptions(pool: string[], answer: string): string[] {
  const unique = [...new Set(pool.filter((x) => x && x !== answer))];
  shuffle(unique);
  const distractors = unique.slice(0, 3);
  return shuffle([answer, ...distractors]);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Apakah `example` memuat `term` sebagai kata utuh (bukan bagian kata lain)?
function containsWord(example: string, term: string): boolean {
  return new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(example);
}

// Kosongkan kemunculan pertama `term` sebagai kata utuh di `example`.
function blankOut(example: string, term: string): string {
  return example.replace(new RegExp(`\\b${escapeRegExp(term)}\\b`, "i"), "_____");
}

// Dengar kata (term), pilih artinya — setara latihan listening HSK.
export function generateEnglishListeningQuestions(
  words: VocabItem[],
  count: number,
): EnglishListeningQuestion[] {
  const pool = shuffle(words).slice(0, Math.min(count, words.length));
  const meanings = words.map((w) => w.meaning);
  return pool.map((word) => ({
    id: `${word.id}-listen`,
    prompt: word.term,
    options: buildOptions(meanings, word.meaning),
    answer: word.meaning,
  }));
}

// Cloze grammar: kalimat contoh kata dikosongkan, pilih kata yang tepat.
export function generateEnglishGrammarQuestions(
  words: VocabItem[],
  count: number,
): EnglishGrammarQuestion[] {
  const usable = words.filter(
    (w) => w.example && containsWord(w.example, w.term),
  );
  const terms = words.map((w) => w.term);
  const pool = shuffle(usable);
  const questions: EnglishGrammarQuestion[] = [];

  for (let i = 0; i < pool.length && questions.length < count; i++) {
    const word = pool[i];
    const sentence = word.example!;
    questions.push({
      id: `${word.id}-grammar`,
      sentence,
      blanked: blankOut(sentence, word.term),
      meaning: word.exampleMeaning ?? word.meaning,
      options: buildOptions(terms, word.term),
      answer: word.term,
    });
  }
  return questions;
}
