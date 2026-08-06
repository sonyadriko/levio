"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import {
  ChoicePracticeSession,
  type ChoiceQ,
} from "@/components/practice-session";
import { generateListeningQuestions } from "@/lib/hsk/exercises";
import type { HskLevel, VocabWord } from "@/lib/hsk/types";
import { generateEnglishListeningQuestions } from "@/lib/english/exercises";
import type { VocabItem } from "@/lib/languages/types";

// Speech lang per modul (nilai fallback ke en-US untuk modul yang belum masuk).
const SPEECH_LANG: Record<string, string> = {
  hsk: "zh-CN",
  english: "en-US",
  japanese: "ja-JP",
};

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

// Referensi stabil di module scope agar useMemo `build` di dalam
// ChoicePracticeSession benar-benar efektif (tidak dibuat ulang per render).
function buildListeningQuestions(
  words: VocabItem[],
  _level: number,
  moduleId: string,
): ChoiceQ[] {
  if (moduleId === "english") {
    return generateEnglishListeningQuestions(words, 8) as ChoiceQ[];
  }
  return generateListeningQuestions(words.map(toHskWord), 8) as ChoiceQ[];
}

// Mainkan suara kata: audio native lewat proxy TTS (/api/tts), fallback ke
// Web Speech API (speechSynthesis) bila audio native gagal (mis. offline).
function useSpeech(speechLang: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [fallback, setFallback] = useState(false);

  // Proxy TTS hanya mengizinkan bahasa yang didaftarkan (zh-CN, en, id).
  const proxyLang = speechLang === "en-US" ? "en" : speechLang;

  const speakNative = useCallback(
    (text: string) => {
      const audio = audioRef.current ?? new Audio();
      audioRef.current = audio;
      audio.pause();
      audio.src = `/api/tts?tl=${proxyLang}&text=${encodeURIComponent(text)}`;
      audio.onerror = () => setFallback(true);
      audio.play().catch(() => setFallback(true));
    },
    [proxyLang],
  );

  const speakFallback = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window))
        return;
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = speechLang;
      utter.rate = 0.8;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    },
    [speechLang],
  );

  const speak = useCallback(
    (text: string) => {
      if (!text) return;
      if (fallback) {
        speakFallback(text);
      } else {
        speakNative(text);
      }
    },
    [fallback, speakFallback, speakNative],
  );

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, supported: true };
}

export function ListeningPractice({ moduleId }: { moduleId?: string }) {
  const { t } = useLanguage();
  const speechLang = SPEECH_LANG[moduleId ?? "hsk"] ?? "en-US";
  const { speak } = useSpeech(speechLang);
  const autoPlayed = useRef<string | null>(null);

  const handleQuestionChange = useCallback(
    (q: ChoiceQ) => {
      if (autoPlayed.current !== q.id && q.prompt) {
        autoPlayed.current = q.id;
        speak(q.prompt);
      }
    },
    [speak],
  );

  return (
    <ChoicePracticeSession
      moduleId={moduleId}
      build={buildListeningQuestions}
      renderPrompt={(q) => (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-500">
            {t("listen.prompt")}
          </p>
          <button
            onClick={() => q.prompt && speak(q.prompt)}
            className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 text-white shadow-lg transition-colors hover:bg-teal-800 active:scale-95"
            aria-label={t("listen.replay")}
          >
            <Icon name="volume" className="h-6 w-6" />
          </button>
        </div>
      )}
      onQuestionChange={handleQuestionChange}
      titleKey="listen.title"
      subtitleKey="listen.subtitle"
      startKey="listen.start"
      sessionHintKey="listen.sessionHint"
      questionKey="listen.question"
      correctKey="listen.correct"
      wrongKey="listen.wrong"
      nextKey="listen.next"
      doneCtaKey="listen.doneCta"
      doneKey="listen.done"
      scoreKey="listen.score"
      againKey="listen.again"
    />
  );
}
