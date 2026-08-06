"use client";

import { Play } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROUTINE_TEMPLATES } from "@/lib/gym";

export function TemplatePicker({
  onPick,
}: {
  onPick: (templateId: string | undefined) => void;
}) {
  const { t } = useLanguage();

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold">{t("gym.startWorkout")}</h2>
        <p className="text-xs text-stone-500 dark:text-stone-500">
          {t("gym.template.hint")}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ROUTINE_TEMPLATES.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{t(template.nameKey)}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {template.exercises.map((exercise) => (
                <p
                  key={exercise.exerciseKey}
                  className="truncate text-sm text-stone-600 dark:text-stone-300"
                >
                  {t(exercise.exerciseKey)}
                </p>
              ))}
              <button
                type="button"
                onClick={() => onPick(template.id)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-800"
              >
                <Play className="size-3.5" />
                {t("gym.startWorkout")}
              </button>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>{t("gym.freeSession")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-stone-600 dark:text-stone-300">
              {t("gym.freeSessionDesc")}
            </p>
            <button
              type="button"
              onClick={() => onPick(undefined)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <Play className="size-3.5" />
              {t("gym.startWorkout")}
            </button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
