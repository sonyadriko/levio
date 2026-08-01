import { hskWords } from "./data";
import type { HskLevel, VocabWord } from "./types";

export function getWordsByLevel(level: HskLevel): VocabWord[] {
  return hskWords.filter((w) => w.hsk === level);
}

export function countWordsByLevel(level: HskLevel): number {
  return getWordsByLevel(level).length;
}

export function getWordById(id: string): VocabWord | undefined {
  return hskWords.find((w) => w.id === id);
}

export function totalWordCount(): number {
  return hskWords.length;
}

export function getAllWords(): VocabWord[] {
  return hskWords;
}

export function searchWords(query: string): VocabWord[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return hskWords.filter(
    (w) =>
      w.hanzi.includes(q) ||
      w.pinyin.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q),
  );
}
