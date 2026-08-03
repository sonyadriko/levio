// Jumlah kata per level JLPT (ringan, bisa di-import sinkron tanpa memuat data).
// Level N4–N1 belum berisi data — placeholder 0 sampai kosakata ditambahkan.
export const JAPANESE_COUNTS: Record<number, number> = {
  1: 100, // N5
  2: 0, // N4
  3: 0, // N3
  4: 0, // N2
  5: 0, // N1
};

export const JAPANESE_TOTAL = 100;
