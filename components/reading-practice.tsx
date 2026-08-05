"use client";

import { useLanguage } from "@/components/language-provider";
import {
  ChoicePracticeSession,
  type ChoiceQ,
} from "@/components/practice-session";
import { generateReadingQuestions } from "@/lib/hsk/exercises";
import type { HskLevel, VocabWord } from "@/lib/hsk/types";
import type { VocabItem } from "@/lib/languages/types";

function toHskWord(w: VocabItem): VocabWord {
  return {
    id: w.id,
    hanzi: w.term,
    pinyin: w.reading ?? "",
    meaning: w.meaning,
    hsk: w.level as HskLevel,
    example: w.example,
    examplePinyin: w.exampleReading,
    exampleMeaning: w.exampleMeaning,
  };
}

function buildReadingQuestions(
  words: VocabItem[],
  level: number,
  _moduleId: string,
): ChoiceQ[] {
  return generateReadingQuestions(words.map(toHskWord), level as HskLevel, 8).map((q) => ({
    id: q.id,
    prompt: q.answer,
    options: q.options,
    answer: q.answer,
    passage: q.passage,
  }));
}

export function ReadingPractice({ moduleId }: { moduleId?: string }) {
  const { t } = useLanguage();

  return (
    <ChoicePracticeSession
      moduleId={moduleId}
      build={buildReadingQuestions}
      renderPrompt={(q) => {
        const passage = q.passage ?? [];
        return (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              {t("read.passageLabel")}
            </p>
            <div className="mt-3 flex flex-col gap-3">
              {passage.map((s, i) => (
                <div key={i}>
                  <p className="text-lg font-bold tracking-tight">{s.hanzi}</p>
                  <p className="mt-0.5 text-sm text-stone-500 dark:text-stone-400">
                    {s.pinyin}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm font-medium text-teal-700 dark:text-teal-400">
              {t("read.prompt")}
            </p>
          </div>
        );
      }}
      titleKey="read.title"
      subtitleKey="read.subtitle"
      startKey="read.start"
      sessionHintKey="read.sessionHint"
      questionKey="read.question"
      correctKey="read.correct"
      wrongKey="read.wrong"
      nextKey="read.next"
      doneCtaKey="read.doneCta"
      doneKey="read.done"
      scoreKey="read.score"
      againKey="read.again"
    />
  );
}
