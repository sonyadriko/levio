"use client";

import { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  MUSCLE_GROUPS,
  type GymSession,
  type GymSet,
  type MuscleGroup,
} from "@/lib/gym";
import { cn } from "@/lib/utils";

export interface GymSessionApi {
  setTitle: (title: string) => void;
  addExerciseToSession: () => void;
  removeExerciseFromSession: (exerciseId: string) => void;
  renameExercise: (exerciseId: string, name: string) => void;
  toggleMuscleFor: (exerciseId: string, muscle: MuscleGroup) => void;
  addSetToExercise: (exerciseId: string) => void;
  updateSetOf: (
    exerciseId: string,
    setIndex: number,
    patch: Partial<GymSet>,
  ) => void;
  removeSetOf: (exerciseId: string, setIndex: number) => void;
  endSession: () => number;
  abortSession: () => void;
}

function SetRow({
  index,
  set,
  onChange,
  onRemove,
}: {
  index: number;
  set: GymSet;
  onChange: (patch: Partial<GymSet>) => void;
  onRemove: () => void;
}) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-[2rem_1fr_1fr_2.25rem_2rem] items-center gap-2">
      <span className="text-xs tabular-nums text-stone-400">#{index + 1}</span>
      <Input
        type="number"
        inputMode="decimal"
        min={0}
        step="0.5"
        value={set.weightKg === 0 ? "" : String(set.weightKg)}
        placeholder="0"
        onChange={(e) =>
          onChange({ weightKg: e.target.value === "" ? 0 : Number(e.target.value) })
        }
        aria-label={`${t("gym.set")} ${index + 1} · ${t("gym.weightLabel")}`}
      />
      <Input
        type="number"
        inputMode="numeric"
        min={0}
        value={set.reps === 0 ? "" : String(set.reps)}
        placeholder="0"
        onChange={(e) =>
          onChange({ reps: e.target.value === "" ? 0 : Number(e.target.value) })
        }
        aria-label={`${t("gym.set")} ${index + 1} · ${t("gym.repsLabel")}`}
      />
      <Button
        variant={set.done ? "default" : "outline"}
        size="icon-sm"
        onClick={() => onChange({ done: !set.done })}
        aria-label={t("gym.set.done")}
      >
        <Check />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        aria-label={t("gym.set.remove")}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 />
      </Button>
    </div>
  );
}

function ExerciseCard({
  exercise,
  api,
}: {
  exercise: GymSession["exercises"][number];
  api: GymSessionApi;
}) {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-950">
      <div className="flex items-center gap-2">
        <Input
          value={exercise.name}
          onChange={(e) => api.renameExercise(exercise.id, e.target.value)}
          placeholder={t("gym.exercise.namePlaceholder")}
          className="border-transparent bg-transparent px-0 font-medium focus-visible:border-ring dark:bg-transparent"
          aria-label={t("gym.exercise.name")}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => api.removeExerciseFromSession(exercise.id)}
          aria-label={t("gym.exercise.remove")}
          className="shrink-0 text-destructive hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {MUSCLE_GROUPS.map((muscle) => {
          const selected = exercise.muscles.includes(muscle);
          return (
            <button
              key={muscle}
              type="button"
              onClick={() => api.toggleMuscleFor(exercise.id, muscle)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
                selected
                  ? "bg-teal-600 text-white"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700",
              )}
            >
              {t(`gym.muscle.${muscle}`)}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-col gap-1.5">
        <div className="grid grid-cols-[2rem_1fr_1fr_2.25rem_2rem] gap-2 text-[10px] font-semibold uppercase tracking-wide text-stone-400">
          <span>#</span>
          <span>{t("gym.weightLabel")}</span>
          <span>{t("gym.repsLabel")}</span>
          <span />
          <span />
        </div>
        {exercise.sets.map((set, index) => (
          <SetRow
            key={index}
            index={index}
            set={set}
            onChange={(patch) => api.updateSetOf(exercise.id, index, patch)}
            onRemove={() => api.removeSetOf(exercise.id, index)}
          />
        ))}
        {exercise.sets.length === 0 ? (
          <p className="text-xs text-stone-400">{t("gym.exercise.noSets")}</p>
        ) : null}
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => api.addSetToExercise(exercise.id)}
        >
          <Plus />
          {t("gym.session.addSet")}
        </Button>
      </div>
    </div>
  );
}

export function GymSessionForm({
  open,
  onOpenChange,
  session,
  api,
  onEnded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: GymSession;
  api: GymSessionApi;
  onEnded: (awarded: number) => void;
}) {
  const { t } = useLanguage();
  const [confirmCancel, setConfirmCancel] = useState(false);

  const handleEnd = () => {
    const awarded = api.endSession();
    onEnded(awarded);
    onOpenChange(false);
  };

  const handleCancel = () => {
    api.abortSession();
    setConfirmCancel(false);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] sm:max-w-sm sm:rounded-t-2xl"
      >
        <SheetHeader>
          <SheetTitle>{t("gym.activeSession")}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3 overflow-y-auto px-4">
          <Input
            value={session.title}
            onChange={(e) => api.setTitle(e.target.value)}
            placeholder={t("gym.session.titlePlaceholder")}
            className="border-transparent bg-transparent px-0 text-base font-semibold focus-visible:border-ring dark:bg-transparent"
            aria-label={t("gym.session.title")}
          />

          {session.exercises.length === 0 ? (
            <div className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center dark:border-stone-700 dark:bg-stone-950">
              <p className="text-sm text-stone-500 dark:text-stone-400">
                {t("gym.session.empty")}
              </p>
            </div>
          ) : (
            session.exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} api={api} />
            ))
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => api.addExerciseToSession()}
          >
            <Plus />
            {t("gym.session.addExercise")}
          </Button>
        </div>

        <SheetFooter>
          <Button variant="ghost" onClick={() => setConfirmCancel(true)}>
            {t("gym.session.cancel")}
          </Button>
          <Button
            onClick={handleEnd}
            disabled={session.exercises.length === 0}
          >
            {t("gym.session.end")}
          </Button>
        </SheetFooter>
      </SheetContent>

      <Dialog
        open={confirmCancel}
        onOpenChange={(open) => {
          if (!open) setConfirmCancel(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("gym.session.cancelConfirm")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmCancel(false)}>
              {t("gym.session.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleCancel}>
              {t("gym.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
