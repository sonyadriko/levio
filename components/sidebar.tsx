"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { Icon } from "@/components/icons";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { ProgressBar } from "@/components/progress-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { XP_PER_LEVEL } from "@/lib/progress";

export function Sidebar() {
  const pathname = usePathname();
  const { progress } = useProgress();
  const { t } = useLanguage();

  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;
  const levelXp = progress.xp % XP_PER_LEVEL;
  const pct = Math.round((levelXp / XP_PER_LEVEL) * 100);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-stone-200 bg-white px-4 py-6 dark:border-stone-800 dark:bg-stone-950 lg:flex">
      <Link href="/" className="mb-8 flex items-center gap-2 px-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 font-bold text-white">
          L
        </span>
        <span className="text-lg font-bold tracking-tight">Levio</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors active:scale-[0.98] ${
                isActive
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-600/10 dark:text-teal-600"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-500 dark:hover:bg-stone-900"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <ThemeToggle compact />
        <div className="rounded-lg bg-stone-50 p-3 text-xs text-stone-500 dark:bg-stone-900 dark:text-stone-500">
        <span key={level} className="inline-block animate-pop">
          {t("common.level")} {level} · {progress.xp} {t("common.xp")}
        </span>
        <div className="mt-2">
          <ProgressBar value={pct} />
        </div>
        </div>
      </div>
    </aside>
  );
}
