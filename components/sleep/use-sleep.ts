"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useProgress } from "@/components/progress-provider";
import {
  emptySleep,
  loadSleep,
  logSleep,
  saveSleep,
  setSleepTarget,
  todaySleep,
  type SleepState,
} from "@/lib/sleep";

const listeners = new Set<() => void>();
const serverSnapshot = emptySleep();
let clientSnapshot: SleepState | null = null;

function getSnapshot(): SleepState {
  if (clientSnapshot === null) clientSnapshot = loadSleep();
  return clientSnapshot;
}

function getServerSnapshot(): SleepState {
  return serverSnapshot;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function setSleep(next: SleepState): void {
  clientSnapshot = next;
  saveSleep(next);
  listeners.forEach((listener) => listener());
}

export function useSleep() {
  const sleep = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { awardGymXp } = useProgress();

  const log = useCallback(
    (minutes: number) => {
      const { state, xpAwarded } = logSleep(getSnapshot(), minutes);
      setSleep(state);
      if (xpAwarded > 0) awardGymXp(xpAwarded);
    },
    [awardGymXp],
  );

  const setTarget = useCallback((minutes: number) => {
    setSleep(setSleepTarget(getSnapshot(), minutes));
  }, []);

  return { sleep, todayMin: todaySleep(sleep), log, setTarget };
}