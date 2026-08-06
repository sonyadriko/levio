"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { useGym } from "@/components/gym/use-gym";
import { GymLog } from "@/components/gym/gym-log";
import { GymSessionForm } from "@/components/gym/gym-session-form";
import { GymVolume } from "@/components/gym/gym-volume";
import { GymVolumeTrend } from "@/components/gym/gym-volume-trend";
import { TemplatePicker } from "@/components/gym/template-picker";
import { GymProgram } from "@/components/gym/gym-program";
import { gymStreak, sessionsThisWeek } from "@/lib/gym";
import { todayKey } from "@/lib/date";

export default function GymPage() {
  const { t } = useLanguage();
  const {
    gym,
    beginSession,
    beginProgramSession,
    setTitle,
    addExerciseToSession,
    addDbExercise,
    setRest,
    removeExerciseFromSession,
    renameExercise,
    toggleMuscleFor,
    addSetToExercise,
    updateSetOf,
    removeSetOf,
    endSession,
    abortSession,
    removeSession,
  } = useGym();
  const [editorOpen, setEditorOpen] = useState(false);
  const [xpNote, setXpNote] = useState<string | null>(null);

  const today = todayKey();
  const todaySessions = gym.sessions.filter((s) => s.date === today).length;
  const streak = gymStreak(gym);
  const weekSessions = sessionsThisWeek(gym);

  useEffect(() => {
    if (!xpNote) return;
    const timeout = window.setTimeout(() => setXpNote(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [xpNote]);

  const handlePick = (templateId?: string) => {
    beginSession(templateId);
    setEditorOpen(true);
  };

  const handleProgramPick = (programId: string, week: number, day: number) => {
    beginProgramSession(programId, week, day);
    setEditorOpen(true);
  };

  const handleEnded = (awarded: number) => {
    if (awarded > 0) {
      setXpNote(t("gym.session.xpNote", { xp: awarded }));
    }
  };

  const active = gym.activeSession;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="dumbbell"
        title={t("gym.title")}
        subtitle={t("gym.description")}
      />

      <Link
        href="/gym/exercises"
        className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium transition-colors hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-teal-700"
      >
        <span>{t("gym.exercises.title")}</span>
        <span className="text-stone-500">→</span>
      </Link>

      {xpNote ? (
        <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800 dark:border-teal-900 dark:bg-teal-900/30 dark:text-teal-200">
          {xpNote}
        </div>
      ) : null}

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label={t("gym.sessionsToday")}
          value={todaySessions}
          icon="check"
        />
        <StatCard
          label={t("gym.streak")}
          value={t("stats.days", { n: streak })}
          icon="flame"
        />
        <StatCard
          label={t("gym.sessionsThisWeek")}
          value={weekSessions}
          icon="chart"
        />
      </div>

      {active ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-900 dark:bg-teal-900/30">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-teal-900 dark:text-teal-100">
                {t("gym.activeSession")}
              </p>
              <p className="mt-0.5 truncate text-xs text-teal-700 dark:text-teal-300">
                {t("gym.session.summary", {
                  exercises: active.exercises.length,
                  sets: active.exercises.reduce(
                    (sum, ex) => sum + ex.sets.length,
                    0,
                  ),
                })}
              </p>
            </div>
            <Button onClick={() => setEditorOpen(true)} className="shrink-0">
              <Play />
              {t("gym.session.resume")}
            </Button>
          </div>
        </div>
      ) : (
        <TemplatePicker onPick={handlePick} />
      )}

      <GymVolume gym={gym} />
      <GymVolumeTrend gym={gym} />
      <GymProgram gym={gym} onStart={handleProgramPick} />
      <GymLog gym={gym} onDelete={(session) => removeSession(session.id)} />

      {active ? (
        <GymSessionForm
          open={editorOpen}
          onOpenChange={setEditorOpen}
          session={active}
          api={{
            setTitle,
            addExerciseToSession,
            addDbExercise,
            setRest,
            removeExerciseFromSession,
            renameExercise,
            toggleMuscleFor,
            addSetToExercise,
            updateSetOf,
            removeSetOf,
            endSession,
            abortSession,
          }}
          onEnded={handleEnded}
        />
      ) : null}
    </div>
  );
}
