"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import { ProgressBar } from "@/components/progress-bar";
import { getSentencesByLevel, type ExampleSentence } from "@/lib/hsk/sentences";
import type { HskLevel } from "@/lib/hsk/types";

const SESSION_SIZE = 10;
const XP_PER_CORRECT = 5;

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildOptions(
  all: ExampleSentence[],
  answer: ExampleSentence,
): string[] {
  const pool = [...new Set(all.map((s) => s.meaning))].filter(
    (m) => m !== answer.meaning,
  );
  const distractors = shuffle(pool).slice(0, 3);
  return shuffle([answer.meaning, ...distractors]);
}

// Latihan pemahaman kalimat: baca hanzi (+pinyin), pilih artinya.
// Retensi lebih baik lewat konteks kalimat daripada hafalan kata terisolasi
// (Mulder et al., 2018).
export function SentencePractice({ level }: { level: HskLevel }) {
  const { awardXp } = useProgress();
  const { t } = useLanguage();

  const all = useMemo(() => getSentencesByLevel(level), [level]);
  const [session, setSession] = useState<ExampleSentence[] | null>(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const current = session?.[index];
  const options = useMemo(
    () => (current ? buildOptions(all, current) : []),
    [current, all],
  );

  if (all.length === 0) return null;

  const start = () => {
    setSession(shuffle(all).slice(0, Math.min(SESSION_SIZE, all.length)));
    setIndex(0);
    setCorrect(0);
    setPicked(null);
    setDone(false);
    setXpEarned(0);
  };

  const pick = (option: string) => {
    if (picked !== null || !current) return;
    setPicked(option);
    if (option === current.meaning) setCorrect((c) => c + 1);
  };

  const advance = () => {
    if (!session) return;
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

  if (!session || done) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{t("sentence.title")}</h2>
          <span className="text-xs font-medium text-stone-500">
            <Icon name="pen" className="mr-1 inline h-3.5 w-3.5" />
            {t("sentence.count", { n: all.length })}
          </span>
        </div>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-500">
          {t("sentence.subtitle")}
        </p>
        {done ? (
          <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-500/10">
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {t("sentence.done")}
            </p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-500">
              {t("sentence.score", {
                c: correct,
                t: session?.length ?? 0,
                xp: xpEarned,
              })}
            </p>
          </div>
        ) : (
          <p className="mt-1 text-xs text-stone-500">
            {t("sentence.sessionHint", {
              n: Math.min(SESSION_SIZE, all.length),
            })}
          </p>
        )}
        <button
          onClick={start}
          className="mt-4 h-11 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
        >
          {done ? t("sentence.again") : t("sentence.start")}
        </button>
      </section>
    );
  }

  if (!current) return null;

  const isAnswered = picked !== null;
  const isCorrect = picked === current.meaning;
  const pct = ((index + 1) / session.length) * 100;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-500">
        <h2 className="text-base font-semibold text-stone-900 dark:text-white">
          {t("sentence.title")}
        </h2>
        <span className="tabular-nums">
          {t("sentence.question", { i: index + 1, t: session.length })}
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar value={pct} />
      </div>

      <div key={current.id} className="animate-card-in mt-4 flex flex-col gap-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center dark:border-stone-800 dark:bg-stone-900">
          <p className="text-2xl font-bold tracking-tight">{current.hanzi}</p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-500">
            {current.pinyin}
          </p>
        </div>
        <p className="text-center text-sm font-medium">
          {t("sentence.meaningOf")}
        </p>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map((option) => {
            const optionCorrect = option === current.meaning;
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
                  "border-stone-200 bg-white text-stone-500 opacity-60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-500";
            }
            return (
              <li key={option}>
                <button
                  disabled={isAnswered}
                  onClick={() => pick(option)}
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
                ? t("sentence.correct")
                : t("sentence.wrong", { answer: current.meaning })}
            </p>
            <button
              onClick={advance}
              className="h-11 shrink-0 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
            >
              {index + 1 >= session.length
                ? t("sentence.doneCta")
                : t("sentence.next")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
