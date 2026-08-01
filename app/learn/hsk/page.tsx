"use client";

import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { Icon } from "@/components/icons";
import { LevelProgress } from "@/components/level-progress";
import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";
import { useProgress } from "@/components/progress-provider";
import { hskLevels } from "@/lib/hsk/levels";
import { countWordsByLevel, totalWordCount } from "@/lib/hsk";

export default function HskPage() {
  const { progress } = useProgress();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackLink href="/learn" labelKey="learn.backToModules" />
        <PageHeader
          icon="book"
          title={<T id="learn.title" />}
          subtitle={<T id="learn.subtitle" vars={{ n: totalWordCount() }} />}
        />
      </div>

      <section className="flex flex-col gap-3">
        {hskLevels.map((meta) => {
          const locked = meta.level > progress.unlockedUpTo;
          return (
            <Link
              key={meta.level}
              href={`/learn/hsk/${meta.level}`}
              className="rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-teal-700"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      locked
                        ? "bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-500"
                        : "bg-teal-700 text-white"
                    }`}
                  >
                    {locked ? (
                      <Icon name="lock" className="h-5 w-5" />
                    ) : (
                      meta.level
                    )}
                  </span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${
                        locked ? "text-stone-400 dark:text-stone-500" : ""
                      }`}
                    >
                      {meta.name}
                    </p>
                    {locked ? (
                      <p className="text-xs text-stone-400">
                        <T
                          id="level.unlockHint"
                          vars={{ n: meta.level - 1 }}
                        />
                      </p>
                    ) : (
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        <T id={`levelDesc.${meta.level}`} />
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium text-stone-400">
                  <T
                    id="learn.wordCount"
                    vars={{ n: countWordsByLevel(meta.level) }}
                  />
                </span>
              </div>
              {!locked && (
                <div className="mt-3">
                  <LevelProgress level={meta.level} />
                </div>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
