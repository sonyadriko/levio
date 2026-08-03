// Level CEFR English. Simetris dengan HSK 1–6: indeks 1..6 → A1, A2, B1, B2, C1, C2.

export const CEFR_LABELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;

export function cefrLabel(index: number): string {
  return CEFR_LABELS[index - 1] ?? `L${index}`;
}
