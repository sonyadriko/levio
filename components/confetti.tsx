"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, stagger } from "animejs";

const COLORS = [
  "#14b8a6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#3b82f6",
  "#ec4899",
];

interface Piece {
  left: number;
  color: string;
  width: number;
  height: number;
  round: boolean;
  drift: number;
  spin: number;
  fall: number;
}

function makePieces(count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    color: COLORS[i % COLORS.length],
    width: 6 + Math.random() * 6,
    height: 8 + Math.random() * 8,
    round: Math.random() > 0.5,
    // Hanyut ke samping saat jatuh (kertas ketiup angin), arah acak.
    drift: (Math.random() - 0.5) * 180,
    // Putaran 1–3 kali, searah/berlawanan jarum jam.
    spin: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
    fall: 2000 + Math.random() * 1200,
  }));
}

// Confetti berbasis anime.js: tiap kepingan punya gravitasi (ease `in`),
// hanyut menyamping, dan putarannya sendiri — tidak bisa ditiru satu keyframe CSS.
// Guard `prefers-reduced-motion` eksplisit: animasi JS tidak ikut guard global di
// globals.css, jadi saat reduce container tetap `hidden` dan tak ada yang berjalan.
export function Confetti({ count = 24 }: { count?: number }) {
  const pieces = useMemo(() => makePieces(count), [count]);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    el.style.visibility = "visible";

    const animation = animate(Array.from(el.children) as HTMLElement[], {
      // Gravitasi: makin ke bawah makin cepat.
      y: { to: window.innerHeight + 80, ease: "in(1.7)" },
      x: {
        to: (_target?: unknown, i = 0) => pieces[i].drift,
        ease: "inOut(2)",
      },
      rotate: (_target?: unknown, i = 0) => pieces[i].spin,
      scale: { from: 0, to: 1, duration: 320, ease: "out(4)" },
      // Tahan lalu memudar di ~400ms terakhir (menyamai keyframe lama: fade dari 80%).
      opacity: [{ to: 1 }, { to: 0, duration: 400 }],
      duration: (_target?: unknown, i = 0) => pieces[i].fall,
      delay: stagger(25, { from: "center" }),
      ease: "linear",
    });

    return () => {
      animation.revert();
    };
  }, [pieces]);

  return (
    <div
      ref={root}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      style={{ visibility: "hidden" }}
      aria-hidden="true"
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0"
          style={{
            left: `${p.left}%`,
            width: p.width,
            height: p.height,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
