"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/language-provider";
import { Icon } from "@/components/icons";
import type { KanaAlphabet, KanaGroup } from "@/lib/japanese/kana";
import { kanaByAlphabet } from "@/lib/japanese/kana";
import type { KanaProgress } from "@/lib/kana-progress";
import { markKanaKnown } from "@/lib/kana-progress";

const CANVAS_SIZE = 320;
const INTERNAL_SCALE = 2;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function KanaTrace({
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

  const queue = useMemo(
    () => shuffle(alphabetPool.filter((i) => i.group === group)),
    [alphabetPool, group],
  );

  const [index, setIndex] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const clearCanvas = useCallback(() => {
    const el = canvasRef.current;
    const c = el?.getContext("2d");
    if (!el || !c) return;
    c.clearRect(0, 0, el.width, el.height);
  }, []);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    el.width = CANVAS_SIZE * INTERNAL_SCALE;
    el.height = CANVAS_SIZE * INTERNAL_SCALE;
    el.getContext("2d")?.setTransform(INTERNAL_SCALE, 0, 0, INTERNAL_SCALE, 0, 0);
    clearCanvas();
  }, [index, clearCanvas]);

  const current = queue[index];
  if (!current) return null;

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const el = canvasRef.current;
    const rect = el?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;
    return { x, y };
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const el = canvasRef.current;
    const c = el?.getContext("2d");
    if (!el || !c) return;
    el.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    c.beginPath();
    c.moveTo(last.current.x, last.current.y);
    c.strokeStyle = "#0d9488";
    c.lineWidth = 9;
    c.lineCap = "round";
    c.lineJoin = "round";
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current?.getContext("2d");
    if (!drawing.current || !c) return;
    const p = point(e);
    c.lineTo(p.x, p.y);
    c.stroke();
    last.current = p;
  };

  const onUp = () => {
    drawing.current = false;
  };

  const grade = () => {
    onChange(markKanaKnown(progress, alphabet, current.kana));
    setDoneCount((c) => c + 1);
    setIndex((i) => i + 1);
  };

  const skip = () => {
    setIndex((i) => i + 1);
  };

  if (index >= queue.length) {
    return (
      <div className="animate-slide-up rounded-2xl border border-stone-200 bg-white p-6 text-center dark:border-stone-800 dark:bg-stone-950">
        <p className="text-3xl font-black tracking-tight text-teal-600 dark:text-teal-400">
          {doneCount}/{queue.length}
        </p>
        <p className="mt-2 text-sm font-medium text-stone-600 dark:text-stone-300">
          {t("kana.traceDone")}
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
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span>
          {Math.min(index + 1, queue.length)}/{queue.length}
        </span>
        <span>
          {t("kana.knownCount", {
            known: progress[alphabet].length,
            total: alphabetPool.length,
          })}
        </span>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
        <p className="text-center text-sm font-medium text-stone-500 dark:text-stone-400">
          {current.romaji}
        </p>
        <p className="mt-1 text-center text-xs text-stone-400">{t("kana.traceHint")}</p>
        <div className="relative mx-auto mt-4 h-80 w-80 overflow-hidden rounded-2xl border border-dashed border-stone-300 bg-stone-50 dark:border-stone-700 dark:bg-stone-900">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[130px] font-bold leading-none text-stone-400/40"
          >
            {current.kana}
          </span>
          <canvas
            ref={canvasRef}
            className="absolute inset-0 h-full w-full touch-none"
            style={{ touchAction: "none" }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onPointerLeave={onUp}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={clearCanvas}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
          >
            <Icon name="check" className="h-4 w-4 rotate-45" />
            {t("kana.clear")}
          </button>
          <button
            type="button"
            onClick={skip}
            className="flex h-11 items-center justify-center rounded-xl border border-stone-200 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-900"
          >
            {t("kana.skip")}
          </button>
          <button
            type="button"
            onClick={grade}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
          >
            <Icon name="check" className="h-4 w-4" />
            {t("kana.looksGood")}
          </button>
        </div>
      </div>
    </div>
  );
}
