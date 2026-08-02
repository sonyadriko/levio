"use client";

import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  groupSessionsByDate,
  sessionSetCount,
  sessionVolume,
  type GymSession,
  type GymState,
} from "@/lib/gym";
import { monthLabel, todayKey } from "@/lib/date";
import { cn } from "@/lib/utils";

function formatDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return `${d} ${monthLabel(new Date(y, m - 1, d))} ${y}`;
}

function SessionCard({
  session,
  onDelete,
}: {
  session: GymSession;
  onDelete: () => void;
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const volume = sessionVolume(session);
  const sets = sessionSetCount(session);

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-3.5 dark:border-stone-800 dark:bg-stone-950">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">
              {session.title || t("gym.freeSession")}
            </p>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
              {t("gym.session.summary", {
                exercises: session.exercises.length,
                sets,
              })}
            </span>
          </div>
          <p className="mt-1 text-xs tabular-nums text-stone-500 dark:text-stone-400">
            {volume > 0 ? t("gym.session.volume", { v: volume }) : ""}
          </p>
        </button>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-stone-400 transition-transform",
            expanded ? "rotate-180" : "",
          )}
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          aria-label="delete"
          className="shrink-0 text-destructive hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

      {expanded ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-stone-100 pt-3 dark:border-stone-800">
          {session.exercises.map((exercise) => (
            <div key={exercise.id} className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium">{exercise.name}</p>
                {exercise.muscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                  >
                    {t(`gym.muscle.${muscle}`)}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {exercise.sets
                  .filter((set) => set.reps > 0 || set.weightKg > 0 || set.done)
                  .map((set, index) => (
                  <span
                    key={index}
                    className="text-xs tabular-nums text-stone-500 dark:text-stone-400"
                  >
                    {set.weightKg > 0
                      ? t("gym.entry.sets", {
                          s: 1,
                          r: set.reps,
                          w: set.weightKg,
                        })
                      : t("gym.entry.bodyweight", { s: 1, r: set.reps })}
                    {set.done ? " ✓" : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export function GymLog({
  gym,
  onDelete,
}: {
  gym: GymState;
  onDelete: (session: GymSession) => void;
}) {
  const { t } = useLanguage();
  const today = todayKey();
  const groups = groupSessionsByDate(gym);
  const [pendingDelete, setPendingDelete] = useState<GymSession | null>(null);

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold">{t("gym.history.title")}</h2>

      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-950">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            {t("gym.history.empty.title")}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs text-stone-400">
            {t("gym.history.empty.desc")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.date} className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                {group.date === today ? t("gym.today") : formatDate(group.date)}
                <span className="ml-2 font-normal normal-case">
                  {t("gym.count", { n: group.sessions.length })}
                </span>
              </h3>
              <ul className="flex flex-col gap-2">
                {group.sessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onDelete={() => setPendingDelete(session)}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("gym.deleteSessionConfirm")}</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>
              {t("gym.session.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (pendingDelete) onDelete(pendingDelete);
                setPendingDelete(null);
              }}
            >
              {t("gym.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
