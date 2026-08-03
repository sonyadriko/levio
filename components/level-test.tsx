"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import { ProgressBar } from "@/components/progress-bar";
import { MIN_PASS_PCT } from "@/lib/progress";
import { useLevelWords } from "@/lib/languages/use-level-words";
import { generateMockTest, type MockQuestion } from "@/lib/languages/mock-test";
import type { LanguageModule } from "@/lib/languages/types";

const TEST_COUNT = 10;

interface QuizResult {
  correct: number;
  total: number;
  pct: number;
  xp: number;
  answers: Record<string, string>;
  questions: MockQuestion[];
}

// Tes kelulusan: skor minimal MIN_PASS_PCT untuk membuka level berikutnya.
// Dipakai di dua tempat: (1) gate level terkunci, (2) wisuda level frontier.
export function LevelTest({
  module,
  level,
  variant,
  onPass,
}: {
  module: LanguageModule;
  level: number;
  variant: "gate" | "graduate";
  onPass: () => void;
}) {
  const { recordTest } = useProgress();
  const { t } = useLanguage();
  const words = useLevelWords(module, level);

  const [questions, setQuestions] = useState<MockQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const submitted = useRef(false);

  const nextLevel = Math.min(module.maxLevel, level + 1);
  const levelName = module.levelName(level);
  const nextName = module.levelName(nextLevel);

  const start = () => {
    const quiz = generateMockTest(words, module.questionTypes, TEST_COUNT);
    if (quiz.length === 0) return;
    submitted.current = false;
    setQuestions(quiz);
    setIndex(0);
    setAnswers({});
    setResult(null);
  };

  const submit = useCallback(() => {
    if (!questions || submitted.current) return;
    submitted.current = true;
    const correct = questions.filter((q) => answers[q.id] === q.answer).length;
    const total = questions.length;
    const pct = Math.round((correct / total) * 100);
    const xp = recordTest(correct, total);
    setResult({
      correct,
      total,
      pct,
      xp,
      answers,
      questions,
    });
  }, [questions, answers, recordTest]);

  const question = questions?.[index];

  const introDescription = useMemo(
    () =>
      t(
        variant === "gate"
          ? "levelTest.introGate"
          : "levelTest.introGraduate",
        { cur: levelName, next: nextName, p: MIN_PASS_PCT },
      ),
    [variant, levelName, nextName, t],
  );

  if (result) {
    const passed = result.pct >= MIN_PASS_PCT;
    return (
      <div className="animate-slide-up rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <p className="text-lg font-bold">
          {t("levelTest.score", {
            p: result.pct,
            c: result.correct,
            t: result.total,
          })}
        </p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          +{result.xp} {t("common.xp")}
        </p>
        <div
          className={`mx-auto mt-4 max-w-sm rounded-xl px-4 py-3 text-sm font-medium ${
            passed
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {passed ? t("levelTest.pass") : t("levelTest.fail", { p: MIN_PASS_PCT })}
        </div>
        {passed && (
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            {t("levelTest.passNote", { next: nextName })}
          </p>
        )}
        <button
          onClick={passed ? onPass : start}
          className="mt-5 h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97] sm:w-auto sm:px-8"
        >
          {passed ? t("levelTest.continue") : t("levelTest.retry")}
        </button>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <Icon name="chart" className="mx-auto h-8 w-8 text-teal-600 dark:text-teal-500" />
        <h3 className="mt-3 text-base font-bold">
          {t("levelTest.title", { name: levelName })}
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          {introDescription}
        </p>
        <p className="mt-1 text-xs text-stone-400">
          {t("levelTest.count", { n: TEST_COUNT })}
        </p>
        <button
          onClick={start}
          disabled={words.length === 0}
          className="mt-4 h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-8"
        >
          {words.length === 0 ? t("common.loading") : t("levelTest.start")}
        </button>
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
          {t("levelTest.question", { i: index + 1, t: questions.length })}
        </span>
        <span className="font-medium text-teal-700 dark:text-teal-600">
          {t("levelTest.title", { name: levelName })}
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
                  onClick={() =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: option,
                    }))
                  }
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
              if (index + 1 >= questions.length) submit();
              else setIndex(index + 1);
            }}
            className="h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
          >
            {index + 1 >= questions.length
              ? t("levelTest.results")
              : t("levelTest.next")}
          </button>
        )}
      </div>
    </div>
  );
}
