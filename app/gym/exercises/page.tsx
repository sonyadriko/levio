"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { PageHeader } from "@/components/page-header";
import { BackLink } from "@/components/back-link";
import { Input } from "@/components/ui/input";
import { useGym } from "@/components/gym/use-gym";
import { exerciseProgressPoints } from "@/lib/gym";
import { MUSCLE_GROUPS, type MuscleGroup } from "@/lib/gym";
import { EXERCISE_DB } from "@/lib/gym-exercises";
import { cn } from "@/lib/utils";

export default function ExerciseLibraryPage() {
  const { t } = useLanguage();
  const { gym } = useGym();
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = EXERCISE_DB.filter(
    (def) =>
      (muscle === null || def.muscles.includes(muscle)) &&
      (q === "" || t(def.nameKey).toLowerCase().includes(q)),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <BackLink href="/gym" labelKey="gym.title" />
        <PageHeader
          icon="dumbbell"
          title={t("gym.exercises.title")}
          subtitle={t("gym.exercises.desc")}
        />
      </div>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("gym.exercise.searchPlaceholder")}
        aria-label={t("gym.exercise.searchPlaceholder")}
      />

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setMuscle(null)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
            muscle === null
              ? "bg-teal-600 text-white"
              : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
          )}
        >
          {t("gym.exercise.allMuscles")}
        </button>
        {MUSCLE_GROUPS.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setMuscle(muscle === group ? null : group)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              muscle === group
                ? "bg-teal-600 text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
            )}
          >
            {t(`gym.muscle.${group}`)}
          </button>
        ))}
      </div>

      <p className="text-xs tabular-nums text-stone-400">
        {t("gym.exercises.count", { n: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-950">
          <p className="text-sm text-stone-400">{t("gym.exercises.empty")}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((def) => {
            const progress = exerciseProgressPoints(gym, def.id);
            const pr = progress.length > 0
              ? progress.reduce((best, p) => Math.max(best, p.est1RM), 0)
              : 0;
            return (
              <li key={def.id}>
                <Link
                  href={`/gym/exercises/${def.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-3.5 transition-colors hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-teal-700"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t(def.nameKey)}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {def.muscles.map((group) => (
                        <span
                          key={group}
                          className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                        >
                          {t(`gym.muscle.${group}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs tabular-nums text-teal-700 dark:text-teal-400">
                      {pr > 0 ? `${t("gym.progress.pr")} ${Math.round(pr * 10) / 10} kg` : "—"}
                    </p>
                    <p className="mt-0.5 text-[10px] tabular-nums text-stone-400">
                      {t("gym.progress.sessions", { n: progress.length })}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
