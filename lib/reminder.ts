export const REMINDER_STORAGE_KEY = "levio.reminder.v1";

export interface ReminderSettings {
  enabled: boolean;
  time: string; // "HH:MM"
  lastSentKey: string | null;
}

export const DEFAULT_REMINDER: ReminderSettings = {
  enabled: false,
  time: "19:00",
  lastSentKey: null,
};

// Validasi format dan rentang "HH:MM" (jam 00-23, menit 00-59).
export function isValidTime(time: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [h, m] = time.split(":").map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

export function loadReminder(): ReminderSettings {
  if (typeof window === "undefined") return DEFAULT_REMINDER;
  try {
    const raw = window.localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!raw) return DEFAULT_REMINDER;
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    return {
      enabled: parsed.enabled === true,
      time: isValidTime(parsed.time ?? "")
        ? (parsed.time as string)
        : DEFAULT_REMINDER.time,
      lastSentKey:
        typeof parsed.lastSentKey === "string" ? parsed.lastSentKey : null,
    };
  } catch {
    return DEFAULT_REMINDER;
  }
}

export function saveReminder(settings: ReminderSettings): void {
  try {
    window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // penyimpanan tidak tersedia — abaikan.
  }
}

// Dukungan Notification API di browser ini.
export function canNotify(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

// Sudah lewat jam pengingat (HH:MM) atau belum.
export function isPastTime(time: string): boolean {
  const now = new Date();
  const [h, m] = time.split(":").map(Number);
  return now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
}
