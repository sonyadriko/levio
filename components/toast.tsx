"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastVariant = "default" | "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  leaving: boolean;
}

interface ToastOptions {
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLE: Record<ToastVariant, string> = {
  default:
    "border-stone-200 bg-white text-stone-700 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-200",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-600/15 dark:text-emerald-400",
  error:
    "border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-600/15 dark:text-red-400",
};

// Toast berbasis spring (overshoot, lihat docs/motion.md). Maksimal 3 tampil
// sekaligus; tap untuk menutup, auto-hide setelah durasi.
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, leaving: true } : it)),
    );
    window.setTimeout(() => {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }, 200);
  }, []);

  const toast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = ++idRef.current;
      const item: ToastItem = {
        id,
        message,
        variant: options?.variant ?? "default",
        leaving: false,
      };
      setItems((prev) => [...prev.slice(-2), item]);
      window.setTimeout(
        () => dismiss(id),
        options?.duration ?? 2600,
      );
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => dismiss(item.id)}
            className={`pointer-events-auto flex w-full max-w-sm cursor-pointer items-center rounded-xl border px-4 py-3 text-left text-sm font-medium shadow-lg shadow-stone-900/10 ${
              VARIANT_STYLE[item.variant]
            } ${item.leaving ? "animate-toast-out" : "animate-toast-in"}`}
          >
            {item.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast harus dipakai di dalam <ToastProvider>");
  return ctx;
}
