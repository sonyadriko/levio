"use client";

import { useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import { useSleep } from "@/components/sleep/use-sleep";
import { sleepDurationMinutes } from "@/lib/sleep";

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h <= 0) return `${m} m`;
  if (m === 0) return `${h} j`;
  return `${h} j ${m} m`;
}

export function SleepTracker() {
  const { t } = useLanguage();
  const { sleep, todayMin, log, setTarget } = useSleep();
  const [sleepTime, setSleepTime] = useState("23:00");
  const [wakeTime, setWakeTime] = useState("07:00");

  const pct = Math.min(
    100,
    Math.round((todayMin / Math.max(sleep.targetMin, 1)) * 100),
  );
  const done = todayMin >= sleep.targetMin && sleep.targetMin > 0;

  const handleLog = () => {
    const minutes = sleepDurationMinutes(sleepTime, wakeTime);
    if (minutes > 0) log(minutes);
  };

  const handleReset = () => {
    setSleepTime("23:00");
    setWakeTime("07:00");
  };

  return (
    <section
      id="sleep"
      className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
            <Icon name="sleep" className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-semibold">{t("sleep.title")}</h2>
        </div>
        {todayMin > 0 ? (
          <span className="text-sm tabular-nums text-stone-500 dark:text-stone-500">
            {formatDuration(todayMin)} / {formatDuration(sleep.targetMin)}
          </span>
        ) : null}
      </div>

      <div className="flex h-3 overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-900/40">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-500 ease-out dark:bg-indigo-400"
          style={{ width: `${pct}%` }}
        />
      </div>

      {done ? (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300">
          <Icon name="check" className="h-4 w-4" />
          {t("sleep.done")}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-stone-500 dark:text-stone-500">
              {t("sleep.toBed")}
            </span>
            <input
              type="time"
              value={sleepTime}
              onChange={(e) => setSleepTime(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm tabular-nums outline-none transition-colors focus:border-indigo-400 dark:border-stone-700 dark:bg-stone-900"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-stone-500 dark:text-stone-500">
              {t("sleep.wakeUp")}
            </span>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="rounded-lg border border-stone-300 px-3 py-2 text-sm tabular-nums outline-none transition-colors focus:border-indigo-400 dark:border-stone-700 dark:bg-stone-900"
            />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {done ? (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-900"
          >
            {t("sleep.reset")}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLog}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 active:scale-[0.98]"
          >
            <Icon name="sleep" className="h-3.5 w-3.5" />
            {t("sleep.log")}
          </button>
        )}
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label={t("sleep.targetLower")}
            onClick={() => setTarget(sleep.targetMin - 30)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-lg font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
          >
            −
          </button>
          <span className="min-w-14 text-center text-xs tabular-nums text-stone-500 dark:text-stone-500">
            {formatDuration(sleep.targetMin)}
          </span>
          <button
            type="button"
            aria-label={t("sleep.targetRaise")}
            onClick={() => setTarget(sleep.targetMin + 30)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 text-lg font-medium text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
}