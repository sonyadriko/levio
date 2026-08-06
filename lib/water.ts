import { todayKey } from "./date";

export const WATER_STORAGE_KEY = "levio.water.v1";
export const DEFAULT_WATER_TARGET_ML = 2000;
export const WATER_TARGET_STEP_ML = 250;
export const WATER_XP_PER_GOAL = 5;

export interface WaterState {
  targetMl: number;
  // Tanggal (YYYY-MM-DD) → ml yang telah diminum hari itu.
  byDate: Record<string, number>;
  // Tanggal yang sudah mengklaim XP target harian (agar tidak di-trigger ulang).
  xpClaimedByDate: Record<string, true>;
}

export function emptyWater(): WaterState {
  return { targetMl: DEFAULT_WATER_TARGET_ML, byDate: {}, xpClaimedByDate: {} };
}

function clampMl(value: unknown): number {
  return Math.max(0, Math.round(typeof value === "number" ? value : 0));
}

export function sanitizeWater(data: unknown): WaterState {
  if (typeof data !== "object" || data === null) return emptyWater();
  const r = data as Record<string, unknown>;
  const targetMl =
    typeof r.targetMl === "number" && Number.isFinite(r.targetMl) && r.targetMl > 0
      ? Math.round(r.targetMl)
      : DEFAULT_WATER_TARGET_ML;

  const byDate: Record<string, number> = {};
  const rawByDate = r.byDate;
  if (rawByDate && typeof rawByDate === "object" && !Array.isArray(rawByDate)) {
    for (const [key, value] of Object.entries(rawByDate)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(key)) byDate[key] = clampMl(value);
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

  return { targetMl, byDate, xpClaimedByDate };
}

export function loadWater(): WaterState {
  if (typeof window === "undefined") return emptyWater();
  try {
    const raw = window.localStorage.getItem(WATER_STORAGE_KEY);
    if (!raw) return emptyWater();
    return sanitizeWater(JSON.parse(raw));
  } catch {
    return emptyWater();
  }
}

export function saveWater(state: WaterState): void {
  try {
    window.localStorage.setItem(WATER_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage penuh / tidak tersedia — abaikan.
  }
}

export function waterForDate(state: WaterState, date: string): number {
  return state.byDate[date] ?? 0;
}

export function todayWater(state: WaterState): number {
  return waterForDate(state, todayKey());
}

export function isWaterTargetMet(state: WaterState, date: string): boolean {
  return state.targetMl > 0 && waterForDate(state, date) >= state.targetMl;
}

export function setWaterTarget(state: WaterState, ml: number): WaterState {
  return {
    ...state,
    targetMl: Math.max(WATER_TARGET_STEP_ML, Math.round(ml)),
  };
}

// Tambah asupan air untuk hari ini. Bila setelah penambahan target harian
// tercapai (belum pernah diklaim hari itu) → beri XP.
export function drinkWater(
  state: WaterState,
  ml: number,
): { state: WaterState; xpAwarded: number } {
  const date = todayKey();
  const before = waterForDate(state, date);
  const after = before + clampMl(ml);
  const wasMet = before >= state.targetMl;
  const nowMet = state.targetMl > 0 && after >= state.targetMl;
  const claim = !wasMet && nowMet && !state.xpClaimedByDate[date];

  return {
    state: {
      ...state,
      byDate: { ...state.byDate, [date]: after },
      xpClaimedByDate: claim
        ? { ...state.xpClaimedByDate, [date]: true }
        : state.xpClaimedByDate,
    },
    xpAwarded: claim ? WATER_XP_PER_GOAL : 0,
  };
}