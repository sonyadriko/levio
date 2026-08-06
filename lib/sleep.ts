import { todayKey } from "./date";

export const SLEEP_STORAGE_KEY = "levio.sleep.v1";
export const DEFAULT_SLEEP_TARGET_MIN = 480;
export const SLEEP_STEP_MIN = 15;
export const SLEEP_XP_PER_GOAL = 5;

export interface SleepState {
  targetMin: number;
  // Tanggal (YYYY-MM-DD) → durasi tidur dalam menit yang dicatat hari itu.
  byDate: Record<string, number>;
  // Tanggal yang sudah mengklaim XP target tidur (sekali per hari).
  xpClaimedByDate: Record<string, true>;
}

export function emptySleep(): SleepState {
  return { targetMin: DEFAULT_SLEEP_TARGET_MIN, byDate: {}, xpClaimedByDate: {} };
}

function clampMin(value: unknown): number {
  return Math.max(0, Math.round(typeof value === "number" ? value : 0));
}

export function sanitizeSleep(data: unknown): SleepState {
  if (typeof data !== "object" || data === null) return emptySleep();
  const r = data as Record<string, unknown>;
  const targetMin =
    typeof r.targetMin === "number" && Number.isFinite(r.targetMin) && r.targetMin > 0
      ? Math.round(r.targetMin)
      : DEFAULT_SLEEP_TARGET_MIN;

  const byDate: Record<string, number> = {};
  const rawByDate = r.byDate;
  if (rawByDate && typeof rawByDate === "object" && !Array.isArray(rawByDate)) {
    for (const [key, value] of Object.entries(rawByDate)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) byDate[key] = clampMin(value);
    }
  }

  const xpClaimedByDate: Record<string, true> = {};
  const rawClaimed = r.xpClaimedByDate;
  if (
    rawClaimed &&
    typeof rawClaimed === "object" &&
    !Array.isArray(rawClaimed)
  ) {
    for (const key of Object.keys(rawClaimed)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) xpClaimedByDate[key] = true;
    }
  }

  return { targetMin, byDate, xpClaimedByDate };
}

export function loadSleep(): SleepState {
  if (typeof window === "undefined") return emptySleep();
  try {
    const raw = window.localStorage.getItem(SLEEP_STORAGE_KEY);
    if (!raw) return emptySleep();
    return sanitizeSleep(JSON.parse(raw));
  } catch {
    return emptySleep();
  }
}

export function saveSleep(state: SleepState): void {
  try {
    window.localStorage.setItem(SLEEP_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage penuh / tidak tersedia — abaikan.
  }
}

export function sleepForDate(state: SleepState, date: string): number {
  return state.byDate[date] ?? 0;
}

export function todaySleep(state: SleepState): number {
  return sleepForDate(state, todayKey());
}

export function isSleepTargetMet(state: SleepState, date: string): boolean {
  return state.targetMin > 0 && sleepForDate(state, date) >= state.targetMin;
}

export function setSleepTarget(state: SleepState, minutes: number): SleepState {
  return {
    ...state,
    targetMin: Math.max(SLEEP_STEP_MIN, Math.round(minutes)),
  };
}

// Catat durasi tidur (menit) untuk suatu tanggal (menggantikan nilai lama).
// Saat durasi mencapai target dan belum diklaim hari itu → beri XP.
export function logSleep(
  state: SleepState,
  minutes: number,
  date = todayKey(),
): { state: SleepState; xpAwarded: number } {
  const value = clampMin(minutes);
  const before = sleepForDate(state, date);
  const wasMet = before >= state.targetMin;
  const nowMet = state.targetMin > 0 && value >= state.targetMin;
  const claim = !wasMet && nowMet && !state.xpClaimedByDate[date];

  return {
    state: {
      ...state,
      byDate: { ...state.byDate, [date]: value },
      xpClaimedByDate: claim
        ? { ...state.xpClaimedByDate, [date]: true }
        : state.xpClaimedByDate,
    },
    xpAwarded: claim ? SLEEP_XP_PER_GOAL : 0,
  };
}

// Durasi tidur dalam menit dari dua waktu "HH:MM". Bila bangun lebih pagi
// dari tidur (melewati tengah malam), tambahkan 24 jam. Kembali 0 bila format
// invalid atau durasi tidak masuk akal (> 24 jam).
export function sleepDurationMinutes(sleepTime: string, wakeTime: string): number {
  const parse = (value: string): number | null => {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
    if (!match) return null;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h > 23 || m > 59) return null;
    return h * 60 + m;
  };
  const start = parse(sleepTime);
  const end = parse(wakeTime);
  if (start === null || end === null) return 0;
  const raw = end - start;
  const minutes = raw < 0 ? raw + 24 * 60 : raw;
  return minutes > 0 && minutes <= 24 * 60 ? minutes : 0;
}