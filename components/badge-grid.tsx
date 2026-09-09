"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate, stagger } from "animejs";
import { Icon } from "@/components/icons";
import { ProgressRing } from "@/components/progress-ring";
import type { BadgeStatus } from "@/lib/badges";

// Grid penghargaan dengan reveal berbasis anime.js.
//
// Kenapa anime.js (lihat docs/motion.md — "kapan boleh keluar dari CSS"):
// jumlah kolom grid berubah per breakpoint (2/3/4), jadi delay tiap kartu
// hanya bisa dihitung *saat runtime* dari posisi grid sebenarnya —
// `stagger(..., { grid, from: "center" })`. Satu keyframe CSS tidak bisa
// mengekspresikan delay yang bergantung baris+kolom, dan bar tiap badge
// juga punya nilai akhir + durasi sendiri (proporsional ke progresnya).
//
// Guard `prefers-reduced-motion` manual (wajib untuk animasi JS): saat reduce
// kartu langsung dipasang ke keadaan akhir, tanpa animasi apa pun.

// Hitung jumlah kolom dari posisi kartu: kartu di baris pertama punya
// offsetTop yang sama dengan kartu pertama.
function countColumns(cards: HTMLElement[]): number {
  const top = cards[0]?.offsetTop ?? 0;
  const cols = cards.filter((card) => card.offsetTop === top).length;
  return Math.max(cols, 1);
}

function ratioOf(badge: BadgeStatus): number {
  return badge.target > 0 ? Math.min(badge.current / badge.target, 1) : 0;
}

export function BadgeGrid({
  badges,
  t,
}: {
  badges: BadgeStatus[];
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const root = useRef<HTMLDivElement>(null);

  // Yang sudah diraih di depan, sisanya diurut dari yang paling dekat terbuka —
  // badge "tinggal sedikit lagi" jadi terlihat tanpa perlu scroll penuh.
  const ordered = useMemo(
    () =>
      [...badges].sort((a, b) => {
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        return ratioOf(b) - ratioOf(a);
      }),
    [badges],
  );

  const earned = ordered.filter((badge) => badge.earned).length;
  const pct = ordered.length ? Math.round((earned / ordered.length) * 100) : 0;

  // Rasio tiap bar sebagai string — dipakai sebagai dependency supaya bar
  // dianimasikan ulang hanya saat progres benar-benar berubah.
  const ratioKey = ordered.map((badge) => ratioOf(badge).toFixed(3)).join(",");

  // Reveal kartu: sekali saat mount saja. Kalau ikut berubah tiap progres
  // ter-update, seluruh grid akan "muncul ulang" hanya karena XP bertambah.
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const cards = Array.from(
      el.querySelectorAll<HTMLElement>("[data-badge-card]"),
    );
    if (!cards.length) return;

    const reveal = () => {
      for (const card of cards) card.style.opacity = "1";
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveal();
      return;
    }

    const columns = countColumns(cards);
    const animation = animate(cards, {
      opacity: { to: 1 },
      y: { from: 14, to: 0 },
      scale: { from: 0.92, to: 1 },
      duration: 460,
      ease: "out(3)",
      delay: stagger(38, {
        grid: [columns, Math.ceil(cards.length / columns)],
        from: "center",
      }),
    });

    return () => {
      // `revert()` mengembalikan style inline ke nilai awal (tersembunyi),
      // jadi kartu harus dipulihkan agar tetap terbaca saat remount.
      animation.revert();
      reveal();
    };
  }, []);

  // Bar progres: menyusul reveal, lalu ikut ter-update saat progres berubah.
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const bars = Array.from(
      el.querySelectorAll<HTMLElement>("[data-badge-bar]"),
    );
    if (!bars.length) return;

    const ratios = bars.map((bar) => Number(bar.dataset.ratio ?? 0));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bars.forEach((bar, i) => {
        bar.style.transform = `scaleX(${ratios[i]})`;
      });
      return;
    }

    const columns = countColumns(bars);
    const animation = animate(bars, {
      scaleX: (_target?: unknown, i = 0) => ratios[i],
      // Bar yang lebih penuh butuh waktu lebih lama — kecepatan isian seragam.
      duration: (_target?: unknown, i = 0) => 420 + ratios[i] * 520,
      ease: "out(2)",
      delay: stagger(38, {
        grid: [columns, Math.ceil(bars.length / columns)],
        from: "center",
        start: 180,
      }),
    });

    return () => {
      animation.revert();
      bars.forEach((bar, i) => {
        bar.style.transform = `scaleX(${ratios[i]})`;
      });
    };
  }, [ratioKey]);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
      <div className="mb-4 flex items-center gap-4">
        <div className="relative shrink-0">
          <ProgressRing value={pct} size={52} stroke={5} />
          {/* Persentase sudah diumumkan lewat aria-label ProgressRing. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums"
          >
            {pct}%
          </span>
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{t("badge.title")}</h2>
          <p className="text-xs text-stone-500">
            {t("badge.subtitle", { earned, total: ordered.length })}
          </p>
        </div>
      </div>

      <div
        ref={root}
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4"
      >
        {ordered.map((badge) => {
          const ratio = ratioOf(badge);
          return (
            <div
              key={badge.id}
              data-badge-card
              style={{ opacity: 0 }}
              className={`flex flex-col gap-1.5 rounded-xl border p-3 ${
                badge.earned
                  ? "border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100/40 dark:border-amber-800 dark:from-amber-500/10 dark:to-amber-500/5"
                  : "border-stone-200 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-900/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    badge.earned
                      ? "bg-amber-400 text-stone-900 shadow-sm shadow-amber-500/30"
                      : "bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-500"
                  }`}
                >
                  <Icon
                    name={badge.earned ? badge.icon : "lock"}
                    className="h-4 w-4"
                  />
                </span>
                {badge.earned && (
                  <Icon name="check" className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <p className="text-sm font-semibold leading-tight">
                {t(badge.titleKey, badge.titleVars)}
              </p>
              <p className="text-[11px] leading-snug text-stone-500 dark:text-stone-500">
                {t(badge.descKey, badge.descVars)}
              </p>
              <div className="mt-auto flex items-center gap-1.5">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                  <div
                    data-badge-bar
                    data-ratio={ratio}
                    style={{ transform: "scaleX(0)", transformOrigin: "left" }}
                    className={`h-full w-full rounded-full ${
                      badge.earned ? "bg-amber-500" : "bg-teal-600"
                    }`}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-stone-500">
                  {t("badge.progress", {
                    current: badge.current,
                    target: badge.target,
                  })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
