"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import type { KanaAlphabet, KanaGroup, KanaItem } from "@/lib/japanese/kana";
import { kanaByAlphabet } from "@/lib/japanese/kana";
import type { KanaProgress } from "@/lib/kana-progress";
import { markKanaKnown } from "@/lib/kana-progress";

const SESSION_SIZE = 20;
const KNOWN_AFTER = 2;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sampleOptions(
  correct: KanaItem,
  pool: KanaItem[],
  pick: (i: KanaItem) => string,
): string[] {
  const answer = pick(correct);
  const distractors = shuffle(
    pool.filter((i) => pick(i) !== answer && i.kana !== correct.kana),
  )
    .slice(0, 3)
    .map(pick);
  return shuffle([answer, ...distractors]);
}

export function KanaDrill({
  alphabet,
  group,
  progress,
  onChange,
  onExit,
  onRestart,
}: {
  alphabet: KanaAlphabet;
  group: KanaGroup;
  progress: KanaProgress;
  onChange: (next: KanaProgress) => void;
  onExit: () => void;
  onRestart: () => void;
}) {
  const { t } = useLanguage();
  const alphabetPool = useMemo(() => kanaByAlphabet(alphabet), [alphabet]);

  const initial = useMemo(() => {
    const groupItems = alphabetPool.filter((i) => i.group === group);
    return shuffle(groupItems).slice(0, SESSION_SIZE);
  }, [alphabetPool, group]);

  const [queue] = useState<KanaItem[]>(initial);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<"kana" | "romaji">(() =>
    Math.random() < 0.5 ? "kana" : "romaji",
  );
  const [options, setOptions] = useState<string[]>(() => {
    const item = initial[0];
    if (!item) return [];
    return sampleOptions(item, alphabetPool, (i) =>
      direction === "kana" ? i.romaji : i.kana,
    );
  });
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<"question" | "feedback">("question");
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionHits, setSessionHits] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const current = queue[index];
  if (!current) return null;
  const isKanaPrompt = direction === "kana";
  const answerValue = isKanaPrompt ? current.romaji : current.kana;

  const answer = (value: string) => {
    if (phase !== "question") return;
    const isCorrect = value === answerValue;
    setSelected(value);
    setPhase("feedback");
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      const hits = (sessionHits[current.kana] ?? 0) + 1;
      setSessionHits((h) => ({ ...h, [current.kana]: hits }));
      if (hits >= KNOWN_AFTER) {
        onChange(markKanaKnown(progress, alphabet, current.kana));
      }
    }
  };

  const next = () => {
    if (index + 1 >= queue.length) {
      setDone(true);
      return;
    }
    const item = queue[index + 1];
    const dir = Math.random() < 0.5 ? "kana" : "romaji";
    setDirection(dir);
    setOptions(
      sampleOptions(item, alphabetPool, (i) =>
        dir === "kana" ? i.romaji : i.kana,
      ),
    );
    setSelected(null);
    setPhase("question");
    setIndex((i) => i + 1);
  };

  if (done) {
    return (
      <div className="animate-slide-up rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <p className="text-3xl font-black tracking-tight text-teal-600 dark:text-teal-400">
          {correctCount}/{queue.length}
        </p>
        <p className="mt-2 text-sm font-medium text-stone-600 dark:text-stone-300">
          {t("kana.drillSummary", {
            correct: correctCount,
            total: queue.length,
          })}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onExit}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
          >
            {t("kana.back")}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            {t("kana.repeat")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          {index + 1}/{queue.length}
        </span>
        <span>
          {t("kana.knownCount", {
            known: progress[alphabet].length,
            total: alphabetPool.length,
          })}
        </span>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
          {isKanaPrompt
            ? t("kana.whichRomaji", { romaji: current.kana })
            : t("kana.whichKana", { kana: current.romaji })}
        </p>
        <p className="mt-4 text-6xl font-black tracking-tight">
          {isKanaPrompt ? current.kana : current.romaji}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const isCorrectOption = option === answerValue;
          const isSelected = selected === option;
          const revealed = phase === "feedback";
          const stateClass = !revealed
            ? "border-stone-200 bg-white text-stone-800 hover:border-teal-300 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:hover:border-teal-700"
            : isCorrectOption
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : isSelected
                ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/40 dark:text-red-300"
                : "border-stone-200 bg-white text-stone-500 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-500";
          return (
            <button
              key={option}
              type="button"
              disabled={revealed}
              onClick={() => answer(option)}
              className={`flex h-16 items-center justify-center rounded-xl border text-lg font-bold transition-colors btn-squish ${stateClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {phase === "feedback" && (
        <div
          className={`animate-slide-up rounded-2xl border p-4 ${
            selected === answerValue
              ? "border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/40"
              : "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/40"
          }`}
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
            <Icon
              name="check"
              className={`h-4 w-4 ${
                selected === answerValue
                  ? "text-emerald-600"
                  : "text-red-500"
              }`}
            />
            {selected === answerValue
              ? t("kana.correct")
              : t("kana.wrong", { answer: answerValue })}
          </p>
          <button
            type="button"
            onClick={next}
            className="mt-3 h-11 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            {t("kana.next")}
          </button>
        </div>
      )}
    </div>
  );
}
