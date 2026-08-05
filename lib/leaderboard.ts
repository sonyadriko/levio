// Utilitas murni untuk papan peringkat mingguan — dapat dites tanpa jaringan.
export interface LeaderboardRow {
  rank: number;
  name: string;
  xp: number;
  is_me: boolean;
}

export type Medal = "gold" | "silver" | "bronze";

export function rankMedal(rank: number): Medal | null {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return null;
}

// Nama kosong (belum diisi di profil) → fallback terjemahan "Pemain".
export function leaderName(name: string, fallback: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}
