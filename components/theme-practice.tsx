"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import { T } from "@/components/translate";
import { ProgressBar } from "@/components/progress-bar";
import { Confetti } from "@/components/confetti";
import { SlidingTabs } from "@/components/sliding-tabs";
import { useToast } from "@/components/toast";
import type { IconName } from "@/lib/nav";
import type { ThemePack } from "@/lib/themes/types";
import type { VocabItem } from "@/lib/languages/types";

type Mode = "flashcard" | "quiz" | "type" | "match" | "listen" | "speak";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[。！？]/g, "")
    .replace(/\s+/g, " ");
}

function isMeaningMatch(input: string, meaning: string): boolean {
  const a = normalize(input);
  if (!a) return false;
  // meaning bisa berisi beberapa arti dipisah "; " — cocokkan salah satu.
  return meaning.split("; ").some((m) => normalize(m) === a);
}

const MODE_META: { id: Mode; icon: IconName; titleKey: string; descKey: string }[] = [
  { id: "flashcard", icon: "book", titleKey: "theme.mode.flashcard.title", descKey: "theme.mode.flashcard.desc" },
  { id: "quiz", icon: "check", titleKey: "theme.mode.quiz.title", descKey: "theme.mode.quiz.desc" },
  { id: "type", icon: "pen", titleKey: "theme.mode.type.title", descKey: "theme.mode.type.desc" },
  { id: "match", icon: "star", titleKey: "theme.mode.match.title", descKey: "theme.mode.match.desc" },
  { id: "listen", icon: "volume", titleKey: "theme.mode.listen.title", descKey: "theme.mode.listen.desc" },
  { id: "speak", icon: "mic", titleKey: "theme.mode.speak.title", descKey: "theme.mode.speak.desc" },
];

function buildOptions(word: VocabItem, pool: VocabItem[]): string[] {
  const unique = [
    ...new Set(
      pool
        .filter((w) => w.id !== word.id && w.meaning !== word.meaning)
        .map((w) => w.meaning),
    ),
  ];
  const distractors: string[] = [];
  while (distractors.length < 3 && unique.length > 0) {
    const i = Math.floor(Math.random() * unique.length);
    distractors.push(unique.splice(i, 1)[0]);
  }
  return shuffle([word.meaning, ...distractors]);
}

let pendingSpeak: number | null = null;

function speak(reading: string, speechLang: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (pendingSpeak !== null) window.clearTimeout(pendingSpeak);
  const synth = window.speechSynthesis;
  synth.cancel();
  const utter = new SpeechSynthesisUtterance(reading);
  utter.lang = speechLang;
  // Bug Chrome: speak() yang dipanggil langsung setelah cancel() sering
  // diabaikan sehingga audio hanya bisa diputar sekali. Pisahkan ke task
  // berikutnya dengan jeda agar cancel() selesai diproses dulu.
  pendingSpeak = window.setTimeout(() => {
    pendingSpeak = null;
    synth.cancel();
    synth.speak(utter);
  }, 100);
}

function cancelSpeech(): void {
  if (typeof window === "undefined") return;
  if (pendingSpeak !== null) {
    window.clearTimeout(pendingSpeak);
    pendingSpeak = null;
  }
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

function ResultView({
  correct,
  total,
  onAgain,
}: {
  correct: number;
  total: number;
  onAgain: () => void;
}) {
  const { t } = useLanguage();
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div className="flex flex-col gap-4">
      <div className="animate-slide-up rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        {pct >= 60 && <Confetti count={32} />}
        <p className="text-4xl font-black tracking-tight text-teal-600 dark:text-teal-400">
          {pct}%
        </p>
        <p className="mt-2 text-sm font-medium">
          {t("mock.score", { p: pct, c: correct, t: total })}
        </p>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-500">
          {pct >= 60 ? t("mock.pass") : t("mock.fail")}
        </p>
        <button
          onClick={onAgain}
          className="mt-4 h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish sm:w-auto sm:px-8"
        >
          {t("theme.again")}
        </button>
      </div>
    </div>
  );
}

function FlashcardMode({
  words,
  onExit,
  onRestart,
}: {
  words: VocabItem[];
  onExit: () => void;
  onRestart: () => void;
}) {
  const { t } = useLanguage();
  const { recordReview } = useProgress();
  const [deck] = useState<VocabItem[]>(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const done = index >= deck.length;
  const word = deck[index];

  const answer = (ok: boolean) => {
    if (!word) return;
    recordReview(word, ok);
    if (ok) setCorrect((c) => c + 1);
    setFlipped(false);
    setIndex((i) => i + 1);
  };

  if (done) {
    return (
      <div className="flex flex-col gap-4">
        <div className="animate-card-in rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-950">
          <Confetti />
          <p className="text-2xl font-black tracking-tight text-teal-600 dark:text-teal-400">
            {Math.round((correct / deck.length) * 100)}%
          </p>
          <p className="mt-2 text-lg font-bold">{t("deck.done")}</p>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-500">
            {t("deck.summary", {
              c: correct,
              t: deck.length,
              p: Math.round((correct / deck.length) * 100),
              xp: correct * 10,
            })}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              onClick={onRestart}
              className="h-12 rounded-xl bg-teal-700 px-6 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish"
            >
              {t("theme.again")}
            </button>
            <button
              onClick={onExit}
              className="h-12 rounded-xl border border-stone-200 px-6 text-sm font-semibold text-stone-600 transition-colors hover:border-teal-300 hover:text-teal-700 dark:border-stone-800 dark:text-stone-300"
            >
              {t("lesson.exit")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-500">
        <span>{t("deck.card", { i: index + 1, t: deck.length })}</span>
        <button onClick={onExit} className="text-xs font-medium transition-colors hover:text-stone-600">
          {t("lesson.exit")}
        </button>
      </div>
      <ProgressBar value={((index + 1) / deck.length) * 100} />
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={t(flipped ? "deck.tapBack" : "deck.tapFlip")}
        className="relative block h-64 w-full cursor-pointer [perspective:1000px]"
      >
        <span
          className="absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]"
          style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-stone-200 bg-white p-8 text-center [backface-visibility:hidden] dark:border-stone-800 dark:bg-stone-950">
            <span className="text-4xl font-bold tracking-tight">{word.term}</span>
            <span className="mt-2 text-xl text-stone-500 dark:text-stone-500">
              {word.reading}
            </span>
            <span className="mt-4 text-xs text-stone-500">{t("deck.tapFlip")}</span>
          </span>
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-teal-300 bg-teal-50 p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)] dark:border-teal-700 dark:bg-teal-600/10">
            <span className="text-2xl font-bold text-stone-700 dark:text-stone-200">
              {word.meaning}
            </span>
            {word.example && (
              <p className="mt-2 text-sm text-stone-500 dark:text-stone-500">
                {word.example}
                {word.exampleMeaning && (
                  <span className="block text-xs">{word.exampleMeaning}</span>
                )}
              </p>
            )}
            <span className="mt-4 text-xs text-teal-600">{t("deck.tapBack")}</span>
          </span>
        </span>
      </button>
      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => answer(false)}
            className="flex h-14 items-center justify-center rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-600 transition-colors hover:border-red-300 hover:text-red-600 btn-squish dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
          >
            <Icon name="check" className="mr-2 h-5 w-5 rotate-90" />
            {t("deck.notMemorized")}
          </button>
          <button
            onClick={() => answer(true)}
            className="flex h-14 items-center justify-center rounded-xl bg-emerald-700 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 btn-squish"
          >
            <Icon name="check" className="mr-2 h-5 w-5" />
            {t("deck.memorized")}
          </button>
        </div>
      )}
    </div>
  );
}

function QuizMode({
  words,
  onExit,
  onRestart,
}: {
  words: VocabItem[];
  onExit: () => void;
  onRestart: () => void;
}) {
  const { t } = useLanguage();
  const { recordReview } = useProgress();
  const [queue] = useState<VocabItem[]>(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const word = queue[index];
  const options = useMemo(() => (word ? buildOptions(word, words) : []), [word, words]);
  const done = index >= queue.length;

  const pick = (option: string) => {
    if (!word || picked) return;
    const ok = option === word.meaning;
    recordReview(word, ok);
    if (ok) setCorrect((c) => c + 1);
    setPicked(option);
  };

  const advance = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  if (done) {
    return (
      <ResultView
        correct={correct}
        total={words.length}
        onAgain={onRestart}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-500">
        <span>{t("deck.card", { i: index + 1, t: words.length })}</span>
        <button onClick={onExit} className="text-xs font-medium transition-colors hover:text-stone-600">
          {t("lesson.exit")}
        </button>
      </div>
      <ProgressBar value={((index + 1) / words.length) * 100} />
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          {t("theme.quiz.ask")}
        </p>
        <p className="mt-3 text-3xl font-bold tracking-tight">{word.term}</p>
        {word.reading && (
          <p className="mt-1 text-lg text-stone-500 dark:text-stone-500">{word.reading}</p>
        )}
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isCorrect = option === word.meaning;
          const isPicked = picked === option;
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
                "border-stone-200 bg-white text-stone-500 opacity-60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-500";
          }
          return (
            <li key={option}>
              <button
                disabled={picked !== null}
                onClick={() => pick(option)}
                className={`flex min-h-12 w-full items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors active:scale-[0.98] disabled:cursor-default ${style}`}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
      {picked && (
        <button
          onClick={advance}
          className="h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish"
        >
          {t("mock.next")}
        </button>
      )}
    </div>
  );
}

function TypeMode({
  words,
  onExit,
  onRestart,
}: {
  words: VocabItem[];
  onExit: () => void;
  onRestart: () => void;
}) {
  const { t } = useLanguage();
  const { recordReview } = useProgress();
  const [queue] = useState<VocabItem[]>(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");
  const [graded, setGraded] = useState(false);
  const [correct, setCorrect] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const word = queue[index];
  const ok = word && isMeaningMatch(value, word.meaning);

  useEffect(() => {
    if (!graded) inputRef.current?.focus();
  }, [index, graded]);

  const submit = () => {
    if (!word || graded) return;
    const isCorrect = isMeaningMatch(value, word.meaning);
    recordReview(word, isCorrect);
    if (isCorrect) setCorrect((c) => c + 1);
    setGraded(true);
  };

  const next = () => {
    setIndex((i) => i + 1);
    setValue("");
    setGraded(false);
  };

  if (index >= queue.length) {
    return <ResultView correct={correct} total={words.length} onAgain={onRestart} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-500">
        <span>{t("deck.card", { i: index + 1, t: words.length })}</span>
        <button onClick={onExit} className="text-xs font-medium transition-colors hover:text-stone-600">
          {t("lesson.exit")}
        </button>
      </div>
      <ProgressBar value={((index + 1) / words.length) * 100} />
      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          {t("theme.type.ask")}
        </p>
        <p className="mt-3 text-3xl font-bold tracking-tight">{word.term}</p>
        {word.reading && (
          <p className="mt-1 text-lg text-stone-500 dark:text-stone-500">{word.reading}</p>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (graded ? next : submit)();
          }}
          disabled={graded}
          placeholder={t("theme.type.placeholder")}
          autoComplete="off"
          spellCheck={false}
          className="h-12 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium outline-none transition-colors focus:border-teal-400 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200"
        />
        {!graded && (
          <button
            onClick={submit}
            disabled={!value.trim()}
            className="h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("theme.check")}
          </button>
        )}
        {graded && (
          <div
            className={`rounded-xl border p-4 text-center text-sm font-medium ${
              ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400"
            }`}
          >
            {ok ? t("lesson.correct") : t("lesson.wrongAnswer", { answer: word.meaning })}
            {ok && word.example && (
              <span className="mt-1 block text-xs font-normal opacity-80">
                {word.example} · {word.exampleMeaning}
              </span>
            )}
            <button
              onClick={next}
              className="mt-3 h-11 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish"
            >
              {t("mock.next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface MatchCard {
  key: string;
  wordId: string;
  label: string;
  isTerm: boolean;
}

function MatchMode({
  words,
  onExit,
  onRestart,
}: {
  words: VocabItem[];
  onExit: () => void;
  onRestart: () => void;
}) {
  const { t } = useLanguage();
  const { awardXp } = useProgress();
  const { toast } = useToast();
  const pairCount = 6;
  const pairs = useMemo(() => shuffle(words).slice(0, pairCount), [words]);
  const [cards] = useState<MatchCard[]>(() =>
    shuffle([
      ...pairs.map((w) => ({ key: `${w.id}-t`, wordId: w.id, label: w.term, isTerm: true })),
      ...pairs.map((w) => ({ key: `${w.id}-m`, wordId: w.id, label: w.meaning, isTerm: false })),
    ]),
  );
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const lockRef = useRef(false);

  const tap = (key: string) => {
    if (lockRef.current || matched.has(key) || open.has(key)) return;
    const next = new Set(open).add(key);
    setOpen(next);
    if (next.size === 2) {
      lockRef.current = true;
      setMoves((m) => m + 1);
      const [a, b] = [...next];
      const ca = cards.find((c) => c.key === a)!;
      const cb = cards.find((c) => c.key === b)!;
      if (ca.wordId === cb.wordId && ca.isTerm !== cb.isTerm) {
        setTimeout(() => {
          setMatched((prev) => new Set([...prev, a, b]));
          setOpen(new Set());
          lockRef.current = false;
        }, 350);
      } else {
        setTimeout(() => {
          setOpen(new Set());
          lockRef.current = false;
        }, 700);
      }
    }
  };

  useEffect(() => {
    if (matched.size === cards.length && cards.length > 0) {
      const xp = Math.max(8, Math.round(30 - moves * 2));
      awardXp(xp);
      toast(t("theme.match.xp", { n: xp }), { variant: "success" });
    }
  }, [matched, cards.length, moves, awardXp, toast, t]);

  const done = cards.length > 0 && matched.size === cards.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-500">
        <span>{t("theme.match.moves", { n: moves })}</span>
        <button onClick={onExit} className="text-xs font-medium transition-colors hover:text-stone-600">
          {t("lesson.exit")}
        </button>
      </div>
      {!done && (
        <p className="text-center text-xs text-stone-500">{t("theme.match.hint")}</p>
      )}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card) => {
          const isOpen = open.has(card.key) || matched.has(card.key);
          const isMatched = matched.has(card.key);
          return (
            <button
              key={card.key}
              onClick={() => tap(card.key)}
              className={`flex min-h-16 items-center justify-center rounded-xl border p-2 text-center text-xs font-medium transition-colors btn-squish sm:min-h-20 sm:text-sm ${
                isMatched
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : isOpen
                    ? "border-teal-400 bg-white text-stone-800 dark:border-teal-700 dark:bg-stone-900 dark:text-stone-100"
                    : "border-stone-200 bg-white text-stone-500 dark:border-stone-800 dark:bg-stone-950"
              }`}
            >
              {isOpen ? card.label : "•"}
            </button>
          );
        })}
      </div>
      {done && (
        <div className="animate-slide-up flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
          <Confetti />
          <p className="text-lg font-bold">{t("theme.match.done")}</p>
          <p className="text-sm text-stone-500 dark:text-stone-500">
            {t("theme.match.summary", { n: moves })}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={onRestart}
              className="h-11 rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish"
            >
              {t("theme.again")}
            </button>
            <button
              onClick={onExit}
              className="h-11 rounded-xl border border-stone-200 px-5 text-sm font-semibold text-stone-600 transition-colors hover:border-teal-300 hover:text-teal-700 dark:border-stone-800 dark:text-stone-300"
            >
              {t("lesson.exit")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ListenMode({
  words,
  speechLang,
  onExit,
  onRestart,
}: {
  words: VocabItem[];
  speechLang: string;
  onExit: () => void;
  onRestart: () => void;
}) {
  const { t } = useLanguage();
  const { recordReview } = useProgress();
  const [queue] = useState<VocabItem[]>(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [audioOk, setAudioOk] = useState(true);
  const word = queue[index];
  const options = useMemo(() => (word ? buildOptions(word, words) : []), [word, words]);
  const done = index >= queue.length;

  // Deteksi ketersediaan speechSynthesis setelah mount (async, agar tidak
  // memicu cascade render).
  useEffect(() => {
    const available =
      typeof window !== "undefined" && "speechSynthesis" in window;
    const id = window.setTimeout(() => setAudioOk(available), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  useEffect(() => {
    if (!word || typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    const timer = setTimeout(() => speak(word.reading ?? word.term, speechLang), 250);
    return () => clearTimeout(timer);
  }, [word, speechLang]);

  const pick = (option: string) => {
    if (!word || picked) return;
    const ok = option === word.meaning;
    recordReview(word, ok);
    if (ok) setCorrect((c) => c + 1);
    setPicked(option);
  };

  if (done) {
    return <ResultView correct={correct} total={words.length} onAgain={onRestart} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-500">
        <span>{t("deck.card", { i: index + 1, t: words.length })}</span>
        <button onClick={onExit} className="text-xs font-medium transition-colors hover:text-stone-600">
          {t("lesson.exit")}
        </button>
      </div>
      <ProgressBar value={((index + 1) / words.length) * 100} />
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <button
          onClick={() => speak(word.reading ?? word.term, speechLang)}
          disabled={!audioOk}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-700 text-white transition-colors hover:bg-teal-800 btn-squish disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t("theme.listen.play")}
        >
          <Icon name="volume" className="h-8 w-8" />
        </button>
        {!audioOk && (
          <p className="text-sm font-semibold text-stone-500 dark:text-stone-500">
            {word.reading ?? word.term}
          </p>
        )}
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          {t("theme.listen.ask")}
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((option) => {
          const isCorrect = option === word.meaning;
          const isPicked = picked === option;
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
                "border-stone-200 bg-white text-stone-500 opacity-60 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-500";
          }
          return (
            <li key={option}>
              <button
                disabled={picked !== null}
                onClick={() => pick(option)}
                className={`flex min-h-12 w-full items-center justify-center rounded-xl border px-4 text-sm font-medium transition-colors active:scale-[0.98] disabled:cursor-default ${style}`}
              >
                {option}
              </button>
            </li>
          );
        })}
      </ul>
      {picked && (
        <button
          onClick={() => {
            setPicked(null);
            setIndex((i) => i + 1);
          }}
          className="h-12 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish"
        >
          {t("mock.next")}
        </button>
      )}
    </div>
  );
}

// ---- Mode Bicara: Web Speech API (SpeechRecognition) dengan fallback
// self-grade. Realistis untuk English & HSK (pinyin); bahasa lain tetap
// bisa dipakai lewat penilaian sendiri.
interface SpeechEvent {
  results: { [index: number]: { [index: number]: { transcript: string } } };
}

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return win.SpeechRecognition ?? win.webkitSpeechRecognition ?? null;
}

function normalizeSpeech(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:'"。！？，、…]/g, "")
    .replace(/\s+/g, " ");
}

function matchSpoken(transcript: string, word: VocabItem): boolean {
  const heard = normalizeSpeech(transcript);
  if (!heard) return false;
  const targets = [word.term, word.reading]
    .filter((v): v is string => Boolean(v))
    .map(normalizeSpeech);
  return targets.some((target) => {
    if (!target) return false;
    if (heard === target) return true;
    return heard.includes(target) || target.includes(heard);
  });
}

function SpeakMode({
  words,
  speechLang,
  onExit,
  onRestart,
}: {
  words: VocabItem[];
  speechLang: string;
  onExit: () => void;
  onRestart: () => void;
}) {
  const { t } = useLanguage();
  const { recordReview } = useProgress();
  const [queue] = useState<VocabItem[]>(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [graded, setGraded] = useState<boolean | null>(null);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const word = queue[index];
  const done = index >= queue.length;

  const supported = useMemo(() => getSpeechRecognitionCtor() !== null, []);

  useEffect(() => {
    return () => {
      recRef.current?.abort();
      recRef.current = null;
      cancelSpeech();
    };
  }, []);

  const grade = (ok: boolean, spoken: string) => {
    if (!word || graded !== null) return;
    recRef.current?.stop();
    recRef.current = null;
    recordReview(word, ok);
    if (ok) setCorrect((c) => c + 1);
    setHeard(spoken);
    setGraded(ok);
    setListening(false);
  };

  const listen = () => {
    if (!word || listening) return;
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    setListening(true);
    setHeard("");
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = speechLang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;
    rec.onresult = (event) => {
      const spoken = event.results[0]?.[0]?.transcript ?? "";
      grade(matchSpoken(spoken, word), spoken);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  };

  const next = () => {
    setGraded(null);
    setHeard("");
    setIndex((i) => i + 1);
  };

  if (done) {
    return <ResultView correct={correct} total={words.length} onAgain={onRestart} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-stone-500 dark:text-stone-500">
        <span>{t("deck.card", { i: index + 1, t: words.length })}</span>
        <button onClick={onExit} className="text-xs font-medium transition-colors hover:text-stone-600">
          {t("lesson.exit")}
        </button>
      </div>
      <ProgressBar value={((index + 1) / words.length) * 100} />

      <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          {t("theme.speak.ask")}
        </p>
        <p className="mt-3 text-3xl font-bold tracking-tight">{word.term}</p>
        {word.reading && (
          <p className="mt-1 text-lg text-stone-500 dark:text-stone-500">
            {word.reading}
          </p>
        )}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={() => speak(word.reading ?? word.term, speechLang)}
            aria-label={t("theme.speak.listen")}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-500 transition-colors hover:border-teal-300 hover:text-teal-700 btn-squish dark:border-stone-800 dark:bg-stone-950 dark:text-stone-500"
          >
            <Icon name="volume" className="h-5 w-5" />
          </button>
          <button
            onClick={listen}
            disabled={listening || !supported}
            aria-label={t(listening ? "theme.speak.listening" : "theme.speak.mic")}
            className={`flex h-16 w-16 items-center justify-center rounded-full text-white transition-colors btn-squish disabled:cursor-not-allowed disabled:opacity-40 ${
              listening
                ? "animate-pulse bg-red-500 hover:bg-red-600"
                : "bg-teal-700 hover:bg-teal-800"
            }`}
          >
            <Icon name="mic" className="h-7 w-7" />
          </button>
        </div>
        <p aria-live="polite" className="mt-3 min-h-4 text-xs text-stone-500 dark:text-stone-500">
          {listening ? t("theme.speak.listening") : t("theme.speak.hint")}
        </p>
        {!supported && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            {t("theme.speak.notSupported")}
          </p>
        )}
      </div>

      {graded === null ? (
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
          <p className="text-center text-xs font-medium text-stone-500">
            {t("theme.speak.selfGrade")}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              onClick={() => grade(false, "")}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-600 transition-colors hover:border-red-300 hover:text-red-600 btn-squish dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"
            >
              <Icon name="check" className="h-5 w-5 rotate-90" />
              {t("theme.speak.fail")}
            </button>
            <button
              onClick={() => grade(true, "")}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 btn-squish"
            >
              <Icon name="check" className="h-5 w-5" />
              {t("theme.speak.success")}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`animate-pop rounded-xl border p-4 text-center text-sm font-medium ${
            graded
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "border-red-200 bg-red-50 text-red-600 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {graded ? (
            t("theme.speak.correct")
          ) : heard ? (
            t("theme.speak.wrong", {
              heard,
              answer: word.reading ?? word.term,
            })
          ) : (
            t("theme.speak.wrongShort", { answer: word.reading ?? word.term })
          )}
          <button
            onClick={next}
            className="mt-3 h-11 w-full rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 btn-squish"
          >
            {t("mock.next")}
          </button>
        </div>
      )}
    </div>
  );
}

export function ThemePractice({
  theme,
  speechLang,
}: {
  theme: ThemePack;
  speechLang: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("flashcard");
  const [sessionKey, setSessionKey] = useState(0);
  // Hanya render isi latihan (berisi data acak) setelah mount di client, agar
  // tidak ada mismatch hidrasi server↔client. setState di efek di sini adalah
  // pola yang benar (deteksi mount) sehingga rule react-hooks dimatikan lokal.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const restart = () => setSessionKey((k) => k + 1);

  const props = {
    words: theme.words,
    onExit: () => router.back(),
    onRestart: restart,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <SlidingTabs<Mode>
          options={MODE_META.map((meta) => ({
            id: meta.id,
            label: (
              <span className="flex items-center gap-1.5">
                <Icon name={meta.icon} className="h-4 w-4" />
                <T id={meta.titleKey} />
              </span>
            ),
          }))}
          active={mode}
          onChange={(m) => {
            setMode(m);
            setSessionKey((k) => k + 1);
          }}
        />
        <p className="text-xs text-stone-500 dark:text-stone-500">
          <T id={MODE_META.find((m) => m.id === mode)!.descKey} />
        </p>
      </div>

      <div key={`${mode}-${sessionKey}`} className="flex flex-col gap-4">
        {mounted && mode === "flashcard" && <FlashcardMode {...props} />}
        {mounted && mode === "quiz" && <QuizMode {...props} />}
        {mounted && mode === "type" && <TypeMode {...props} />}
        {mounted && mode === "match" && <MatchMode {...props} />}
        {mounted && mode === "listen" && (
          <ListenMode {...props} speechLang={speechLang} />
        )}
        {mounted && mode === "speak" && (
          <SpeakMode {...props} speechLang={speechLang} />
        )}
      </div>
    </div>
  );
}
