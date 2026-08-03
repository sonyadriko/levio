import type { VocabItem } from "./types";

// Store kosakata per-level yang lazy & reaktif, dibagikan antar modul bahasa.
// Idempoten (satu loader per level, hasil di-cache) dan memberi tahu subscriber
// (via `useLevelWords`) begitu level selesai dimuat.

const EMPTY_WORDS: VocabItem[] = [];

export interface LevelWordStore {
  loadWords: (level: number) => Promise<VocabItem[]>;
  getWordsByLevel: (level: number) => VocabItem[];
  subscribe: (subscriber: () => void) => () => void;
}

export function createLevelWordStore(
  loaders: Record<number, () => Promise<VocabItem[]>>,
): LevelWordStore {
  const cache = new Map<number, VocabItem[]>();
  const pending = new Map<number, Promise<VocabItem[]>>();
  const listeners = new Set<() => void>();

  function notify(): void {
    listeners.forEach((listener) => listener());
  }

  function loadWords(level: number): Promise<VocabItem[]> {
    const cached = cache.get(level);
    if (cached) return Promise.resolve(cached);
    let promise = pending.get(level);
    if (!promise) {
      const loader = loaders[level];
      promise = (loader ? loader() : Promise.resolve([])).then((words) => {
        cache.set(level, words);
        pending.delete(level);
        notify();
        return words;
      });
      pending.set(level, promise);
    }
    return promise;
  }

  // Kata level yang sudah dimuat (referensi stabil; kosong jika belum).
  function getWordsByLevel(level: number): VocabItem[] {
    return cache.get(level) ?? EMPTY_WORDS;
  }

  function subscribe(subscriber: () => void): () => void {
    listeners.add(subscriber);
    return () => {
      listeners.delete(subscriber);
    };
  }

  return { loadWords, getWordsByLevel, subscribe };
}
