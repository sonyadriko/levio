"use client";

import Link from "next/link";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { useSettings } from "@/components/settings-provider";
import { useGym } from "@/components/gym/use-gym";
import { useWater } from "@/components/water/use-water";
import { Icon } from "@/components/icons";
import { todayKey } from "@/lib/date";
import { workoutDoneOn } from "@/lib/gym";
import { isWaterTargetMet } from "@/lib/water";

export function DailyChecklist() {
  const { progress } = useProgress();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { gym } = useGym();
  const { water } = useWater();

  const activity = progress?.activityByDate ?? {};
  const today = activity[todayKey()] ?? { xp: 0, reviews: 0, tests: 0, newWords: 0 };
  const { vocab, reviews: reviewTarget, xp: xpTarget } = settings.dailyTargets;

  const tasks: {
    labelKey: string;
    vars: Record<string, number>;
    metaKey: string;
    done: boolean;
    href: string;
    icon: "book" | "pen" | "chart" | "dumbbell" | "water";
  }[] = [
    {
      labelKey: "checklist.learn.label",
      vars: { n: vocab },
      metaKey: "checklist.learn.meta",
      done: (today.newWords ?? 0) >= vocab,
      href: "/learn",
      icon: "book" as const,
    },
    {
      labelKey: "checklist.review.label",
      vars: { n: reviewTarget },
      metaKey: "checklist.review.meta",
      done: (today.reviews ?? 0) >= reviewTarget,
      href: "/practice",
      icon: "pen" as const,
    },
    {
      labelKey: "checklist.xp.label",
      vars: { n: xpTarget },
      metaKey: "checklist.xp.meta",
      done: (today.xp ?? 0) >= xpTarget,
      href: "/learn",
      icon: "chart" as const,
    },
    {
      labelKey: "checklist.test.label",
      vars: {},
      metaKey: "checklist.test.meta",
      done: today.tests >= 1,
      href: "/mock-test",
      icon: "chart" as const,
    },
    {
      labelKey: "checklist.gym.label",
      vars: {},
      metaKey: "checklist.gym.meta",
      done: workoutDoneOn(gym, todayKey()),
      href: "/gym",
      icon: "dumbbell" as const,
    },
    {
      labelKey: "checklist.water.label",
      vars: { n: water.targetMl },
      metaKey: "checklist.water.meta",
      done: isWaterTargetMet(water, todayKey()),
      href: "/#water",
      icon: "water" as const,
    },
  ];
  const doneCount = tasks.filter((task) => task.done).length;

  return (
    <section>
      <h2 className="mb-3 text-base font-semibold">
        {t("checklist.title")}{" "}
        <span className="ml-1 text-sm font-medium text-stone-500">
          {doneCount}/{tasks.length}
        </span>
      </h2>
      <ul className="flex flex-col gap-2">
        {tasks.map((task) => (
          <li key={task.labelKey}>
              <Link
                href={task.href}
                className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-3.5 transition-colors hover:border-teal-300 active:scale-[0.99] dark:border-stone-800 dark:bg-stone-950 dark:hover:border-teal-700"
              >
                <span
                  key={String(task.done)}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    task.done
                      ? "animate-pop bg-emerald-700 text-white"
                      : "bg-stone-100 text-stone-500 dark:bg-stone-900 dark:text-stone-500"
                  }`}
                >
                <Icon
                  name={task.done ? "check" : task.icon}
                  className="h-4 w-4"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-medium ${
                    task.done
                      ? "text-stone-500 line-through dark:text-stone-500"
                      : ""
                  }`}
                >
                  {t(task.labelKey, task.vars)}
                </p>
                <p className="text-xs text-stone-500">{t(task.metaKey)}</p>
              </div>
              <Icon
                name="check"
                className="h-4 w-4 text-stone-300 dark:text-stone-700"
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
