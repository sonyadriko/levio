import type { LanguageModule } from "./types";
import { hskModule } from "./hsk";
import { englishModule } from "./english";
import { japaneseModule } from "./japanese";

export const LANGUAGE_MODULES: Record<string, LanguageModule> = {
  hsk: hskModule,
  english: englishModule,
  japanese: japaneseModule,
};

export const DEFAULT_MODULE_ID = "hsk";

export function getLanguageModule(id: string | null | undefined): LanguageModule | null {
  if (!id) return null;
  return LANGUAGE_MODULES[id] ?? null;
}

export function allLanguageModules(): LanguageModule[] {
  return Object.values(LANGUAGE_MODULES);
}

export function defaultModule(): LanguageModule {
  return LANGUAGE_MODULES[DEFAULT_MODULE_ID];
}
