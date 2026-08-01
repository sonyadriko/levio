"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";

const DISMISS_KEY = "levio.syncbanner.dismissed.v1";

const listeners = new Set<() => void>();
let dismissedCache: boolean | null = null;

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getDismissedSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  if (dismissedCache === null) {
    try {
      dismissedCache = window.localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      dismissedCache = false;
    }
  }
  return dismissedCache;
}

function getServerSnapshot(): boolean {
  return false;
}

export function SyncBanner() {
  const { user, ready, configured } = useAuth();
  const { t } = useLanguage();
  const dismissed = useSyncExternalStore(
    subscribe,
    getDismissedSnapshot,
    getServerSnapshot,
  );

  if (!configured || !ready || user || dismissed) return null;

  const dismiss = () => {
    dismissedCache = true;
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // penyimpanan tidak tersedia — abaikan.
    }
    listeners.forEach((listener) => listener());
  };

  return (
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-900 dark:bg-teal-600/10 dark:text-teal-300">
      <div className="flex min-w-0 items-center gap-2">
        <Icon name="check" className="h-4 w-4 shrink-0" />
        <p className="min-w-0">
          {t("auth.guestBanner")}{" "}
          <Link
            href="/profile"
            className="whitespace-nowrap font-semibold underline-offset-2 hover:underline"
          >
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("auth.guestBannerDismiss")}
        className="shrink-0 rounded-lg p-1.5 text-teal-600 transition-colors hover:bg-teal-100 dark:text-teal-600 dark:hover:bg-teal-600/20"
      >
        <Icon name="check" className="h-4 w-4 rotate-45" />
      </button>
    </div>
  );
}
