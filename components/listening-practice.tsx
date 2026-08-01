"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import {
  ChoicePracticeSession,
  type ChoiceQ,
} from "@/components/practice-session";
import { generateListeningQuestions } from "@/lib/hsk/exercises";
import type { VocabWord } from "@/lib/hsk/types";

// Mainkan suara kata: audio native lewat proxy TTS (/api/tts), fallback ke
// Web Speech API (speechSynthesis) bila audio native gagal (mis. offline).
function useSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [fallback, setFallback] = useState(false);

  const speakNative = useCallback((text: string) => {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.pause();
    audio.src = `/api/tts?tl=zh-CN&text=${encodeURIComponent(text)}`;
    audio.onerror = () => setFallback(true);
    audio.play().catch(() => setFallback(true));
  }, []);

  const speakFallback = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "zh-CN";
    utter.rate = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, []);

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

export function ListeningPractice() {
  const { t } = useLanguage();
  const { speak } = useSpeech();
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
      build={(w: VocabWord[]) => generateListeningQuestions(w, 8) as ChoiceQ[]}
      renderPrompt={(q) => (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center dark:border-stone-800 dark:bg-stone-900">
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">
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
