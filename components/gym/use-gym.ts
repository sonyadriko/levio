"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useLanguage } from "@/components/language-provider";
import { useProgress } from "@/components/progress-provider";
import {
  addExercise,
  addSet,
  cancelSession,
  completeSession,
  deleteSession,
  emptyGym,
  loadGym,
  removeExercise,
  removeSet,
  saveGym,
  setActiveSessionTitle,
  setExerciseMuscles,
  setExerciseName,
  startSession,
  templateSessionDraft,
  toggleMuscle,
  updateSet,
  type GymState,
  type MuscleGroup,
} from "@/lib/gym";

const listeners = new Set<() => void>();
const serverSnapshot = emptyGym();
let clientSnapshot: GymState | null = null;

function getSnapshot(): GymState {
  if (clientSnapshot === null) {
    clientSnapshot = loadGym();
  }
  return clientSnapshot;
}

function getServerSnapshot(): GymState {
  return serverSnapshot;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function setGym(next: GymState): void {
  clientSnapshot = next;
  saveGym(next);
  listeners.forEach((listener) => listener());
}

export function useGym() {
  const gym = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { t } = useLanguage();
  const { awardGymXp } = useProgress();

  const beginSession = useCallback(
    (templateId?: string) => {
      const draft = templateId
        ? templateSessionDraft(templateId, t)
        : { title: t("gym.freeSession"), exercises: [] };
      setGym(startSession(getSnapshot(), draft));
    },
    [t],
  );

  const setTitle = useCallback((title: string) => {
    setGym(setActiveSessionTitle(getSnapshot(), title));
  }, []);

  const addExerciseToSession = useCallback(() => {
    setGym(addExercise(getSnapshot()));
  }, []);

  const removeExerciseFromSession = useCallback((exerciseId: string) => {
    setGym(removeExercise(getSnapshot(), exerciseId));
  }, []);

  const renameExercise = useCallback((exerciseId: string, name: string) => {
    setGym(setExerciseName(getSnapshot(), exerciseId, name));
  }, []);

  const setMuscles = useCallback(
    (exerciseId: string, muscles: MuscleGroup[]) => {
      setGym(setExerciseMuscles(getSnapshot(), exerciseId, muscles));
    },
    [],
  );

  const toggleMuscleFor = useCallback((exerciseId: string, muscle: MuscleGroup) => {
    setGym(toggleMuscle(getSnapshot(), exerciseId, muscle));
  }, []);

  const addSetToExercise = useCallback((exerciseId: string) => {
    setGym(addSet(getSnapshot(), exerciseId));
  }, []);

  const updateSetOf = useCallback(
    (exerciseId: string, setIndex: number, patch: { weightKg?: number; reps?: number; done?: boolean }) => {
      setGym(updateSet(getSnapshot(), exerciseId, setIndex, patch));
    },
    [],
  );

  const removeSetOf = useCallback((exerciseId: string, setIndex: number) => {
    setGym(removeSet(getSnapshot(), exerciseId, setIndex));
  }, []);

  const endSession = useCallback((): number => {
    const { state, awarded } = completeSession(getSnapshot());
    if (awarded > 0) awardGymXp(awarded);
    setGym(state);
    return awarded;
  }, [awardGymXp]);

  const abortSession = useCallback(() => {
    setGym(cancelSession(getSnapshot()));
  }, []);

  const removeSession = useCallback((sessionId: string) => {
    setGym(deleteSession(getSnapshot(), sessionId));
  }, []);

  return {
    gym,
    beginSession,
    setTitle,
    addExerciseToSession,
    removeExerciseFromSession,
    renameExercise,
    setMuscles,
    toggleMuscleFor,
    addSetToExercise,
    updateSetOf,
    removeSetOf,
    endSession,
    abortSession,
    removeSession,
  };
}
