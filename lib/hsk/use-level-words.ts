"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getWordsByLevel, loadLevelWords, subscribeLevelWords } from "@/lib/hsk";
import type { HskLevel, VocabWord } from "@/lib/hsk/types";

// Muat kata per level secara lazy dan reaktif. Saat level belum dimuat,
// mengembalikan [] (stabil); komponen memuatnya lewat `loadLevelWords`.
export function useLevelWords(level: HskLevel): VocabWord[] {
  useEffect(() => {
    void loadLevelWords(level);
  }, [level]);

  return useSyncExternalStore(
    subscribeLevelWords,
    () => getWordsByLevel(level),
    () => getWordsByLevel(level),
  );
}
