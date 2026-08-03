"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { LanguageModule, VocabItem } from "./types";

// Muat kata per level secara lazy dan reaktif untuk modul bahasa apa pun.
// Saat level belum dimuat, mengembalikan [] (stabil); komponen memuatnya
// lewat `module.loadWords`.
export function useLevelWords(
  module: LanguageModule,
  level: number,
): VocabItem[] {
  useEffect(() => {
    void module.loadWords(level);
  }, [module, level]);

  return useSyncExternalStore(
    module.subscribeLevelWords,
    () => module.getWordsByLevel(level),
    () => module.getWordsByLevel(level),
  );
}
