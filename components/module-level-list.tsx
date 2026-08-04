"use client";

import Link from "next/link";
import { BackLink } from "@/components/back-link";
import { Icon } from "@/components/icons";
import { LevelProgress } from "@/components/level-progress";
import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";
import { useProgress } from "@/components/progress-provider";
import { getLanguageModule } from "@/lib/languages";
import { getModuleThemes } from "@/lib/languages/themes";
import { unlockedFor } from "@/lib/progress";
import type { IconName } from "@/lib/nav";

export function ModuleLevelList({ moduleId }: { moduleId: string }) {
  const { progress } = useProgress();
  const languageModule = getLanguageModule(moduleId);
  const moduleThemes = getModuleThemes(moduleId);
  const themes = moduleThemes?.packs ?? [];
  if (!languageModule) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackLink href="/learn" labelKey="learn.backToModules" />
        <PageHeader
          icon="book"
          title={<T id={languageModule.nameKey} />}
          subtitle={
            <T
              id="learn.subtitle"
              vars={{ n: languageModule.totalWordCount() }}
            />
          }
        />
      </div>

      {themes.length > 0 && (
        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            <T id="theme.packs" />
          </p>
          {themes.map((theme) => (
            <Link
              key={theme.id}
              href={`/learn/${languageModule.id}/themes/${theme.id}`}
              className="flex items-center gap-4 rounded-xl border border-violet-200 bg-violet-50/60 p-4 transition-colors hover:border-violet-300 dark:border-violet-900 dark:bg-violet-950/40 dark:hover:border-violet-700"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-700 text-white">
                <Icon name={theme.icon as IconName} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  <T id={theme.titleKey} />
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  <T id={theme.descKey} />
                </p>
              </div>
              <span className="shrink-0 text-xs font-medium text-stone-400">
                <T id="learn.wordCount" vars={{ n: theme.words.length }} />
              </span>
              <span className="shrink-0 text-stone-300 dark:text-stone-700">→</span>
            </Link>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3">
        {languageModule.script && (
          <Link
            href={languageModule.script.path}
            className="flex items-center gap-4 rounded-xl border border-teal-200 bg-teal-50/60 p-4 transition-colors hover:border-teal-300 dark:border-teal-800 dark:bg-teal-950/40 dark:hover:border-teal-700"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-lg font-bold text-white">
              {languageModule.script.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                <T id={languageModule.script.titleKey} />
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                <T id={languageModule.script.descKey} />
              </p>
            </div>
            <span className="shrink-0 text-stone-300 dark:text-stone-700">→</span>
          </Link>
        )}
        {languageModule.levels().map((meta) => {
          const locked = meta.index > unlockedFor(progress, languageModule.id);
          return (
            <Link
              key={meta.index}
              href={`/learn/${languageModule.id}/${meta.index}`}
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
                    {locked ? <Icon name="lock" className="h-5 w-5" /> : meta.name}
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
                          vars={{
                            name: languageModule.levelName(meta.index - 1),
                          }}
                        />
                      </p>
                    ) : (
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        <T id={languageModule.levelDescriptionKey(meta.index)} />
                      </p>
                    )}
                  </div>
                </div>
                <span className="shrink-0 text-sm font-medium text-stone-400">
                  <T
                    id="learn.wordCount"
                    vars={{ n: languageModule.countWordsByLevel(meta.index) }}
                  />
                </span>
              </div>
              {!locked && (
                <div className="mt-3">
                  <LevelProgress
                    module={languageModule}
                    level={meta.index}
                  />
                </div>
              )}
            </Link>
          );
        })}
      </section>
    </div>
  );
}
