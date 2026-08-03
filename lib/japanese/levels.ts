// Level JLPT (Japanese-Language Proficiency Test). Mirip CEFR: indeks 1..5 →
// N5, N4, N3, N2, N1 (N5 paling dasar). N5 = 1.
export const JLPT_LEVELS = [1, 2, 3, 4, 5] as const;

export function jlptLabel(index: number): string {
  return `N${6 - index}`;
}
