"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useLanguage } from "@/components/language-provider";
import {
  canNotify,
  DEFAULT_REMINDER,
  isValidTime,
  loadReminder,
  REMINDER_STORAGE_KEY,
  saveReminder,
  type ReminderSettings,
} from "@/lib/reminder";

type PermissionState = NotificationPermission | "unsupported";

// Store modul — pola sama dengan settings-provider: serverSnapshot dipakai saat
// SSR/hydration (aman dari mismatch), lalu setelah mount dibaca localStorage.
const listeners = new Set<() => void>();
const serverSnapshot: ReminderSettings = DEFAULT_REMINDER;
let clientSnapshot: ReminderSettings | null = null;

function getSnapshot(): ReminderSettings {
  if (clientSnapshot === null) {
    clientSnapshot = loadReminder();
  }
  return clientSnapshot;
}

function getServerSnapshot(): ReminderSettings {
  return serverSnapshot;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function setReminder(next: ReminderSettings): void {
  clientSnapshot = next;
  saveReminder(next);
  listeners.forEach((listener) => listener());
}

// Izin notifikasi dibaca dari Notification API (sistem eksternal).
const serverPermission: PermissionState = "unsupported";

function getPermissionSnapshot(): PermissionState {
  if (!canNotify()) return "unsupported";
  return Notification.permission;
}

function subscribePermission(callback: () => void): () => void {
  if (!canNotify()) return () => {};
  window.addEventListener("permissionchange", callback);
  return () => window.removeEventListener("permissionchange", callback);
}

export function ReminderCard() {
  const { t } = useLanguage();
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const permission = useSyncExternalStore(
    subscribePermission,
    getPermissionSnapshot,
    () => serverPermission,
  );

  const toggle = async () => {
    if (settings.enabled) {
      setReminder({ ...settings, enabled: false });
      return;
    }
    if (!canNotify()) return;
    if (Notification.permission === "default") {
      const result = await Notification.requestPermission();
      if (result !== "granted") return;
    }
    if (Notification.permission !== "granted") return;
    setReminder({ ...settings, enabled: true, lastSentKey: null });
  };

  const setTime = (time: string) => {
    if (!isValidTime(time)) return;
    setReminder({ ...settings, time });
  };

  // Sinkronkan saat tab lain mengubah pengaturan pengingat.
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== REMINDER_STORAGE_KEY) return;
      clientSnapshot = loadReminder();
      listeners.forEach((listener) => listener());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">{t("reminder.title")}</h2>
          <p className="mt-1 text-xs text-stone-400">{t("reminder.desc")}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={settings.enabled}
          aria-label={t("reminder.title")}
          onClick={() => void toggle()}
          disabled={permission === "denied" || permission === "unsupported"}
          className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            settings.enabled
              ? "bg-teal-600"
              : "bg-stone-200 dark:bg-stone-700"
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
              settings.enabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {settings.enabled && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900">
          <span className="text-sm font-medium">{t("reminder.time")}</span>
          <input
            type="time"
            value={settings.time}
            onChange={(e) => setTime(e.target.value)}
            className="h-9 rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none transition-colors focus:border-teal-400 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100"
          />
        </div>
      )}

      {permission === "denied" && (
        <p className="mt-3 text-xs text-red-500">{t("reminder.denied")}</p>
      )}
      {permission === "unsupported" && (
        <p className="mt-3 text-xs text-stone-400">{t("reminder.unsupported")}</p>
      )}
    </section>
  );
}
