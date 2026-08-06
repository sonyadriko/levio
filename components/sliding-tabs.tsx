"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface SlidingTabOption<T extends string> {
  id: T;
  label: React.ReactNode;
}

interface SlidingTabsProps<T extends string> {
  options: SlidingTabOption<T>[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}

// Indikator pill yang mengukur lebar tombol aktif lalu meluncur menuju
// tombol baru (glide, lihat docs/motion.md). Murni transform/opacity.
export function SlidingTabs<T extends string>({
  options,
  active,
  onChange,
  className = "",
}: SlidingTabsProps<T>) {
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const prevActive = useRef<T | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const [ready, setReady] = useState(false);

  const measure = useCallback(
    (scroll: boolean) => {
      const el = btnRefs.current[active];
      if (!el) return;
      setPill({ left: el.offsetLeft, width: el.offsetWidth });
      if (scroll) {
        el.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: "smooth",
        });
      }
    },
    [active],
  );

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      measure(false);
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, [measure]);

  useEffect(() => {
    if (prevActive.current !== null && prevActive.current !== active) {
      const id = requestAnimationFrame(() => measure(true));
      prevActive.current = active;
      return () => cancelAnimationFrame(id);
    }
    prevActive.current = active;
  }, [active, measure]);

  useEffect(() => {
    const onResize = () => measure(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measure]);

  return (
    <div
      role="tablist"
      className={`relative flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-stone-800 dark:bg-stone-900 ${className}`}
    >
      <span
        aria-hidden
        className="absolute bottom-1 top-1 rounded-lg bg-white shadow-sm ring-1 ring-stone-200 dark:bg-stone-800 dark:ring-stone-700"
        style={{
          left: pill?.left ?? 0,
          width: pill?.width ?? 0,
          transition: ready
            ? "left 400ms cubic-bezier(0.65, 0, 0.35, 1), width 400ms cubic-bezier(0.65, 0, 0.35, 1)"
            : "none",
        }}
      />
      {options.map((opt) => {
        const isActive = opt.id === active;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            ref={(el) => {
              btnRefs.current[opt.id] = el;
            }}
            onClick={() => onChange(opt.id)}
            className={`relative z-10 flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "text-teal-700 dark:text-teal-400"
                : "text-stone-500 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
