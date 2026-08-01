import type { HskLevel, VocabWord } from "./types";
import { HSK_COUNTS, HSK_TOTAL } from "./data/counts";

// Data kosakata dimuat per level secara lazy (dynamic import). Modul `counts`
// tetap sinkron dan ringan, sehingga halaman yang hanya butuh jumlah kata
// (beranda, daftar level, statistik) tidak memuat array kosakata yang besar.

const EMPTY_WORDS: VocabWord[] = [];

const loaders: Record<HskLevel, () => Promise<VocabWord[]>> = {
  1: () => import("./data/hsk1").then((m) => m.hsk1Words),
  2: () => import("./data/hsk2").then((m) => m.hsk2Words),
  3: () => import("./data/hsk3").then((m) => m.hsk3Words),
  4: () => import("./data/hsk4").then((m) => m.hsk4Words),
  5: () => import("./data/hsk5").then((m) => m.hsk5Words),
  6: () => import("./data/hsk6").then((m) => m.hsk6Words),
};

const cache = new Map<HskLevel, VocabWord[]>();
const pending = new Map<HskLevel, Promise<VocabWord[]>>();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Memuat kata untuk satu level (idempoten, dibagikan antar pemanggil).
// Setelah selesai, subscriber (mis. `useLevelWords`) diberi tahu.
export function loadLevelWords(level: HskLevel): Promise<VocabWord[]> {
  const cached = cache.get(level);
  if (cached) return Promise.resolve(cached);
  let promise = pending.get(level);
  if (!promise) {
    promise = loaders[level]().then((words) => {
      cache.set(level, words);
      pending.delete(level);
      notify();
      return words;
    });
    pending.set(level, promise);
  }
  return promise;
}

// Kata level yang sudah dimuat (kosong jika belum). Mengembalikan referensi
// yang stabil agar bisa dipakai sebagai snapshot `useSyncExternalStore`.
export function getWordsByLevel(level: HskLevel): VocabWord[] {
  return cache.get(level) ?? EMPTY_WORDS;
}

export function subscribeLevelWords(subscriber: () => void): () => void {
  return subscribe(subscriber);
}

export function countWordsByLevel(level: HskLevel): number {
  return HSK_COUNTS[level] ?? 0;
}

export function totalWordCount(): number {
  return HSK_TOTAL;
}
