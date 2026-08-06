"use client";

import { useLanguage } from "@/components/language-provider";
import {
  MUSCLE_GROUPS,
  weeklyVolumeTrend,
  type GymState,
  type MuscleGroup,
} from "@/lib/gym";

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  chest: "bg-teal-500 dark:bg-teal-400",
  back: "bg-sky-500 dark:bg-sky-400",
  shoulders: "bg-amber-500 dark:bg-amber-400",
  arms: "bg-rose-500 dark:bg-rose-400",
  legs: "bg-emerald-500 dark:bg-emerald-400",
  core: "bg-violet-500 dark:bg-violet-400",
};

function weekLabel(weekKey: string): string {
  const [, month, day] = weekKey.split("-").map(Number);
  return `${day}/${month}`;
}

export function GymVolumeTrend({
  gym,
  weeks = 8,
}: {
  gym: GymState;
  weeks?: number;
}) {
  const { t } = useLanguage();
  const trend = weeklyVolumeTrend(gym, weeks);
  const max = Math.max(...trend.map((w) => w.total), 1);

  const activeMuscles = MUSCLE_GROUPS.filter((group) =>
    trend.some((w) => (w.muscles[group] ?? 0) > 0),
  );
  const hasData = activeMuscles.length > 0;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">{t("gym.volumeTrend.title")}</h2>
        <p className="text-xs text-stone-500 dark:text-stone-500">
          {t("gym.volumeTrend.hint")}
        </p>
      </div>

      {!hasData ? (
        <p className="text-xs text-stone-500">{t("gym.volumeTrend.empty")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex h-36 items-end gap-1.5">
            {trend.map((week) => (
              <div
                key={week.weekKey}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
              >
                <div className="flex h-32 w-full flex-col justify-end gap-px">
                  {MUSCLE_GROUPS.filter((g) => (week.muscles[g] ?? 0) > 0).map(
                    (g) => (
                      <div
                        key={g}
                        className={`w-full rounded-t-[1px] ${MUSCLE_COLORS[g]}`}
                        style={{
                          height: `${((week.muscles[g] ?? 0) / max) * 100}%`,
                        }}
                        title={`${t(`gym.muscle.${g}`)}: ${week.muscles[g] ?? 0} kg`}
                      />
                    ),
                  )}
                </div>
                <span className="text-[10px] tabular-nums text-stone-500 dark:text-stone-500">
                  {weekLabel(week.weekKey)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {activeMuscles.map((g) => (
              <span
                key={g}
                className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-500"
              >
                <span className={`h-2.5 w-2.5 rounded-sm ${MUSCLE_COLORS[g]}`} />
                {t(`gym.muscle.${g}`)}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}