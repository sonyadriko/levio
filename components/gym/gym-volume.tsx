"use client";

import { useLanguage } from "@/components/language-provider";
import { weeklyVolume, type GymState } from "@/lib/gym";

export function GymVolume({ gym }: { gym: GymState }) {
  const { t } = useLanguage();
  const volumes = weeklyVolume(gym);
  const max = Math.max(...volumes.map((v) => v.volume), 1);
  const total = volumes.reduce((sum, v) => sum + v.volume, 0);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{t("gym.volume.title")}</h2>
        {total > 0 ? (
          <span className="text-xs tabular-nums text-stone-500 dark:text-stone-400">
            {t("gym.weekVolume")}: {total} kg
          </span>
        ) : null}
      </div>

      {volumes.length === 0 ? (
        <p className="text-xs text-stone-400">{t("gym.volume.empty")}</p>
      ) : (
        <div className="flex items-end gap-2">
          {volumes.map((item) => (
            <div
              key={item.muscleGroup}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
              title={`${t(`gym.muscle.${item.muscleGroup}`)}: ${item.volume} kg`}
            >
              <span className="text-[10px] tabular-nums text-stone-400">
                {item.volume > 0 ? item.volume : ""}
              </span>
              <div
                className="animate-bar-grow w-full origin-bottom rounded-t-md bg-teal-600 dark:bg-teal-500"
                style={{
                  height: `${Math.max((item.volume / max) * 56, 4)}px`,
                }}
              />
              <span className="truncate text-[10px] text-stone-500 dark:text-stone-400">
                {t(`gym.muscle.${item.muscleGroup}`)}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
