"use client";

import { Check, Play } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getExerciseDef } from "@/lib/gym-exercises";
import {
  GYM_PROGRAMS,
  programTotalWorkouts,
  type GymProgram,
  type ProgramWorkout,
} from "@/lib/gym-programs";
import { programCompletedCount, programDayDone, type GymState } from "@/lib/gym";

function WorkoutSummary({
  workout,
  t,
}: {
  workout: ProgramWorkout;
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{t(workout.titleKey)}</span>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] text-stone-600 dark:bg-stone-800 dark:text-stone-300">
          {t("gym.program.duration", { minutes: workout.durationMin })}
        </span>
      </div>
      <ul className="flex flex-col gap-0.5">
        {workout.exercises.map((ex) => {
          const def = getExerciseDef(ex.exerciseId);
          return (
            <li key={ex.exerciseId} className="text-xs text-stone-500 dark:text-stone-400">
              {def ? t(def.nameKey) : ex.exerciseId} · {ex.targetSets} × {ex.targetReps}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ProgramCard({
  program,
  gym,
  onStart,
}: {
  program: GymProgram;
  gym: GymState;
  onStart: (week: number, day: number) => void;
}) {
  const { t } = useLanguage();
  const total = programTotalWorkouts(program);
  const completed = programCompletedCount(gym, program.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{t(program.nameKey)}</CardTitle>
          <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-700 dark:bg-teal-900/40 dark:text-teal-300">
            {completed}/{total}
          </span>
        </div>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t(program.descriptionKey)}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {Array.from({ length: program.weeks }, (_, weekIndex) => {
          const week = weekIndex + 1;
          return (
            <div key={week} className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                {t("gym.program.week", { week })}
              </p>
              <div className="flex flex-col gap-2">
                {program.workouts.map((workout, day) => {
                  const done = programDayDone(gym, program.id, week, day);
                  return (
                    <div
                      key={workout.id}
                      className="flex items-start justify-between gap-3 rounded-xl border border-stone-200 p-3 dark:border-stone-800"
                    >
                      <WorkoutSummary workout={workout} t={t} />
                      {done ? (
                        <span className="mt-0.5 flex shrink-0 items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-medium text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">
                          <Check className="size-3.5" />
                          {t("gym.program.done")}
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onStart(week, day)}
                          className="mt-0.5 flex shrink-0 items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
                        >
                          <Play className="size-3.5" />
                          {t("gym.startWorkout")}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

export function GymProgram({
  gym,
  onStart,
}: {
  gym: GymState;
  onStart: (programId: string, week: number, day: number) => void;
}) {
  const { t } = useLanguage();

  if (GYM_PROGRAMS.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold">{t("gym.program.title")}</h2>
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {t("gym.program.hint")}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        {GYM_PROGRAMS.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            gym={gym}
            onStart={(week, day) => onStart(program.id, week, day)}
          />
        ))}
      </div>
    </section>
  );
}
