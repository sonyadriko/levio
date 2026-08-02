"use client";

import { use, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { useLanguage } from "@/components/language-provider";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { useGym } from "@/components/gym/use-gym";
import { LineChart } from "@/components/gym/exercise-chart";
import {
  exerciseProgressPoints,
  type ExerciseProgressPoint,
} from "@/lib/gym";
import { getExerciseDef } from "@/lib/gym-exercises";
import { cn } from "@/lib/utils";

type MetricKey = "1rm" | "weight" | "volume";

function shortDate(date: string): string {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}

function formatKg(value: number): string {
  return `${Math.round(value * 10) / 10} kg`;
}

export default function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useLanguage();
  const { gym } = useGym();
  const [metric, setMetric] = useState<MetricKey>("1rm");

  const def = getExerciseDef(id);
  const progress: ExerciseProgressPoint[] = useMemo(
    () => exerciseProgressPoints(gym, id),
    [gym, id],
  );

  if (!def) notFound();

  const totalSets = progress.reduce((sum, p) => sum + p.sets, 0);
  const totalVolume = progress.reduce((sum, p) => sum + p.volume, 0);
  const best1RM = progress.reduce((best, p) => Math.max(best, p.est1RM), 0);
  const bestDate = progress.find((p) => p.est1RM === best1RM)?.date;

  const chartData = progress.map((p) => ({
    label: shortDate(p.date),
    value: metric === "1rm" ? p.est1RM : metric === "weight" ? p.topWeight : p.volume,
  }));

  const metricLabel = (key: MetricKey): string => t(`gym.progress.metric.${key}`);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackLink href="/gym/exercises" labelKey="gym.exercises.back" />
        <PageHeader
          icon="dumbbell"
          title={t(def.nameKey)}
          subtitle={def.muscles.map((m) => t(`gym.muscle.${m}`)).join(" · ")}
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-950">
          <p className="text-[10px] uppercase tracking-wide text-stone-400">
            {t("gym.progress.pr")}
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {best1RM > 0 ? formatKg(best1RM) : "—"}
          </p>
          <p className="text-[10px] text-stone-400">
            {bestDate ? shortDate(bestDate) : ""}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-950">
          <p className="text-[10px] uppercase tracking-wide text-stone-400">
            {t("gym.progress.sessionsLabel")}
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {progress.length}
          </p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-950">
          <p className="text-[10px] uppercase tracking-wide text-stone-400">
            {t("gym.progress.setsLabel")}
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums">{totalSets}</p>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-950">
          <p className="text-[10px] uppercase tracking-wide text-stone-400">
            {t("gym.progress.metric.volume")}
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums">
            {totalVolume > 0 ? Math.round(totalVolume) : "—"}
          </p>
          <p className="text-[10px] text-stone-400">kg</p>
        </div>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">{t("gym.progress.title")}</h2>
          <div className="flex gap-1">
            {(["1rm", "weight", "volume"] as MetricKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMetric(key)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                  metric === key
                    ? "bg-teal-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
                )}
              >
                {metricLabel(key)}
              </button>
            ))}
          </div>
        </div>

        {chartData.length === 0 ? (
          <p className="py-8 text-center text-sm text-stone-400">
            {t("gym.progress.empty")}
          </p>
        ) : (
          <>
            <LineChart data={chartData} formatValue={formatKg} />
            <p className="mt-2 text-center text-[10px] text-stone-400">
              {metric === "1rm" ? t("gym.progress.chartHint") : ""}
            </p>
          </>
        )}
      </section>

      {progress.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">{t("gym.progress.recent")}</h2>
          <ul className="flex flex-col gap-2">
            {[...progress].reverse().map((point) => (
              <li
                key={point.date}
                className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 dark:border-stone-800 dark:bg-stone-950"
              >
                <span className="text-xs font-medium tabular-nums">
                  {shortDate(point.date)}
                </span>
                <span className="text-xs tabular-nums text-stone-500 dark:text-stone-400">
                  {point.topWeight > 0 ? `${formatKg(point.topWeight)} top` : ""}
                </span>
                <span className="text-xs font-semibold tabular-nums text-teal-700 dark:text-teal-400">
                  {point.est1RM > 0 ? `1RM ${formatKg(point.est1RM)}` : ""}
                </span>
                <span className="text-xs tabular-nums text-stone-500 dark:text-stone-400">
                  {point.volume > 0 ? `${Math.round(point.volume)} kg` : ""} ·{" "}
                  {point.sets} {t("gym.set")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
