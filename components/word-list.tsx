"use client";

import { useRef, useState } from "react";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import type { VocabWord } from "@/lib/hsk/types";

function normalizePinyin(s: string): string {
  return s
    .toLowerCase()
    .replace(/ü/g, "u")
    .replace(/v/g, "u")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

export function WordList({ words }: { words: VocabWord[] }) {
  const { progress, recordReview } = useProgress();
  const { t } = useLanguage();
  const [selected, setSelected] = useState<VocabWord | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [mode, setMode] = useState<"recognize" | "type">("recognize");
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    answer?: string;
  } | null>(null);
  const submitting = useRef(false);

  const openWord = (word: VocabWord) => {
    setSelected(word);
    setFlipped(false);
    setMode("recognize");
    setTyped("");
    setFeedback(null);
  };

  const closeWord = () => {
    setSelected(null);
    setFeedback(null);
    setTyped("");
  };

  const answer = (correct: boolean) => {
    if (!selected) return;
    recordReview(selected, correct);
    closeWord();
  };

  const switchMode = (next: "recognize" | "type") => {
    setMode(next);
    setFlipped(false);
    setTyped("");
    setFeedback(null);
  };

  const checkTyped = () => {
    if (!selected || submitting.current) return;
    if (typed.trim() === "") return;
    submitting.current = true;
    const ok = normalizePinyin(typed) === normalizePinyin(selected.pinyin);
    recordReview(selected, ok);
    setFeedback({ correct: ok, answer: selected.pinyin });
    queueMicrotask(() => {
      submitting.current = false;
    });
  };

  if (words.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center dark:border-stone-700 dark:bg-stone-950">
        <Icon name="book" className="mx-auto h-8 w-8 text-stone-400" />
        <p className="mt-3 text-sm font-medium text-stone-600 dark:text-stone-300">
          {t("word.empty")}
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {words.map((word, index) => {
          const wp = progress?.words[word.id];
          return (
            <li
              key={word.id}
              className="animate-card-in"
              style={{ animationDelay: `${Math.min(index, 24) * 25}ms` }}
            >
              <button
                type="button"
                onClick={() => openWord(word)}
                className="flex w-full items-center gap-3 rounded-xl border border-stone-200 bg-white p-3.5 text-left transition-colors hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-teal-700"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    wp?.mastered
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-400 dark:bg-stone-900 dark:text-stone-600"
                  }`}
                >
                  <Icon name="check" className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold leading-tight">
                    {word.hanzi}{" "}
                    <span className="ml-2 text-sm font-medium text-stone-500 dark:text-stone-400">
                      {word.pinyin}
                    </span>
                  </span>
                  <span className="block text-sm text-stone-600 dark:text-stone-300">
                    {word.meaning}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-stone-400">
                  {wp ? `✓ ${wp.reviews}x` : t("common.new")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={closeWord}
        >
          <div
            className="animate-slide-up w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-xl dark:border-stone-800 dark:bg-stone-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3 text-sm text-stone-500 dark:text-stone-400">
              <span>
                {(() => {
                  const wp = progress?.words[selected.id];
                  return wp ? `✓ ${wp.reviews}x` : t("common.new");
                })()}
              </span>
              <div className="flex gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800/70">
                <button
                  type="button"
                  onClick={() => switchMode("recognize")}
                  className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors ${
                    mode === "recognize"
                      ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-stone-100"
                      : "text-stone-500 dark:text-stone-400"
                  }`}
                >
                  {t("word.recognize")}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("type")}
                  className={`h-8 rounded-lg px-3 text-xs font-semibold transition-colors ${
                    mode === "type"
                      ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-stone-100"
                      : "text-stone-500 dark:text-stone-400"
                  }`}
                >
                  {t("word.type")}
                </button>
              </div>
              <button
                type="button"
                onClick={closeWord}
                aria-label={t("word.close")}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-900 dark:hover:text-stone-200"
              >
                <Icon name="check" className="h-4 w-4 rotate-45" />
              </button>
            </div>

            {mode === "recognize" ? (
              <>
                <button
                  type="button"
                  onClick={() => setFlipped((f) => !f)}
                  aria-label={t(flipped ? "deck.tapBack" : "deck.tapFlip")}
                  className="relative block h-60 w-full [perspective:1000px]"
                >
                  <span
                    className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]"
                    style={{
                      transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                  >
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white p-6 text-center [backface-visibility:hidden] dark:border-stone-800 dark:bg-stone-950">
                      <span className="text-5xl font-bold tracking-tight">
                        {selected.hanzi}
                      </span>
                      <span className="mt-4 text-xs text-stone-400">
                        {t("deck.tapFlip")}
                      </span>
                    </span>
                    <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-teal-300 bg-teal-50 p-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-teal-700 dark:bg-teal-600/10">
                      <span className="text-3xl font-bold">
                        {selected.pinyin}
                      </span>
                      <span className="mt-2 text-xl font-semibold text-stone-700 dark:text-stone-200">
                        {selected.meaning}
                      </span>
                      {selected.example && (
                        <span className="mt-4 text-sm text-stone-500 dark:text-stone-400">
                          {selected.example}
                          {selected.exampleMeaning && (
                            <span className="block text-xs">
                              {selected.examplePinyin} ·{" "}
                              {selected.exampleMeaning}
                            </span>
                          )}
                        </span>
                      )}
                      <span className="mt-4 text-xs text-teal-600">
                        {t("deck.tapBack")}
                      </span>
                    </span>
                  </span>
                </button>

                {flipped && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => answer(false)}
                      className="flex h-14 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-600 transition-colors hover:border-red-300 hover:text-red-600 active:scale-[0.97] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
                    >
                      <Icon name="check" className="h-5 w-5 rotate-90" />
                      {t("deck.notMemorized")}
                    </button>
                    <button
                      type="button"
                      onClick={() => answer(true)}
                      className="flex h-14 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 active:scale-[0.97]"
                    >
                      <Icon name="check" className="h-5 w-5" />
                      {t("deck.memorized")}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-48 flex-col justify-center rounded-2xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-950">
                <p className="text-center text-5xl font-bold tracking-tight">
                  {selected.hanzi}
                </p>
                <p className="mt-3 text-center text-sm font-medium text-stone-600 dark:text-stone-300">
                  {selected.meaning}
                </p>

                {feedback ? (
                  <div
                    className={`mt-6 text-center ${
                      feedback.correct ? "animate-pop" : "animate-shake"
                    }`}
                  >
                    {feedback.correct ? (
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {t("word.correct")}
                      </p>
                    ) : (
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {t("word.wrong", { answer: feedback.answer ?? "" })}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={closeWord}
                      className="mt-4 h-11 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
                    >
                      {t("word.next")}
                    </button>
                  </div>
                ) : (
                  <>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        checkTyped();
                      }}
                      className="mt-6"
                    >
                      <input
                        type="text"
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder={t("word.typePlaceholder")}
                        className="h-12 w-full rounded-xl border border-stone-200 bg-white px-3 text-center text-lg tracking-wide outline-none transition-colors focus:border-teal-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
                      />
                      <p className="mt-2 text-center text-xs text-stone-400">
                        {t("word.typeHint")}
                      </p>
                      <button
                        type="submit"
                        className="mt-4 h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
                      >
                        {t("word.check")}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            <p className="mt-3 text-center text-xs text-stone-400">
              {t("word.masterHint")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
