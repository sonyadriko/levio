"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import { StatCard } from "@/components/stat-card";
import { XP_PER_LEVEL } from "@/lib/progress";
import { getWordsByLevel } from "@/lib/hsk";
import { allLevels } from "@/lib/hsk/levels";
import {
  dailySeries,
  heatmap,
  heatmapLevel,
  monthlySeries,
  summarize,
  totalsThisMonth,
  totalsThisWeek,
  totalsThisYear,
  totalsToday,
  weeklySeries,
  yearlySeries,
  type PeriodTotals,
  type SeriesPoint,
} from "@/lib/stats";

type Tab = "daily" | "weekly" | "monthly" | "yearly";

const TABS: { id: Tab; labelKey: string }[] = [
  { id: "daily", labelKey: "stats.tab.daily" },
  { id: "weekly", labelKey: "stats.tab.weekly" },
  { id: "monthly", labelKey: "stats.tab.monthly" },
  { id: "yearly", labelKey: "stats.tab.yearly" },
];

const HEAT_COLORS = [
  "bg-stone-100 dark:bg-stone-800",
  "bg-teal-300 dark:bg-teal-800",
  "bg-teal-500 dark:bg-teal-700",
  "bg-teal-700 dark:bg-teal-600",
  "bg-teal-900 dark:bg-teal-500",
];

function BarChart({
  series,
  height = 40,
}: {
  series: SeriesPoint[];
  height?: number;
}) {
  const { t } = useLanguage();
  const max = Math.max(...series.map((p) => p.totals.xp), 1);
  return (
    <div className="flex items-end gap-1.5 sm:gap-2">
      {series.map((p) => (
        <div
          key={p.label}
          className="flex flex-1 flex-col items-center gap-1"
          title={t("stats.xpTitle", { label: p.label, xp: p.totals.xp })}
        >
          <span className="text-[10px] tabular-nums text-stone-400">
            {p.totals.xp > 0 ? p.totals.xp : ""}
          </span>
          <div
            className="animate-bar-grow w-full origin-bottom rounded-t-md bg-teal-600 transition-all dark:bg-teal-600"
            style={{
              height: `${Math.max((p.totals.xp / max) * height, p.totals.xp > 0 ? 3 : 0)}px`,
            }}
          />
          <span className="text-[10px] text-stone-500 dark:text-stone-400">
            {p.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function TotalsRow({ totals }: { totals: PeriodTotals }) {
  const { t } = useLanguage();
  const items = [
    { label: t("common.xp"), value: totals.xp },
    { label: t("stats.review"), value: totals.reviews },
    { label: t("stats.test"), value: totals.tests },
    { label: t("stats.activeDays"), value: totals.activeDays },
  ];
  return (
    <div className="grid grid-cols-4 gap-2 text-center">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-lg bg-stone-50 py-2 dark:bg-stone-900"
        >
          <p className="text-base font-bold tabular-nums">{item.value}</p>
          <p className="text-[10px] uppercase tracking-wide text-stone-400">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function LevelProgress() {
  const { progress } = useProgress();
  const { t } = useLanguage();
  const levels = allLevels()
    .map((level) => {
      const words = getWordsByLevel(level);
      const reviewed = words.filter((w) => progress.words[w.id]).length;
      const mastered = words.filter((w) => progress.words[w.id]?.mastered).length;
      return { level, total: words.length, reviewed, mastered };
    })
    .filter((l) => l.total > 0);

  if (levels.length === 0) return null;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{t("stats.perLevel")}</h2>
        <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-200 dark:bg-teal-800" />
            {t("stats.perLevelReviewed")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-500" />
            {t("stats.perLevelMastered")}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {levels.map((level) => (
          <div key={level.level} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-xs font-semibold text-stone-500 dark:text-stone-400">
              HSK {level.level}
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
              <div
                className="absolute inset-y-0 left-0 bg-teal-200 dark:bg-teal-800"
                style={{ width: `${(level.reviewed / level.total) * 100}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 bg-teal-600 dark:bg-teal-500"
                style={{ width: `${(level.mastered / level.total) * 100}%` }}
              />
            </div>
            <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-stone-500 dark:text-stone-400">
              {t("stats.masteredOf", {
                mastered: level.mastered,
                total: level.total,
              })}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StatsDashboard() {
  const { progress } = useProgress();
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("daily");

  const activity = progress.activityByDate;
  const summary = useMemo(() => summarize(progress), [progress]);
  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;

  const series = useMemo(() => {
    switch (tab) {
      case "daily":
        return dailySeries(activity, 7);
      case "weekly":
        return weeklySeries(activity, 8);
      case "monthly":
        return monthlySeries(activity, 12);
      case "yearly":
        return yearlySeries(activity, 4);
    }
  }, [tab, activity]);

  const current = useMemo(() => {
    switch (tab) {
      case "daily":
        return totalsToday(activity);
      case "weekly":
        return totalsThisWeek(activity);
      case "monthly":
        return totalsThisMonth(activity);
      case "yearly":
        return totalsThisYear(activity);
    }
  }, [tab, activity]);

  const cells = useMemo(() => heatmap(activity, 12), [activity]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("stats.totalXp")} value={summary.xp} icon="chart" />
        <StatCard label={t("common.level")} value={level} icon="check" />
        <StatCard
          label={t("stats.streak")}
          value={t("stats.days", { n: summary.streak })}
          icon="flame"
        />
        <StatCard
          label={t("stats.bestStreak")}
          value={t("stats.days", { n: summary.bestStreak })}
          icon="flame"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label={t("stats.mastered")} value={summary.mastered} icon="book" />
        <StatCard label={t("stats.reviewed")} value={summary.reviewed} icon="book" />
        <StatCard label={t("stats.totalReview")} value={summary.completedReviews} icon="pen" />
        <StatCard label={t("stats.activeDays")} value={summary.activeDays} icon="chart" />
      </div>

      {summary.lastTest && (
        <div className="flex items-center gap-3 rounded-xl border border-teal-200 bg-teal-50 p-3.5 dark:border-teal-800 dark:bg-teal-500/10">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
            <Icon name="chart" className="h-4 w-4" />
          </span>
          <p className="text-sm">
            <span className="font-semibold">{t("stats.lastTest")}</span>{" "}
            {Math.round((summary.lastTest.correct / summary.lastTest.total) * 100)}%
            ({summary.lastTest.correct}/{summary.lastTest.total})
          </p>
        </div>
      )}

      {tab === "daily" && (
        <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
          <h2 className="mb-3 text-sm font-semibold">{t("stats.last12Weeks")}</h2>
          <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
            {cells.map((cell, i) => (
              <div
                key={cell.key}
                className={`animate-fade-in h-2.5 w-2.5 shrink-0 rounded-[3px] sm:h-3 sm:w-3 ${HEAT_COLORS[heatmapLevel(cell.xp)]}`}
                style={{ animationDelay: `${Math.min(i, 40) * 12}ms` }}
                title={t("stats.cellTitle", { date: cell.key, xp: cell.xp })}
              />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {TABS.map((tabItem) => (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`h-8 rounded-lg px-3 text-sm font-medium transition-colors ${
                tab === tabItem.id
                  ? "bg-teal-700 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-900 dark:text-stone-400 dark:hover:bg-stone-800"
              }`}
            >
              {t(tabItem.labelKey)}
            </button>
          ))}
        </div>

        <TotalsRow totals={current} />

        <div className="mt-5">
          <BarChart series={series} />
        </div>
      </section>

      <LevelProgress />
    </div>
  );
}
