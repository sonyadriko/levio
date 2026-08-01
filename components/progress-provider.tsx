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
import type { VocabWord } from "@/lib/hsk/types";
import {
  applyLevelPass,
  applyReview,
  applyTest,
  applyXp,
  emptyProgress,
  loadProgress,
  PROGRESS_STORAGE_KEY,
  sanitizeProgress,
  saveProgress,
  type ProgressState,
} from "@/lib/progress";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  deleteAllData,
  hasCloudData,
  hasLocalData,
  pullProfile,
  pullProgress,
  pushProgress,
} from "@/lib/supabase/sync";

interface ProgressContextValue {
  progress: ProgressState;
  recordReview: (word: VocabWord, correct: boolean) => void;
  recordTest: (correct: number, total: number) => void;
  recordLevelPass: (level: number) => void;
  awardXp: (xp: number) => void;
  resetProgress: () => Promise<boolean>;
  importProgress: (data: unknown) => Promise<boolean>;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

const listeners = new Set<() => void>();
const serverSnapshot = emptyProgress();
let clientSnapshot: ProgressState | null = null;

function getSnapshot(): ProgressState {
  if (clientSnapshot === null) {
    clientSnapshot = loadProgress();
  }
  return clientSnapshot;
}

function getServerSnapshot(): ProgressState {
  return serverSnapshot;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function setProgress(next: ProgressState): void {
  clientSnapshot = next;
  saveProgress(next);
  listeners.forEach((listener) => listener());
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const pullDone = useRef(false);
  const [pullDoneCount, setPullDoneCount] = useState(0);

  const recordReview = useCallback((word: VocabWord, correct: boolean) => {
    setProgress(applyReview(getSnapshot(), word, correct));
  }, []);

  const recordTest = useCallback((correct: number, total: number) => {
    setProgress(applyTest(getSnapshot(), correct, total));
  }, []);

  const recordLevelPass = useCallback((level: number) => {
    setProgress(applyLevelPass(getSnapshot(), level));
  }, []);

  const awardXp = useCallback((xp: number) => {
    setProgress(applyXp(getSnapshot(), xp));
  }, []);

  const resetProgress = useCallback(async (): Promise<boolean> => {
    setProgress(emptyProgress());
    const userId = user?.id;
    if (!userId) return true;
    const client = getSupabaseBrowserClient();
    if (!client) return true;
    return deleteAllData(client, userId);
  }, [user?.id]);

  const importProgress = useCallback(
    async (data: unknown): Promise<boolean> => {
      const next = sanitizeProgress(data);
      if (!next) return false;
      setProgress(next);
      const userId = user?.id;
      if (!userId) return true;
      const client = getSupabaseBrowserClient();
      if (!client) return true;
      // Bersihkan baris cloud yang tidak ada di file import, lalu push ulang.
      const deleted = await deleteAllData(client, userId);
      void pushProgress(client, userId, next);
      return deleted;
    },
    [user?.id],
  );

  // Refleksikan perubahan yang ditulis tab lain (event storage hanya menyala
  // di tab yang tidak melakukan penulisan).
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== PROGRESS_STORAGE_KEY) return;
      clientSnapshot = loadProgress();
      listeners.forEach((listener) => listener());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Muat dari cloud saat login; migrasi data lokal kalau cloud masih kosong.
  // Push tidak dijalankan sampai pull pertama selesai, agar data cloud tidak
  // tertimpa snapshot lokal yang stale saat jaringan lambat.
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

        if (profile && hasCloudData(profile)) {
          const cloud = await pullProgress(client, userId);
          // Jangan timpa aktivitas lokal yang terjadi selama pull berjalan
          // (mis. review saat jaringan lambat) dengan snapshot cloud stale.
          if (!cancelled && cloud && getSnapshot() === localAtStart) {
            setProgress(cloud);
          }
        } else if (hasLocalData(getSnapshot())) {
          await pushProgress(client, userId, getSnapshot());
        }
        if (!cancelled) {
          pullDone.current = true;
          setPullDoneCount((count) => count + 1);
        }
      } catch {
        // Pull gagal (jaringan/RLS) → biarkan push dimatikan agar data lokal
        // yang stale tidak menimpa data cloud.
      }
    })();

    return () => {
      cancelled = true;
      pullDone.current = false;
    };
  }, [user?.id]);

  // Sinkronkan perubahan ke cloud saat login (debounce). `pullDoneCount`
  // membuat efek ini berjalan ulang begitu pull selesai, sehingga aktivitas
  // lokal yang terjadi selama pull tetap ikut ter-push.
  useEffect(() => {
    const userId = user?.id;
    if (!userId || !pullDone.current) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;

    const timeout = window.setTimeout(() => {
      void pushProgress(client, userId, getSnapshot());
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [progress, user?.id, pullDoneCount]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        recordReview,
        recordTest,
        recordLevelPass,
        awardXp,
        resetProgress,
        importProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress harus dipakai di dalam <ProgressProvider>");
  }
  return ctx;
}
