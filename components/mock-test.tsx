"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import { ProgressBar } from "@/components/progress-bar";
import { Pill } from "@/components/pill";
import { testXp } from "@/lib/progress";
import { countWordsByLevel } from "@/lib/hsk";
import { useLevelWords } from "@/lib/hsk/use-level-words";
import { allLevels, getLevelMeta } from "@/lib/hsk/levels";
import {
  generateMockTest,
  type MockQuestion,
  type QuestionType,
} from "@/lib/hsk/mock-test";
import type { HskLevel } from "@/lib/hsk/types";

const QUESTION_COUNTS = [10, 20, 40];
const TIME_OPTIONS = [
  { labelKey: "mock.time5", seconds: 5 * 60 },
  { labelKey: "mock.time10", seconds: 10 * 60 },
  { labelKey: "mock.time15", seconds: 15 * 60 },
];

interface QuizResult {
  correct: number;
  total: number;
  xp: number;
  answers: Record<string, string>;
  questions: MockQuestion[];
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function ResultView({
  result,
  onRetake,
}: {
  result: QuizResult;
  onRetake: () => void;
}) {
  const { t } = useLanguage();
  const pct = Math.round((result.correct / result.total) * 100);
  const shownPct = useCountUp(pct);
  const shownXp = useCountUp(result.xp, 900);
  const byType = new Map<QuestionType, { correct: number; total: number }>();
  result.questions.forEach((q) => {
    const cur = byType.get(q.type) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (result.answers[q.id] === q.answer) cur.correct += 1;
    byType.set(q.type, cur);
  });
  const missed = result.questions.filter(
    (q) => result.answers[q.id] !== q.answer,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="animate-slide-up rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <p className="text-lg font-bold">
          {t("mock.score", {
            p: shownPct,
            c: result.correct,
            t: result.total,
          })}
        </p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          +{shownXp} {t("common.xp")} ·{" "}
          {pct >= 60 ? t("mock.pass") : t("mock.fail")}
        </p>
        <button
          onClick={onRetake}
          className="mt-4 h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97] sm:w-auto sm:px-8"
        >
          {t("mock.retake")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...byType.entries()].map(([type, v]) => (
          <div
            key={type}
            className="rounded-xl border border-stone-200 bg-white p-3 text-center dark:border-stone-800 dark:bg-stone-950"
          >
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {t(`qtype.${type}`)}
            </p>
            <p className="mt-1 text-sm font-bold">
              {v.correct}/{v.total}
            </p>
          </div>
        ))}
      </div>

      {missed.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
          <h3 className="mb-3 text-sm font-semibold">{t("mock.reviewWrong")}</h3>
          <ul className="flex flex-col gap-2">
            {missed.map((q) => (
              <li
                key={q.id}
                className="rounded-lg bg-stone-50 p-3 text-sm dark:bg-stone-900"
              >
                <p className="font-medium">
                  {q.word.hanzi}{" "}
                  <span className="text-xs font-normal text-stone-400">
                    {q.word.pinyin} · {q.word.meaning}
                  </span>
                </p>
                <p className="mt-1 text-xs text-red-500">
                  {t("mock.yourAnswer", { a: result.answers[q.id] || "-" })}
                </p>
                <p className="text-xs text-emerald-600">
                  {t("mock.correct", { a: q.answer })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function MockTest() {
  const { recordTest } = useProgress();
  const { t } = useLanguage();

  const [level, setLevel] = useState<HskLevel>(1);
  const [count, setCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(TIME_OPTIONS[1].seconds);
  const [questions, setQuestions] = useState<MockQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [result, setResult] = useState<QuizResult | null>(null);
  const deadline = useRef<number | null>(null);

  const words = useLevelWords(level);
  const submitted = useRef(false);

  const submitQuiz = useCallback(() => {
    if (!questions || submitted.current) return;
    submitted.current = true;
    const correct = questions.filter((q) => answers[q.id] === q.answer).length;
    const xp = testXp(correct, questions.length);
    recordTest(correct, questions.length);
    setResult({ correct, total: questions.length, xp, answers, questions });
  }, [questions, answers, recordTest]);

  useEffect(() => {
    if (timeLeft > 0 || !questions || result) return;
    const timeout = setTimeout(() => submitQuiz(), 0);
    return () => clearTimeout(timeout);
  }, [timeLeft, questions, result, submitQuiz]);

  useEffect(() => {
    if (!questions || result) return;
    const tick = () => {
      const remaining =
        deadline.current === null
          ? 0
          : Math.ceil((deadline.current - Date.now()) / 1000);
      setTimeLeft(remaining);
    };
    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [questions, result]);

  const startQuiz = () => {
    const quiz = generateMockTest(words, count);
    if (quiz.length === 0) return;
    submitted.current = false;
    setQuestions(quiz);
    setIndex(0);
    setAnswers({});
    setResult(null);
    deadline.current = Date.now() + timeLimit * 1000;
    setTimeLeft(timeLimit);
  };

  const selectAnswer = (option: string) => {
    if (!questions) return;
    setAnswers((prev) => ({ ...prev, [questions[index].id]: option }));
  };

  const question = questions?.[index];

  if (result) {
    return <ResultView result={result} onRetake={startQuiz} />;
  }

  if (!questions) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {t("mock.level")}
          </label>
          <div className="flex flex-wrap gap-2">
            {allLevels().map((l) => {
              const available = countWordsByLevel(l) > 0;
              return (
                <Pill
                  key={l}
                  selected={level === l}
                  disabled={!available}
                  onClick={() => setLevel(l)}
                >
                  HSK {l}
                </Pill>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {t("mock.questionCount")}
          </label>
          <div className="flex flex-wrap gap-2">
            {QUESTION_COUNTS.map((c) => (
              <Pill key={c} selected={count === c} onClick={() => setCount(c)}>
                {t("mock.countSuffix", { n: c })}
              </Pill>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {t("mock.time")}
          </label>
          <div className="flex flex-wrap gap-2">
            {TIME_OPTIONS.map((time) => (
              <Pill
                key={time.seconds}
                selected={timeLimit === time.seconds}
                onClick={() => setTimeLimit(time.seconds)}
              >
                {t(time.labelKey)}
              </Pill>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-950">
          <Icon name="chart" className="mx-auto h-8 w-8 text-stone-400" />
          <p className="mt-3 text-sm font-medium text-stone-600 dark:text-stone-300">
            {t("mock.summary", {
              n: count,
              m: words.length,
              level: getLevelMeta(level).name,
            })}
          </p>
          <p className="mt-1 text-xs text-stone-400">{t("mock.typesHint")}</p>
          <button
            onClick={startQuiz}
            disabled={words.length === 0}
            className="mt-4 h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-8"
          >
            {words.length === 0 ? t("common.loading") : t("mock.start")}
          </button>
        </div>
      </div>
    );
  }

  if (!question) return null;

  const selected = answers[question.id];
  const isAnswered = selected !== undefined;
  const pct = ((index + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-400">
        <span>
          {t("mock.question", { i: index + 1, t: questions.length })}
        </span>
        <span
          className={`font-medium tabular-nums ${
            timeLeft <= 60
              ? "animate-pulse-soft text-red-500"
              : "text-teal-700 dark:text-teal-600"
          }`}
        >
          ⏱ {formatTime(Math.max(timeLeft, 0))}
        </span>
      </div>
      <ProgressBar value={pct} />

      <div key={question.id} className="animate-card-in flex flex-col gap-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
            {t(`qtype.${question.type}`)}
          </p>
          <p className="mt-3 text-center text-3xl font-bold tracking-tight">
            {question.prompt}
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {question.options.map((option) => {
            const isCorrect = option === question.answer;
            const isSelected = option === selected;
            let style =
              "border-stone-200 bg-white text-stone-700 hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-teal-700";
            if (isAnswered) {
              if (isCorrect)
                style =
                  "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
              else if (isSelected)
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
                  onClick={() => selectAnswer(option)}
                  className={`flex min-h-12 w-full items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors active:scale-[0.98] disabled:cursor-default ${style}`}
                >
                  {option}
                </button>
              </li>
            );
          })}
        </ul>

        {isAnswered && (
          <button
            onClick={() => {
              if (index + 1 >= questions.length) {
                submitQuiz();
              } else {
                setIndex(index + 1);
              }
            }}
            className="h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
          >
            {index + 1 >= questions.length ? t("mock.results") : t("mock.next")}
          </button>
        )}
      </div>
    </div>
  );
}
