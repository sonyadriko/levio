"use client";

import { useMemo, useRef, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import { ProgressBar } from "@/components/progress-bar";
import { Pill } from "@/components/pill";
import { getWordsByLevel } from "@/lib/hsk";
import { allLevels, getLevelMeta } from "@/lib/hsk/levels";
import { todayKey } from "@/lib/date";
import type { HskLevel, VocabWord } from "@/lib/hsk/types";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function FlashcardDeck() {
  const { progress, recordReview } = useProgress();
  const { t } = useLanguage();
  const [level, setLevel] = useState<HskLevel>(1);
  const [flipped, setFlipped] = useState(false);
  const submitting = useRef(false);
  const [session, setSession] = useState<{
    deck: VocabWord[];
    index: number;
    correct: number;
    xp: number;
  } | null>(null);

  const dueWords = useMemo(() => {
    const today = todayKey();
    return getWordsByLevel(level).filter((w) => {
      const wp = progress.words[w.id];
      return !wp || !wp.nextReview || wp.nextReview <= today;
    });
  }, [level, progress]);

  const startSession = (reviewAll = false) => {
    const deck = shuffle(reviewAll ? getWordsByLevel(level) : dueWords);
    setSession({ deck, index: 0, correct: 0, xp: 0 });
    setFlipped(false);
  };

  const answer = (correct: boolean) => {
    if (!session || submitting.current) return;
    submitting.current = true;
    const word = session.deck[session.index];
    recordReview(word, correct);
    setSession({
      ...session,
      correct: session.correct + (correct ? 1 : 0),
      xp: session.xp + (correct ? 10 : 3),
      index: session.index + 1,
    });
    setFlipped(false);
    queueMicrotask(() => {
      submitting.current = false;
    });
  };

  if (!session) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {allLevels().map((l) => (
            <Pill
              key={l}
              selected={level === l}
              disabled={getWordsByLevel(l).length === 0}
              onClick={() => setLevel(l)}
            >
              HSK {l}
            </Pill>
          ))}
        </div>

        {dueWords.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-950">
            <Icon name="pen" className="mx-auto h-8 w-8 text-stone-400" />
            <p className="mt-3 text-sm font-medium text-stone-600 dark:text-stone-300">
              {t("deck.noDue", { level: getLevelMeta(level).name })}
            </p>
            <button
              onClick={() => startSession(true)}
              className="mt-4 h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97] sm:w-auto sm:px-8"
            >
              {t("deck.reviewAll")}
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-950">
            <Icon name="pen" className="mx-auto h-8 w-8 text-stone-400" />
            <p className="mt-3 text-sm font-medium text-stone-600 dark:text-stone-300">
              {t("deck.due", {
                n: dueWords.length,
                level: getLevelMeta(level).name,
              })}
            </p>
            <p className="mt-1 text-xs text-stone-400">{t("deck.tapHint")}</p>
            <button
              onClick={() => startSession()}
              className="mt-4 h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97] sm:w-auto sm:px-8"
            >
              {t("deck.start")}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (session.index >= session.deck.length) {
    const total = session.deck.length;
    const pct = total > 0 ? Math.round((session.correct / total) * 100) : 0;
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-950">
        <p className="text-lg font-bold">{t("deck.done")}</p>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {t("deck.summary", {
            c: session.correct,
            t: total,
            p: pct,
            xp: session.xp,
          })}
        </p>
        <button
          onClick={() => (dueWords.length === 0 ? setSession(null) : startSession())}
          className="mt-5 h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97] sm:w-auto sm:px-8"
        >
          {t("deck.again")}
        </button>
      </div>
    );
  }

  const word = session.deck[session.index];
  const progressCount = session.index + 1;
  const total = session.deck.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
        <span>
          {t("deck.card", { i: progressCount, t: total })}
        </span>
        <span>+{session.xp} {t("common.xp")}</span>
      </div>
      <ProgressBar value={(progressCount / total) * 100} />

      <div key={word.id} className="animate-card-in">
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          aria-label={t(flipped ? "deck.tapBack" : "deck.tapFlip")}
          className="relative block h-72 w-full [perspective:1000px]"
        >
          <span
            className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          >
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white p-8 text-center [backface-visibility:hidden] dark:border-stone-800 dark:bg-stone-950">
              <span className="text-5xl font-bold tracking-tight">
                {word.hanzi}
              </span>
              <span className="mt-4 text-xs text-stone-400">
                {t("deck.tapFlip")}
              </span>
            </span>
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-teal-300 bg-teal-50 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-teal-700 dark:bg-teal-600/10">
              <span className="text-4xl font-bold">{word.pinyin}</span>
              <span className="mt-2 text-xl font-semibold text-stone-700 dark:text-stone-200">
                {word.meaning}
              </span>
              {word.example && (
                <p className="mt-4 text-sm text-stone-500 dark:text-stone-400">
                  {word.example}
                  {word.exampleMeaning && (
                    <span className="block text-xs">
                      {word.examplePinyin} · {word.exampleMeaning}
                    </span>
                  )}
                </p>
              )}
              <span className="mt-4 text-xs text-teal-600">
                {t("deck.tapBack")}
              </span>
            </span>
          </span>
        </button>
      </div>

      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => answer(false)}
            className="flex h-14 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-600 transition-colors hover:border-red-300 hover:text-red-600 active:scale-[0.97] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
          >
            <Icon name="check" className="h-5 w-5 rotate-90" />
            {t("deck.notMemorized")}
          </button>
          <button
            onClick={() => answer(true)}
            className="flex h-14 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 active:scale-[0.97]"
          >
            <Icon name="check" className="h-5 w-5" />
            {t("deck.memorized")}
          </button>
        </div>
      )}
    </div>
  );
}
