"use client";

import { useEffect, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EXERCISE_DB, defaultRestSeconds, getExerciseDef } from "@/lib/gym-exercises";
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
  addDbExercise: (defId: string) => void;
  setRest: (exerciseId: string, restSeconds: number) => void;
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

const REST_OPTIONS = [45, 60, 90, 120, 150, 180];

function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

let audioContext: AudioContext | null = null;

function ensureAudio(): void {
  if (typeof window === "undefined") return;
  if (!audioContext) {
    try {
      audioContext = new AudioContext();
    } catch {
      audioContext = null;
    }
  }
  if (audioContext && audioContext.state === "suspended") {
    void audioContext.resume();
  }
}

function playRestBeep(): void {
  ensureAudio();
  try {
    if (!audioContext) return;
    const ctx = audioContext;
    const beep = (freq: number, at: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + at);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + 0.35);
      osc.start(ctx.currentTime + at);
      osc.stop(ctx.currentTime + at + 0.4);
    };
    beep(880, 0);
    beep(880, 0.3);
    beep(1175, 0.6);
  } catch {
    // audio tidak tersedia — abaikan.
  }
  try {
    navigator.vibrate?.(600);
  } catch {
    // vibration tidak tersedia — abaikan.
  }
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
  restSeconds,
  restRemaining,
  onStartRest,
  onSkipRest,
  onSetRest,
}: {
  exercise: GymSession["exercises"][number];
  api: GymSessionApi;
  restSeconds: number;
  restRemaining: number | null;
  onStartRest: (exerciseId: string, seconds: number) => void;
  onSkipRest: () => void;
  onSetRest: (seconds: number) => void;
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

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
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
        <Select
          value={String(restSeconds)}
          onValueChange={(value) => onSetRest(Number(value))}
        >
          <SelectTrigger size="sm" aria-label={t("gym.rest.edit")}>
            <SelectValue>{t("gym.rest.seconds", { s: restSeconds })}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {REST_OPTIONS.map((seconds) => (
              <SelectItem key={seconds} value={String(seconds)}>
                {t("gym.rest.seconds", { s: seconds })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {restRemaining !== null ? (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold text-white">
          <span className="tabular-nums">{formatTime(restRemaining)}</span>
          <span className="text-xs font-normal opacity-90">{t("gym.rest")}</span>
          <button
            type="button"
            onClick={onSkipRest}
            className="ml-auto rounded-md px-2 py-0.5 text-xs font-medium underline-offset-2 hover:bg-white/20 hover:underline"
          >
            {t("gym.rest.skip")}
          </button>
        </div>
      ) : null}

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
            onChange={(patch) => {
              api.updateSetOf(exercise.id, index, patch);
              if (patch.done === true) onStartRest(exercise.id, restSeconds);
            }}
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

function AddExerciseSheet({
  open,
  onOpenChange,
  onPick,
  onCustom,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (defId: string) => void;
  onCustom: () => void;
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);

  const q = query.trim().toLowerCase();
  const filtered = EXERCISE_DB.filter(
    (def) =>
      (muscle === null || def.muscles.includes(muscle)) &&
      (q === "" || t(def.nameKey).toLowerCase().includes(q)),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("gym.exercise.library")}</DialogTitle>
        </DialogHeader>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("gym.exercise.searchPlaceholder")}
          autoFocus
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

        <div className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-stone-400">
              {t("gym.exercises.empty")}
            </p>
          ) : (
            filtered.map((def) => (
              <button
                key={def.id}
                type="button"
                onClick={() => onPick(def.id)}
                className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/30"
              >
                <span className="truncate font-medium">{t(def.nameKey)}</span>
                <span className="flex shrink-0 gap-1">
                  {def.muscles.map((group) => (
                    <span
                      key={group}
                      className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                    >
                      {t(`gym.muscle.${group}`)}
                    </span>
                  ))}
                </span>
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" className="w-full" onClick={onCustom}>
            <Plus />
            {t("gym.exercise.custom")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const [pickerOpen, setPickerOpen] = useState(false);
  const [timers, setTimers] = useState<Record<string, { until: number }>>({});
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Object.keys(timers).length === 0) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [timers]);

  useEffect(() => {
    const prune = () => {
      const ids = new Set(session.exercises.map((ex) => ex.id));
      let changed = false;
      let anyExpired = false;
      const next: Record<string, { until: number }> = {};
      for (const [exerciseId, timer] of Object.entries(timers)) {
        if (!ids.has(exerciseId) || timer.until <= now) {
          changed = true;
          if (timer.until <= now) anyExpired = true;
          continue;
        }
        next[exerciseId] = timer;
      }
      if (changed) {
        setTimers(next);
        if (anyExpired) playRestBeep();
      }
    };
    prune();
  }, [now, timers, session.exercises]);

  const startRest = (exerciseId: string, seconds: number) => {
    ensureAudio();
    const until = Date.now() + Math.max(1, seconds) * 1000;
    setTimers((prev) => ({ ...prev, [exerciseId]: { until } }));
    setNow(Date.now());
  };

  const skipRest = (exerciseId: string) => {
    setTimers((prev) => {
      const next = { ...prev };
      delete next[exerciseId];
      return next;
    });
  };

  const handleEnd = () => {
    const awarded = api.endSession();
    onEnded(awarded);
    setTimers({});
    onOpenChange(false);
  };

  const handleCancel = () => {
    api.abortSession();
    setConfirmCancel(false);
    setTimers({});
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
            session.exercises.map((exercise) => {
              const restSeconds =
                exercise.restSeconds ??
                defaultRestSeconds(getExerciseDef(exercise.exerciseId));
              const timer = timers[exercise.id];
              const remaining = timer ? timer.until - now : null;
              return (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  api={api}
                  restSeconds={restSeconds}
                  restRemaining={remaining !== null && remaining > 0 ? remaining : null}
                  onStartRest={startRest}
                  onSkipRest={() => skipRest(exercise.id)}
                  onSetRest={(seconds) => api.setRest(exercise.id, seconds)}
                />
              );
            })
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setPickerOpen(true)}
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

      <AddExerciseSheet
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={(defId) => {
          api.addDbExercise(defId);
          setPickerOpen(false);
        }}
        onCustom={() => {
          api.addExerciseToSession();
          setPickerOpen(false);
        }}
      />
    </Sheet>
  );
}
