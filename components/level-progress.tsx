"use client";

import { useProgress } from "@/components/progress-provider";
import type { HskLevel } from "@/lib/hsk/types";
import { countWordsByLevel, getWordsByLevel } from "@/lib/hsk";

export function LevelProgress({ level }: { level: HskLevel }) {
  const { progress } = useProgress();

  const total = countWordsByLevel(level);
  const learned = progress
    ? getWordsByLevel(level).filter((w) => progress.words[w.id]).length
    : 0;
  const mastered = progress
    ? getWordsByLevel(level).filter((w) => progress.words[w.id]?.mastered)
        .length
    : 0;
  const masteredPct = total === 0 ? 0 : Math.round((mastered / total) * 100);

  return (
    <div>
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${masteredPct}%` }}
            title={`${mastered}/${total} dikuasai`}
          />
        </div>
        <span className="text-xs font-medium text-stone-400">
          {learned}/{total}
        </span>
      </div>
    </div>
  );
}
