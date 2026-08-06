"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useProgress } from "@/components/progress-provider";
import {
  drinkWater,
  emptyWater,
  loadWater,
  saveWater,
  setWaterTarget,
  todayWater,
  type WaterState,
} from "@/lib/water";

const listeners = new Set<() => void>();
const serverSnapshot = emptyWater();
let clientSnapshot: WaterState | null = null;

function getSnapshot(): WaterState {
  if (clientSnapshot === null) clientSnapshot = loadWater();
  return clientSnapshot;
}

function getServerSnapshot(): WaterState {
  return serverSnapshot;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function setWater(next: WaterState): void {
  clientSnapshot = next;
  saveWater(next);
  listeners.forEach((listener) => listener());
}

export function useWater() {
  const water = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { awardGymXp } = useProgress();

  const drink = useCallback(
    (ml: number) => {
      const { state, xpAwarded } = drinkWater(getSnapshot(), ml);
      setWater(state);
      if (xpAwarded > 0) awardGymXp(xpAwarded);
    },
    [awardGymXp],
  );

  const setTarget = useCallback((ml: number) => {
    setWater(setWaterTarget(getSnapshot(), ml));
  }, []);

  return { water, todayMl: todayWater(water), drink, setTarget };
}