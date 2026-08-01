"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  SETTINGS_STORAGE_KEY,
  type DailyTargets,
  type ThemeMode,
  type UserSettings,
} from "@/lib/settings";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { pullProfile, pullSettings, pushSettings } from "@/lib/supabase/sync";

interface SettingsContextValue {
  settings: UserSettings;
  setName: (name: string) => void;
  setDailyTargets: (targets: Partial<DailyTargets>) => void;
  setTheme: (theme: ThemeMode) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const listeners = new Set<() => void>();
const serverSnapshot = DEFAULT_SETTINGS;
let clientSnapshot: UserSettings | null = null;

function getSnapshot(): UserSettings {
  if (clientSnapshot === null) {
    clientSnapshot = loadSettings();
  }
  return clientSnapshot;
}

function getServerSnapshot(): UserSettings {
  return serverSnapshot;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function setSettings(next: UserSettings): void {
  clientSnapshot = next;
  saveSettings(next);
  listeners.forEach((listener) => listener());
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pullDone = useRef(false);
  const [pullDoneCount, setPullDoneCount] = useState(0);

  const setName = useCallback((name: string) => {
    setSettings({ ...getSnapshot(), name });
  }, []);

  const setDailyTargets = useCallback((targets: Partial<DailyTargets>) => {
    const prev = getSnapshot();
    setSettings({ ...prev, dailyTargets: { ...prev.dailyTargets, ...targets } });
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    setSettings({ ...getSnapshot(), theme });
  }, []);

  const applyTheme = useCallback((theme: ThemeMode) => {
    const dark =
      theme === "dark" ||
      (theme === "auto" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    const resolved = dark ? "dark" : "light";
    document.documentElement.dataset.theme = resolved;
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", dark ? "#0c0a09" : "#faf9f7"));
  }, []);

  // Terapkan tema (resolusi "auto" dari sistem) dan ikuti perubahan sistem
  // selama mode "auto".
  useEffect(() => {
    const mode = settings.theme;
    applyTheme(mode);
    if (mode !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(mode);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings.theme, applyTheme]);

  // Refleksikan perubahan yang ditulis tab lain (event storage hanya menyala
  // di tab yang tidak melakukan penulisan).
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SETTINGS_STORAGE_KEY) return;
      clientSnapshot = loadSettings();
      listeners.forEach((listener) => listener());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Muat nama & target harian dari cloud saat login.
  // Push tidak dijalankan sampai pull pertama selesai, agar data cloud tidak
  // tertimpa pengaturan lokal yang stale saat jaringan lambat.
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    let cancelled = false;
    pullDone.current = false;
    const localAtStart = getSnapshot();

    (async () => {
      try {
        const profile = await pullProfile(client, userId);
        if (cancelled) return;
        if (!profile) {
          // User baru di cloud → push pengaturan lokal.
          await pushSettings(client, userId, getSnapshot());
        } else {
          const cloud = await pullSettings(client, userId);
          if (!cancelled) {
            // Jangan timpa perubahan lokal yang terjadi selama pull berjalan.
            if (cloud && getSnapshot() === localAtStart)
              setSettings({ ...cloud, theme: getSnapshot().theme });
            else if (!cloud) await pushSettings(client, userId, getSnapshot());
          }
        }
        if (!cancelled) {
          pullDone.current = true;
          setPullDoneCount((count) => count + 1);
        }
      } catch {
        // Pull gagal → push dimatikan agar settings lokal tidak menimpa cloud.
      }
    })();

    return () => {
      cancelled = true;
      pullDone.current = false;
    };
  }, [user?.id]);

  // Sinkronkan perubahan pengaturan ke cloud saat login (debounce).
  // `pullDoneCount` membuat efek ini berjalan ulang setelah pull selesai.
  useEffect(() => {
    const userId = user?.id;
    if (!userId || !pullDone.current) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;

    const timeout = window.setTimeout(() => {
      void pushSettings(client, userId, getSnapshot());
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [settings, user?.id, pullDoneCount]);

  return (
    <SettingsContext.Provider value={{ settings, setName, setDailyTargets, setTheme }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings harus dipakai di dalam <SettingsProvider>");
  }
  return ctx;
}
