"use client";

import Link from "next/link";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import { Lesson } from "@/components/lesson";
import { LevelTest } from "@/components/level-test";
import { SentencePractice } from "@/components/sentence-practice";
import { WordList } from "@/components/word-list";
import { useLevelWords } from "@/lib/hsk/use-level-words";
import { MAX_HSK_LEVEL } from "@/lib/progress";
import type { HskLevel } from "@/lib/hsk/types";

// Konten dinamis halaman level: memutuskan terkunci/terbuka, menampilkan
// pelajaran, latihan kalimat, daftar kata, dan tes kelulusan (wisuda).
export function LevelContent({ level }: { level: HskLevel }) {
  const { progress, recordLevelPass } = useProgress();
  const { t } = useLanguage();
  const words = useLevelWords(level);

  const locked = level > progress.unlockedUpTo;

  if (locked) {
    const prev = (level - 1) as HskLevel;
    return (
      <section className="flex flex-col gap-4">
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-6 text-center dark:border-stone-700 dark:bg-stone-950">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
            <Icon name="lock" className="h-6 w-6 text-stone-400" />
          </span>
          <h2 className="mt-3 text-lg font-bold">
            {t("level.gateTitle", { level })}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">
            {t("level.gateDesc", { level, prev })}
          </p>
        </div>
        <LevelTest
          level={prev}
          variant="gate"
          onPass={() => recordLevelPass(prev)}
        />
      </section>
    );
  }

  const frontier = progress.unlockedUpTo === level;
  const next = Math.min(MAX_HSK_LEVEL, level + 1);

  return (
    <div className="flex flex-col gap-6">
      <Lesson level={level} />
      <SentencePractice level={level} />
      <WordList words={words} />

      {frontier && (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-teal-300 bg-teal-50/60 p-4 dark:border-teal-800 dark:bg-teal-950/40">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900">
              <Icon name="check" className="h-5 w-5 text-teal-700 dark:text-teal-400" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">
                {t("level.graduateTitle", { level })}
              </h2>
              <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                {t("level.graduateDesc", { level, next })}
              </p>
            </div>
          </div>
          <LevelTest
            level={level}
            variant="graduate"
            onPass={() => recordLevelPass(level)}
          />
        </div>
      )}

      {progress.unlockedUpTo === next && next !== level && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/40">
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            {t("level.unlockedNext", { next })}
          </p>
          <Link
            href={`/learn/hsk/${next}`}
            className="mt-2 inline-flex h-10 items-center rounded-xl border border-emerald-300 px-4 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 active:scale-[0.98] dark:border-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900"
          >
            {t("level.continueTo", { next })}
          </Link>
        </div>
      )}
    </div>
  );
}
