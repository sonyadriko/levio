"use client";

import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import { useCountUp } from "@/lib/use-count-up";
import { XP_PER_LEVEL } from "@/lib/progress";

export function HomeStats() {
  const { progress } = useProgress();
  const { t } = useLanguage();

  const xp = progress?.xp ?? 0;
  const streak = progress?.streak ?? 0;
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const levelXp = xp % XP_PER_LEVEL;
  const mastered = progress
    ? Object.values(progress.words).filter((w) => w.mastered).length
    : 0;
  const pct = Math.round((levelXp / XP_PER_LEVEL) * 100);
  const shownXp = useCountUp(xp, 800);
  const shownLevelXp = useCountUp(levelXp, 800);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
          <Icon name="flame" className="h-4 w-4 animate-flame" />
          {t("homeStats.streak", { n: streak })}
        </div>
        <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
          {shownXp} {t("common.xp")}
        </span>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-700 p-5 text-white shadow-lg shadow-teal-700/20">
        <div className="flex items-center justify-between text-sm text-teal-100">
          <span key={level} className="animate-pop">
            {t("common.level")} {level}
          </span>
          <span>
            {shownLevelXp} / {XP_PER_LEVEL} {t("common.xp")}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full rounded-full bg-white transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-medium">
          {t("homeStats.mastered", {
            n: mastered,
            xp: XP_PER_LEVEL - levelXp,
            next: level + 1,
          })}
        </p>
      </div>
    </section>
  );
}
