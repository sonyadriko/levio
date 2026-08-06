"use client";

import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import { useWater } from "@/components/water/use-water";
import { WATER_TARGET_STEP_ML } from "@/lib/water";

export function WaterTracker() {
  const { t } = useLanguage();
  const { water, todayMl, drink, setTarget } = useWater();

  const pct = Math.min(
    100,
    Math.round((todayMl / Math.max(water.targetMl, 1)) * 100),
  );
  const done = todayMl >= water.targetMl && water.targetMl > 0;

  return (
    <section
      id="water"
      className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
            <Icon name="water" className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-semibold">{t("water.title")}</h2>
        </div>
        <span className="text-sm tabular-nums text-stone-500 dark:text-stone-500">
          {t("water.today", { current: todayMl, target: water.targetMl })}
        </span>
      </div>

      <div className="flex h-3 overflow-hidden rounded-full bg-sky-100 dark:bg-sky-900/40">
        <div
          className="h-full rounded-full bg-sky-500 transition-all duration-500 ease-out dark:bg-sky-400"
          style={{ width: `${pct}%` }}
        />
      </div>

      {done ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-sky-700 dark:text-sky-300">
          <Icon name="check" className="h-4 w-4" />
          {t("water.done")}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {[WATER_TARGET_STEP_ML, WATER_TARGET_STEP_ML * 2].map((ml) => (
          <button
            key={ml}
            type="button"
            onClick={() => drink(ml)}
            className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700 active:scale-[0.98]"
          >
            <Icon name="water" className="h-3.5 w-3.5" />
            +{ml}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label={t("water.targetLower")}
            onClick={() => setTarget(water.targetMl - WATER_TARGET_STEP_ML)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-lg font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
          >
            −
          </button>
          <span className="min-w-12 text-center text-xs tabular-nums text-stone-500 dark:text-stone-500">
            {water.targetMl} ml
          </span>
          <button
            type="button"
            aria-label={t("water.targetRaise")}
            onClick={() => setTarget(water.targetMl + WATER_TARGET_STEP_ML)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-lg font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}