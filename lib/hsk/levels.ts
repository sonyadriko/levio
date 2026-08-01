import type { HskLevel, HskLevelMeta } from "./types";

export const hskLevels: HskLevelMeta[] = [
  {
    level: 1,
    name: "HSK 1",
    description: "Pemula: kosakata & kalimat paling dasar (150 kata).",
  },
  {
    level: 2,
    name: "HSK 2",
    description: "Dasar: percakapan sehari-hari sederhana (300 kata).",
  },
  {
    level: 3,
    name: "HSK 3",
    description: "Menengah-bawah: topik kehidupan umum (600 kata).",
  },
  {
    level: 4,
    name: "HSK 4",
    description: "Menengah: topik luas, bahasa formal (1200 kata).",
  },
  {
    level: 5,
    name: "HSK 5",
    description: "Menengah-atas: membaca & menulis kompleks (2500 kata).",
  },
  {
    level: 6,
    name: "HSK 6",
    description: "Mahir: memahami & mengekspresikan bahasa baku (5000 kata).",
  },
];

export function getLevelMeta(level: HskLevel): HskLevelMeta {
  return hskLevels.find((l) => l.level === level)!;
}

export function allLevels(): HskLevel[] {
  return hskLevels.map((l) => l.level);
}
