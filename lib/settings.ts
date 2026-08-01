export const SETTINGS_STORAGE_KEY = "levio.settings.v1";

export type ThemeMode = "light" | "dark" | "auto";

export const THEME_MODES: ThemeMode[] = ["light", "dark", "auto"];

export interface DailyTargets {
  vocab: number;
  reviews: number;
  xp: number;
}

export interface UserSettings {
  name: string;
  dailyTargets: DailyTargets;
  theme: ThemeMode;
}

export const DEFAULT_SETTINGS: UserSettings = {
  name: "",
  dailyTargets: { vocab: 10, reviews: 15, xp: 100 },
  theme: "auto",
};

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "auto";
}

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<UserSettings>;

    const name =
      typeof parsed.name === "string" ? parsed.name : DEFAULT_SETTINGS.name;
    const targets = parsed.dailyTargets ?? ({} as Partial<DailyTargets>);
    const clamp = (v: number) => Math.min(100, Math.max(1, v));
    const dailyTargets = {
      vocab: clamp(isNumber(targets.vocab) ? targets.vocab : DEFAULT_SETTINGS.dailyTargets.vocab),
      reviews: clamp(isNumber(targets.reviews) ? targets.reviews : DEFAULT_SETTINGS.dailyTargets.reviews),
      xp: clamp(isNumber(targets.xp) ? targets.xp : DEFAULT_SETTINGS.dailyTargets.xp),
    };
    const theme = isThemeMode(parsed.theme)
      ? parsed.theme
      : DEFAULT_SETTINGS.theme;

    return { name, dailyTargets, theme };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // penyimpanan tidak tersedia — abaikan.
  }
}
