"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { ProgressBar } from "@/components/progress-bar";
import { Pill } from "@/components/pill";
import { allLevels } from "@/lib/hsk/levels";
import { countWordsByLevel } from "@/lib/hsk";
import { useLevelWords } from "@/lib/hsk/use-level-words";
import { generateOrderQuestions, type OrderQuestion } from "@/lib/hsk/exercises";
import type { HskLevel } from "@/lib/hsk/types";

const SESSION_SIZE = 8;
const XP_PER_CORRECT = 5;

interface PlacedChunk {
  key: string;
  text: string;
}

// Susun Kalimat: urutkan potongan kata menjadi kalimat yang benar.
export function SentenceBuilder() {
  const { awardXp } = useProgress();
  const { t } = useLanguage();

  const [level, setLevel] = useState<HskLevel>(1);
  const words = useLevelWords(level);

  const [session, setSession] = useState<OrderQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [placed, setPlaced] = useState<PlacedChunk[]>([]);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  const current = session?.[index];
  const remaining = useMemo(() => {
    if (!current) return [];
    const usedCounts = new Map<string, number>();
    for (const p of placed) {
      usedCounts.set(p.text, (usedCounts.get(p.text) ?? 0) + 1);
    }
    const totalCounts = new Map<string, number>();
    for (const c of current.chunks) {
      totalCounts.set(c, (totalCounts.get(c) ?? 0) + 1);
    }
    return current.chunks.filter(
      (chunk) => (usedCounts.get(chunk) ?? 0) < (totalCounts.get(chunk) ?? 0),
    );
  }, [current, placed]);

  const start = () => {
    const questions = generateOrderQuestions(words, level, SESSION_SIZE);
    if (questions.length === 0) return;
    setSession(questions);
    setIndex(0);
    setCorrect(0);
    setPlaced([]);
    setChecked(false);
    setDone(false);
    setXpEarned(0);
  };

  if (!session || done) {
    const available = words.length > 0;
    const questionCount =
      words.length > 0 ? generateOrderQuestions(words, level, SESSION_SIZE).length : 0;
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
          <h2 className="text-base font-semibold">{t("builder.title")}</h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {t("builder.subtitle")}
          </p>
          <p className="mt-1 text-xs text-stone-400">
            {t("builder.sessionHint", {
              n: Math.min(SESSION_SIZE, questionCount),
            })}
          </p>
          <button
            onClick={start}
            disabled={!available || questionCount === 0}
            className="mt-4 h-11 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {!available || questionCount === 0
              ? t("common.loading")
              : t("builder.start")}
          </button>
        </div>
      </section>
    );
  }

  if (!current) return null;

  const isCorrectOrder =
    placed.map((p) => p.text).join("") === current.answer.join("");
  const pct = ((index + 1) / session.length) * 100;

  const placeChunk = (chunk: string) => {
    if (checked) return;
    setPlaced((prev) => [
      ...prev,
      { key: `${chunk}-${prev.length}-${Date.now()}`, text: chunk },
    ]);
  };

  const removeChunk = (key: string) => {
    if (checked) return;
    setPlaced((prev) => prev.filter((p) => p.key !== key));
  };

  const check = () => {
    if (checked) return;
    setChecked(true);
    if (isCorrectOrder) setCorrect((c) => c + 1);
  };

  const advance = () => {
    if (index + 1 >= session.length) {
      const xp = correct * XP_PER_CORRECT;
      awardXp(xp);
      setXpEarned(xp);
      setDone(true);
    } else {
      setIndex(index + 1);
      setPlaced([]);
      setChecked(false);
    }
  };

  if (done) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5 text-center dark:border-stone-800 dark:bg-stone-950">
        <p className="text-base font-bold">{t("builder.done")}</p>
        <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
          {t("builder.score", { c: correct, t: session.length, xp: xpEarned })}
        </p>
        <button
          onClick={start}
          className="mt-4 h-11 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
        >
          {t("builder.again")}
        </button>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
        <h2 className="text-base font-semibold text-stone-900 dark:text-white">
          {t("builder.title")}
        </h2>
        <span className="tabular-nums">
          {t("builder.question", { i: index + 1, t: session.length })}
        </span>
      </div>
      <ProgressBar value={pct} />

      <div key={current.id} className="animate-card-in flex flex-col gap-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
            {t("builder.prompt")}
          </p>
          {checked && (
            <div className="mt-3">
              <p className="text-xl font-bold tracking-tight">{current.sentence}</p>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                {current.pinyin}
              </p>
              <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
                {current.meaning}
              </p>
            </div>
          )}
        </div>

        <div className="flex min-h-16 flex-wrap items-center gap-2 rounded-xl border border-dashed border-stone-300 p-3 dark:border-stone-700">
          {placed.length === 0 && !checked && (
            <span className="text-xs text-stone-400">{t("builder.tapHint")}</span>
          )}
          {placed.map((p) => (
            <button
              key={p.key}
              onClick={() => removeChunk(p.key)}
              className={`h-10 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                checked
                  ? "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-900/40 dark:text-teal-300"
                  : "border-stone-300 bg-white text-stone-800 active:scale-[0.95] dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100"
              }`}
            >
              {p.text}
            </button>
          ))}
        </div>

        <div className="flex min-h-16 flex-wrap items-center gap-2">
          {remaining.map((chunk, i) => (
            <button
              key={`${chunk}-${i}`}
              onClick={() => placeChunk(chunk)}
              disabled={checked}
              className="h-10 rounded-lg border border-stone-300 bg-white px-3 text-sm font-semibold text-stone-800 transition-colors hover:border-teal-400 hover:text-teal-700 active:scale-[0.95] disabled:cursor-default disabled:opacity-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:hover:border-teal-600 dark:hover:text-teal-300"
            >
              {chunk}
            </button>
          ))}
        </div>

        {!checked && (
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setPlaced([])}
              className="h-11 shrink-0 rounded-xl border border-stone-200 px-4 text-sm font-medium text-stone-500 transition-colors hover:border-red-300 hover:text-red-500 dark:border-stone-800 dark:text-stone-400"
            >
              {t("builder.clear")}
            </button>
            <button
              onClick={check}
              disabled={placed.length === 0}
              className="h-11 rounded-xl bg-teal-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("builder.check")}
            </button>
          </div>
        )}

        {checked && (
          <div className="flex items-center justify-between gap-3">
            <p
              className={`text-sm font-medium ${
                isCorrectOrder
                  ? "animate-pop text-emerald-600 dark:text-emerald-400"
                  : "animate-shake text-red-500"
              }`}
            >
              {isCorrectOrder
                ? t("builder.correct")
                : t("builder.wrong", { answer: current.sentence })}
            </p>
            <button
              onClick={advance}
              className="h-11 shrink-0 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
            >
              {index + 1 >= session.length ? t("builder.doneCta") : t("builder.next")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
