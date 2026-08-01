"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { useSettings } from "@/components/settings-provider";
import { Icon } from "@/components/icons";
import { ProgressBar } from "@/components/progress-bar";
import { Confetti } from "@/components/confetti";
import { ProgressRing } from "@/components/progress-ring";
import { useLevelWords } from "@/lib/hsk/use-level-words";
import type { HskLevel, VocabWord } from "@/lib/hsk/types";

/**
 * Metode pembelajaran (berbasis riset):
 *
 * 1. Retrieval practice dengan umpan balik (Roediger & Karpicke, 2006) —
 *    mengaktifkan ingatan jauh lebih efektif daripada membaca ulang pasif.
 *    Fase "Latihan" memaksa recall arti, bukan sekadar menampilkan.
 *
 * 2. Feedback segera + siklus inferensi-feedback (Barcroft 2007; Karpicke &
 *    Roediger 2008) — kata yang salah langsung ditampilkan jawabannya lalu
 *    diuji ulang di akhir antrean, membentuk siklus retrieval → feedback →
 *    retrieval ulang.
 *
 * 3. Spacing effect (meta-analisis Cepeda et al., 2006) — kata yang benar
 *    dijadwalkan review besok via SRS (`recordReview` → `nextReview`), kata
 *    yang salah dijadwalkan ulang hari ini. Praktik terdistribusi > menjejalkan.
 *
 * 4. Batching kecil (batasan kapasitas kognitif, Miller 1956; Sweller 1988) —
 *    satu sesi hanya memaparkan sejumlah kata baru = target harian pengguna.
 *
 * 5. Urutan kurikulum — kata baru diambil sesuai urutan daftar resmi HSK
 *    (id ascending), sehingga progres terstruktur, bukan acak. Urutan kata
 *    dalam satu sesi diacak (shuffle) agar tidak selalu mengikuti urutan yang
 *    sama tiap belajar.
 *
 * Catatan data: `VocabWord.example` sudah disiapkan di tipe tapi data belum
 * berisi kalimat konteks — dukungan konteks semantik (Mulder et al. 2018)
 * adalah peningkatan data berikutnya.
 */

type Phase = "intro" | "quiz" | "done";

interface Session {
  words: VocabWord[];
  phase: Phase;
  introIndex: number;
  queue: VocabWord[];
  index: number;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildOptions(word: VocabWord, pool: VocabWord[]): string[] {
  const unique = [
    ...new Set(
      pool.filter((w) => w.id !== word.id && w.meaning !== word.meaning).map((w) => w.meaning),
    ),
  ];
  const distractors: string[] = [];
  while (distractors.length < 3 && unique.length > 0) {
    const i = Math.floor(Math.random() * unique.length);
    distractors.push(unique.splice(i, 1)[0]);
  }
  return shuffle([word.meaning, ...distractors]);
}

export function Lesson({ level }: { level: HskLevel }) {
  const { progress, recordReview } = useProgress();
  const { t } = useLanguage();
  const { settings } = useSettings();

  const [session, setSession] = useState<Session | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [picked, setPicked] = useState<{ option: string; correct: boolean } | null>(null);
  const recorded = useRef<Set<string>>(new Set());

  const pool = useLevelWords(level);
  const newWords = useMemo(
    () => pool.filter((w) => !progress.words[w.id]),
    [pool, progress.words],
  );
  const learned = pool.length - newWords.length;
  const batchSize = Math.max(1, settings.dailyTargets.vocab);
  const batch = newWords.slice(0, batchSize);

  const start = () => {
    if (batch.length === 0) return;
    recorded.current.clear();
    setResults({});
    setPicked(null);
    const words = shuffle(batch);
    setSession({
      words,
      phase: "intro",
      introIndex: 0,
      queue: words,
      index: 0,
    });
  };

  const exit = () => {
    setSession(null);
    setPicked(null);
  };

  const introNext = () => {
    if (!session) return;
    if (session.introIndex + 1 < session.words.length) {
      setSession({ ...session, introIndex: session.introIndex + 1 });
    } else {
      setSession({ ...session, phase: "quiz" });
    }
  };

  const word = session ? session.queue[session.index] : null;

  const pick = (option: string) => {
    if (!session || !word || picked) return;
    const correct = option === word.meaning;
    if (!recorded.current.has(word.id)) {
      recorded.current.add(word.id);
      recordReview(word, correct);
      setResults((prev) => ({ ...prev, [word.id]: correct }));
    }
    setPicked({ option, correct });
  };

  const advance = () => {
    if (!session || !word || !picked) return;
    const nextIndex = session.index + 1;
    if (!picked.correct) {
      // Siklus inferensi-feedback: kata yang salah diuji ulang di akhir
      // antrean. Karena ditambahkan item baru, index selalu valid.
      const queue = [...session.queue, word];
      setSession({ ...session, queue, index: nextIndex });
    } else if (nextIndex >= session.queue.length) {
      setSession({ ...session, phase: "done" });
    } else {
      setSession({ ...session, index: nextIndex });
    }
    setPicked(null);
  };

  const options = useMemo(
    () => (word ? buildOptions(word, pool) : []),
    [word, pool],
  );

  const firstTryCorrect = Object.values(results).filter(Boolean).length;

  if (!session) {
    const allLearned = newWords.length === 0;
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">{t("lesson.title")}</h2>
          <span className="text-xs font-medium text-stone-400">
            <Icon name="check" className="mr-1 inline h-3.5 w-3.5" />
            {t("lesson.learnedCount", { n: learned, t: pool.length })}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar
            value={pool.length === 0 ? 0 : (learned / pool.length) * 100}
            barClassName="bg-emerald-500"
          />
        </div>
        <p className="mt-3 text-sm text-stone-600 dark:text-stone-300">
          {allLearned
            ? t("lesson.allLearned")
            : t("lesson.newWordsLeft", { n: newWords.length })}
        </p>
        {!allLearned && (
          <p className="mt-1 text-xs text-stone-400">
            {t("lesson.batchIntro", { n: batch.length })}
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={start}
            disabled={allLearned}
            className="h-11 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("lesson.start")}
          </button>
          <Link
            href="/practice"
            className="flex h-11 items-center rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-600 transition-colors hover:border-teal-300 hover:text-teal-700 active:scale-[0.97] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
          >
            <Icon name="pen" className="mr-2 h-4 w-4" />
            {t("lesson.practice")}
          </Link>
        </div>
      </section>
    );
  }

  if (session.phase === "intro") {
    const current = session.words[session.introIndex];
    const progressCount = session.introIndex + 1;
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-center justify-between gap-3 text-sm text-stone-500 dark:text-stone-400">
          <span className="font-medium">{t("lesson.intro")}</span>
          <span className="flex items-center gap-3">
            <span>
              {t("lesson.card", { i: progressCount, t: session.words.length })}
            </span>
            <button
              type="button"
              onClick={exit}
              className="text-xs font-medium text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-300"
            >
              {t("lesson.exit")}
            </button>
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={(progressCount / session.words.length) * 100} />
        </div>

        <div key={current.id} className="animate-card-in mt-5 flex flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-950">
          <span className="text-5xl font-bold tracking-tight">{current.hanzi}</span>
          <span className="mt-2 text-2xl font-semibold text-teal-700 dark:text-teal-600">
            {current.pinyin}
          </span>
          <span className="mt-2 text-xl font-medium text-stone-700 dark:text-stone-200">
            {current.meaning}
          </span>
        </div>
        <p className="mt-3 text-center text-xs text-stone-400">
          {t("lesson.introHint")}
        </p>
        <button
          type="button"
          onClick={introNext}
          className="mt-4 h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
        >
          {session.introIndex + 1 >= session.words.length
            ? t("lesson.introStart")
            : t("lesson.introNext")}
        </button>
      </section>
    );
  }

  if (session.phase === "done") {
    const donePct = session.words.length > 0
      ? Math.round((firstTryCorrect / session.words.length) * 100)
      : 0;
    return (
      <section className="animate-slide-up rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <Confetti />
        <div className="mx-auto flex justify-center">
          <ProgressRing
            value={donePct}
            size={96}
            stroke={8}
            className="text-teal-600 dark:text-teal-400"
          />
        </div>
        <p className="mt-4 text-lg font-bold">{t("lesson.doneTitle")}</p>
        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
          {t("lesson.doneScore", {
            c: firstTryCorrect,
            t: session.words.length,
          })}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs text-stone-400">
          {t("lesson.doneNote")}
        </p>
        <div className="mx-auto mt-5 max-w-xs space-y-2">
          <Link
            href="/practice"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
          >
            <Icon name="pen" className="h-4 w-4" />
            {t("lesson.practice")}
          </Link>
          <button
            type="button"
            onClick={exit}
            className="h-12 w-full rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 transition-colors hover:border-teal-300 hover:text-teal-700 active:scale-[0.97] dark:border-stone-800 dark:text-stone-300"
          >
            {t("lesson.exit")}
          </button>
        </div>
      </section>
    );
  }

  if (!word) return null;

  const answeredCount = Object.keys(results).length;
  const pct = (answeredCount / session.words.length) * 100;

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
      <div className="flex items-center justify-between gap-3 text-sm text-stone-500 dark:text-stone-400">
        <span className="font-medium">{t("lesson.quiz")}</span>
        <span className="flex items-center gap-3">
          <span>
            {t("lesson.doneCount", { d: answeredCount, t: session.words.length })}
          </span>
          <button
            type="button"
            onClick={exit}
            className="text-xs font-medium text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-300"
          >
            {t("lesson.exit")}
          </button>
        </span>
      </div>
      <div className="mt-3">
        <ProgressBar value={pct} />
      </div>

      <div className="mt-5 text-center">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
          {t("lesson.quizHint")}
        </p>
        <p className="mt-2 text-4xl font-bold tracking-tight">{word.hanzi}</p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          {t("lesson.meaningOf", { hanzi: word.hanzi })}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isPicked = picked !== null && picked.option === option;
          const isCorrect = option === word.meaning;
          let style =
            "border-stone-200 bg-white text-stone-700 hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-teal-700";
          if (picked) {
            if (isCorrect)
              style =
                "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400";
            else if (isPicked)
              style =
                "border-red-500 bg-red-50 text-red-600 dark:border-red-600 dark:bg-red-500/10 dark:text-red-400";
            else
              style =
                "border-stone-200 bg-white text-stone-400 opacity-60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-500";
          }
          return (
            <button
              key={option}
              type="button"
              disabled={picked !== null}
              onClick={() => pick(option)}
              className={`flex min-h-12 w-full items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors disabled:cursor-default ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {picked && (
        <div
          className={`animate-slide-down mt-4 rounded-xl border p-4 text-center text-sm font-medium ${
            picked.correct
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {picked.correct
            ? t("lesson.correct")
            : t("lesson.wrongAnswer", { answer: word.meaning })}
          {!picked.correct && (
            <span className="mt-1 block text-xs font-normal opacity-80">
              {t("lesson.retestHint")}
            </span>
          )}
          <button
            type="button"
            onClick={advance}
            className="mt-3 h-11 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
          >
            {t("lesson.continue")}
          </button>
        </div>
      )}
    </section>
  );
}
