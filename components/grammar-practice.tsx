"use client";

import { useLanguage } from "@/components/language-provider";
import {
  ChoicePracticeSession,
  type ChoiceQ,
} from "@/components/practice-session";
import { generateEnglishGrammarQuestions } from "@/lib/english/exercises";
import type { VocabItem } from "@/lib/languages/types";

function buildGrammarQuestions(
  words: VocabItem[],
  _level: number,
  _moduleId: string,
): ChoiceQ[] {
  return generateEnglishGrammarQuestions(words, 8).map((q) => ({
    id: q.id,
    prompt: q.blanked,
    options: q.options,
    answer: q.answer,
    passage: [{ hanzi: q.sentence, pinyin: "", meaning: q.meaning }],
  }));
}

export function GrammarPractice({ moduleId }: { moduleId?: string }) {
  const { t } = useLanguage();

  return (
    <ChoicePracticeSession
      moduleId={moduleId}
      build={buildGrammarQuestions}
      renderPrompt={(q) => {
        const sentence = q.passage?.[0];
        return (
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              {t("grammar.prompt")}
            </p>
            <p className="mt-3 text-center text-xl font-bold tracking-tight">
              {q.prompt}
            </p>
            {sentence?.meaning && (
              <p className="mt-2 text-center text-sm text-stone-500 dark:text-stone-400">
                {sentence.meaning}
              </p>
            )}
          </div>
        );
      }}
      titleKey="grammar.title"
      subtitleKey="grammar.subtitle"
      startKey="grammar.start"
      sessionHintKey="grammar.sessionHint"
      questionKey="grammar.question"
      correctKey="grammar.correct"
      wrongKey="grammar.wrong"
      nextKey="grammar.next"
      doneCtaKey="grammar.doneCta"
      doneKey="grammar.done"
      scoreKey="grammar.score"
      againKey="grammar.again"
    />
  );
}
