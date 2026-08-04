import { allEnglishThemes } from "../english/themes";
import { allHskThemes } from "../hsk/themes";
import { allJapaneseThemes } from "../japanese/themes";
import type { LanguageId } from "./types";
import type { ThemePack } from "../themes/types";

// Daftar pack tematik per bahasa + kode bahasa untuk text-to-speech
// (dipakai mode "Dengar" di theme-practice).
export interface ModuleThemes {
  packs: ThemePack[];
  speechLang: string;
}

const REGISTRY: Record<LanguageId, ModuleThemes> = {
  english: { packs: allEnglishThemes(), speechLang: "en-US" },
  hsk: { packs: allHskThemes(), speechLang: "zh-CN" },
  japanese: { packs: allJapaneseThemes(), speechLang: "ja-JP" },
};

export function getModuleThemes(
  languageId: string,
): ModuleThemes | undefined {
  return REGISTRY[languageId as LanguageId];
}
