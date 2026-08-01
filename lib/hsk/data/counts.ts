import type { HskLevel } from "../types";

// Jumlah kata per level (tetap, ringan, bisa di-import sinkron tanpa memuat
// seluruh data kosakata). Sumber: daftar resmi HSK 2.0, dedup "satu kata =
// satu level".
export const HSK_COUNTS: Record<HskLevel, number> = {
  1: 150,
  2: 156,
  3: 287,
  4: 598,
  5: 1300,
  6: 2499,
};

export const HSK_TOTAL = 4990;
