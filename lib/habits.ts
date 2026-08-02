import { dateKeyOf, todayKey } from "./date";
import type { GymState } from "./gym";
import type { ProgressState } from "./progress";

// Set tanggal "aktif": hari dengan aktivitas belajar ATAU sesi gym selesai.
// Dasar streak gabungan — satu hari dihitung aktif bila salah satu modul dijalankan.
export function activeDates(progress: ProgressState, gym: GymState): Set<string> {
  const active = new Set<string>();
  for (const date of Object.keys(progress.activityByDate)) {
    active.add(date);
  }
  for (const session of gym.sessions) {
    active.add(session.date);
  }
  return active;
}

// Status hari ini untuk pengingat: aktivitas belajar/gym mana yang sudah selesai.
export interface TodayStatus {
  studied: boolean;
  workedOut: boolean;
}

export function todayStatus(
  progress: ProgressState,
  gym: GymState,
): TodayStatus {
  const today = todayKey();
  const day = progress.activityByDate[today];
  return {
    studied: Boolean(day && (day.xp > 0 || day.reviews > 0 || day.tests > 0 || day.newWords > 0)),
    workedOut: gym.sessions.some((s) => s.date === today),
  };
}

// Streak gabungan: menghitung hari beruntun di mana user belajar ATAU gym.
// Sama logikanya dengan streak belajar (`updateStreak`): streak putus bila ada
// satu hari tanpa aktivitas sama sekali.
export function overallStreak(
  progress: ProgressState,
  gym: GymState,
): number {
  const active = activeDates(progress, gym);
  const today = todayKey();
  const cursor = new Date();
  if (!active.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (true) {
    const key = dateKeyOf(cursor);
    if (!active.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
