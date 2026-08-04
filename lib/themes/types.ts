import type { VocabItem } from "../languages/types";

export type ThemeId = "travel" | "office" | "food" | "daily";

// Paket tematik (situasi) lintas bahasa. Kata-kata dikelompokkan per skenario
// nyata (perjalanan, kantor, makanan, sehari-hari) — lihat lib/japanese/themes.ts
// untuk catatan dasar riset (kluster tematik > semantik).
export interface ThemePack {
  id: ThemeId;
  titleKey: string;
  descKey: string;
  icon: string;
  words: VocabItem[];
}
