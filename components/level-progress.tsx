"use client";

import { useProgress } from "@/components/progress-provider";
import type { HskLevel } from "@/lib/hsk/types";
import { countWordsByLevel } from "@/lib/hsk";

function levelWordsFromProgress(
  progress: ReturnType<typeof useProgress>["progress"],
  level: HskLevel,
): { reviewed: number; mastered: number } {
  const prefix = `hsk${level}-`;
  let reviewed = 0;
  let mastered = 0;
  for (const [id, wp] of Object.entries(progress.words)) {
    if (!id.startsWith(prefix)) continue;
    reviewed += 1;
    if (wp.mastered) mastered += 1;
  }
  return { reviewed, mastered };
}

export function LevelProgress({ level }: { level: HskLevel }) {
  const { progress } = useProgress();

  const total = countWordsByLevel(level);
  const { reviewed, mastered } = progress
    ? levelWordsFromProgress(progress, level)
    : { reviewed: 0, mastered: 0 };
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
          {reviewed}/{total}
        </span>
      </div>
    </div>
  );
}
