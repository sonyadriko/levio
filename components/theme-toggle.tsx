"use client";

import { useState } from "react";
import { useSettings } from "@/components/settings-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import type { ThemeMode } from "@/lib/settings";

const THEME_OPTIONS: {
  theme: ThemeMode;
  labelKey: string;
  icon: "sun" | "moon" | "chart";
}[] = [
  { theme: "light", labelKey: "profile.themeLight", icon: "sun" },
  { theme: "dark", labelKey: "profile.themeDark", icon: "moon" },
  { theme: "auto", labelKey: "profile.themeAuto", icon: "chart" },
];

export function ThemeToggle({
  compact = false,
  onClose,
}: {
  compact?: boolean;
  onClose?: () => void;
}) {
  const { settings, setTheme } = useSettings();
  const { t } = useLanguage();

  return (
    <div
      className={
        compact
          ? "flex items-center justify-between gap-1"
          : "flex flex-col gap-2"
      }
    >
      {THEME_OPTIONS.map((option) => {
        const active = settings.theme === option.theme;
        return (
          <button
            key={option.theme}
            type="button"
            aria-label={t(option.labelKey)}
            title={t(option.labelKey)}
            onClick={() => {
              setTheme(option.theme);
              onClose?.();
            }}
            className={
              compact
                ? `flex h-8 flex-1 items-center justify-center rounded-lg transition-colors active:scale-95 ${
                    active
                      ? "bg-teal-700 text-white"
                      : "text-stone-500 hover:bg-stone-200 dark:text-stone-400 dark:hover:bg-stone-800"
                  }`
                : `flex h-9 items-center justify-between gap-2 rounded-lg px-4 text-sm font-medium transition-colors active:scale-[0.97] ${
                    active
                      ? "bg-teal-700 text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400"
                  }`
            }
          >
            <Icon name={option.icon} className="h-4 w-4" />
            {!compact && <span>{t(option.labelKey)}</span>}
          </button>
        );
      })}
    </div>
  );
}

export function MobileThemeToggle() {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const current =
    THEME_OPTIONS.find((option) => option.theme === settings.theme) ??
    THEME_OPTIONS[2];

  return (
    <div className="fixed bottom-20 right-4 z-50 lg:hidden">
      {open && (
        <>
          <button
            type="button"
            aria-label={t("word.close")}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-full right-0 mb-3 w-44 rounded-xl border border-stone-200 bg-white p-3 shadow-xl dark:border-stone-800 dark:bg-stone-950">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
              {t("profile.appearance")}
            </p>
            <ThemeToggle onClose={() => setOpen(false)} />
          </div>
        </>
      )}
      <button
        type="button"
        aria-label={t("profile.appearance")}
        title={t("profile.appearance")}
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-lg transition-transform active:scale-90 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
      >
        <Icon name={current.icon} className="h-5 w-5" />
      </button>
    </div>
  );
}
