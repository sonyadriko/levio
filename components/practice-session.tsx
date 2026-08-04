"use client";

import { useEffect, useMemo, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { ProgressBar } from "@/components/progress-bar";
import { Pill } from "@/components/pill";
import { Confetti } from "@/components/confetti";
import { allLevels } from "@/lib/hsk/levels";
import { countWordsByLevel } from "@/lib/hsk";
import { useLevelWords } from "@/lib/hsk/use-level-words";
import { useCountUp } from "@/lib/use-count-up";
import type { HskLevel } from "@/lib/hsk/types";

export const SESSION_SIZE = 8;
export const XP_PER_CORRECT = 5;

export interface ChoiceQ {
  id: string;
  prompt?: string;
  options: string[];
  answer: string;
  passage?: { hanzi: string; pinyin: string; meaning: string }[];
}

// Sesi latihan pilihan ganda generik (listening & reading):
// pilih level -> jawab soal berurutan -> hasil + XP.
export function ChoicePracticeSession({
  build,
  renderPrompt,
  onQuestionChange,
  titleKey,
  subtitleKey,
  startKey,
  sessionHintKey,
  questionKey,
  correctKey,
  wrongKey,
  nextKey,
  doneCtaKey,
  doneKey,
  scoreKey,
  againKey,
}: {
  build: (words: import("@/lib/hsk/types").VocabWord[], level: HskLevel) => ChoiceQ[];
  renderPrompt: (q: ChoiceQ, level: HskLevel) => React.ReactNode;
  onQuestionChange?: (q: ChoiceQ, level: HskLevel) => void;
  titleKey: string;
  subtitleKey: string;
  startKey: string;
  sessionHintKey: string;
  questionKey: string;
  correctKey: string;
  wrongKey: string;
  nextKey: string;
  doneCtaKey: string;
  doneKey: string;
  scoreKey: string;
  againKey: string;
}) {
  const { awardXp } = useProgress();
  const { t } = useLanguage();

  const [level, setLevel] = useState<HskLevel>(1);
  const [session, setSession] = useState<ChoiceQ[] | null>(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const words = useLevelWords(level);

  const questionCount = useMemo(
    () => (words.length > 0 ? build(words, level).length : 0),
    [words, level, build],
  );

  const activeQuestion = session?.[index];
  const doneCorrect = done ? correct : 0;
  const doneXp = done ? xpEarned : 0;
  const shownCorrect = useCountUp(doneCorrect);
  const shownXp = useCountUp(doneXp);

  useEffect(() => {
    if (activeQuestion && session && !done) {
      onQuestionChange?.(activeQuestion, level);
    }
  }, [activeQuestion, session, done, level, onQuestionChange]);

  const start = () => {
    const questions = build(words, level);
    if (questions.length === 0) return;
    setSession(questions);
    setIndex(0);
    setCorrect(0);
    setPicked(null);
    setDone(false);
    setXpEarned(0);
  };

  if (!session || done) {
    const available = words.length > 0;
    return (
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {t("mock.level")}
          </label>
          <div className="flex flex-wrap gap-2">
            {allLevels().map((l) => {
              const hasData = countWordsByLevel(l) > 0;
              return (
                <Pill
                  key={l}
                  selected={level === l}
                  disabled={!hasData}
                  onClick={() => setLevel(l)}
                >
                  HSK {l}
                </Pill>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
          <h2 className="text-base font-semibold">{t(titleKey)}</h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {t(subtitleKey)}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            {t(sessionHintKey, { n: Math.min(SESSION_SIZE, questionCount) })}
          </p>
          <button
            onClick={start}
            disabled={!available || questionCount === 0}
            className="mt-4 h-11 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish disabled:cursor-not-allowed disabled:opacity-40"
          >
            {!available || questionCount === 0
              ? t("common.loading")
              : t(startKey)}
          </button>
        </div>
      </section>
    );
  }

  const current = session[index];
  if (!current) return null;

  const isAnswered = picked !== null;
  const isCorrect = picked === current.answer;
  const pct = ((index + 1) / session.length) * 100;

  const advance = () => {
    if (index + 1 >= session.length) {
      const xp = correct * XP_PER_CORRECT;
      awardXp(xp);
      setXpEarned(xp);
      setDone(true);
    } else {
      setIndex(index + 1);
      setPicked(null);
    }
  };

  if (done) {
    const pct = session.length > 0 ? Math.round((correct / session.length) * 100) : 0;
    return (
      <section className="animate-card-in rounded-2xl border border-stone-200 bg-white p-5 text-center dark:border-stone-800 dark:bg-stone-950">
        <Confetti />
        <p className="text-base font-bold">{t(doneKey)}</p>
        <p className="mt-2 text-4xl font-black tracking-tight text-teal-600 dark:text-teal-400">
          {pct}%
        </p>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {t(scoreKey, { c: shownCorrect, t: session.length, xp: shownXp })}
        </p>
        <button
          onClick={start}
          className="mt-4 h-11 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish"
        >
          {t(againKey)}
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
        <h2 className="text-base font-semibold text-stone-900 dark:text-white">
          {t(titleKey)}
        </h2>
        <span className="tabular-nums">
          {t(questionKey, { i: index + 1, t: session.length })}
        </span>
      </div>
      <ProgressBar value={pct} />

      <div key={current.id} className="animate-card-in flex flex-col gap-4">
        {renderPrompt(current, level)}

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {current.options.map((option) => {
            const optionCorrect = option === current.answer;
            const optionPicked = option === picked;
            let style =
              "border-stone-200 bg-white text-stone-700 hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-teal-700";
            if (isAnswered) {
              if (optionCorrect)
                style =
                  "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
              else if (optionPicked)
                style =
                  "border-red-500 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-500/10 dark:text-red-400";
              else
                style =
                  "border-stone-200 bg-white text-stone-400 opacity-60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-500";
            }
            return (
              <li key={option}>
                <button
                  disabled={isAnswered}
                  onClick={() => {
                    if (picked !== null) return;
                    setPicked(option);
                    if (option === current.answer) setCorrect((c) => c + 1);
                  }}
                  className={`flex min-h-12 w-full items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors active:scale-[0.98] disabled:cursor-default ${style}`}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>

        {isAnswered && (
          <div className="flex items-center justify-between gap-3">
            <p
              className={`text-sm font-medium ${
                isCorrect
                  ? "animate-pop text-emerald-600 dark:text-emerald-400"
                  : "animate-shake text-red-500"
              }`}
            >
              {isCorrect
                ? t(correctKey)
                : t(wrongKey, { answer: current.answer })}
            </p>
            <button
              onClick={advance}
              className="h-11 shrink-0 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish"
            >
              {index + 1 >= session.length ? t(doneCtaKey) : t(nextKey)}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
