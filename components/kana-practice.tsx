"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { BackLink } from "@/components/back-link";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { ProgressBar } from "@/components/progress-bar";
import { T } from "@/components/translate";
import { useLanguage } from "@/components/language-provider";
import { KanaDrill } from "@/components/kana-drill";
import { KanaTrace } from "@/components/kana-trace";
import type { KanaAlphabet, KanaGroup } from "@/lib/japanese/kana";
import { kanaByAlphabet, KANA_GROUPS } from "@/lib/japanese/kana";
import {
  getKanaServerSnapshot,
  getKanaSnapshot,
  subscribeKana,
  toggleKanaKnown,
  updateKana,
  knownKanaCount,
} from "@/lib/kana-progress";
import type { KanaProgress } from "@/lib/kana-progress";

const GROUP_KEYS: Record<KanaGroup, string> = {
  base: "kana.group.base",
  dakuten: "kana.group.dakuten",
  handakuten: "kana.group.handakuten",
  combination: "kana.group.combination",
};

export function KanaPractice() {
  const { t } = useLanguage();
  const [alphabet, setAlphabet] = useState<KanaAlphabet>("hiragana");
  const [view, setView] = useState<"hub" | "drill" | "trace">("hub");
  const [group, setGroup] = useState<KanaGroup>("base");
  const [nonce, setNonce] = useState(0);
  const progress = useSyncExternalStore(
    subscribeKana,
    getKanaSnapshot,
    getKanaServerSnapshot,
  );

  const items = useMemo(() => kanaByAlphabet(alphabet), [alphabet]);
  const total = items.length;
  const known = knownKanaCount(progress, alphabet, total);
  const knownSet = useMemo(() => new Set(progress[alphabet]), [progress, alphabet]);

  const change = (next: KanaProgress) => updateKana(next);

  if (view === "drill") {
    return (
      <KanaDrill
        key={`drill-${alphabet}-${group}-${nonce}`}
        alphabet={alphabet}
        group={group}
        progress={progress}
        onChange={change}
        onExit={() => setView("hub")}
        onRestart={() => setNonce((n) => n + 1)}
      />
    );
  }

  if (view === "trace") {
    return (
      <KanaTrace
        key={`trace-${alphabet}-${group}-${nonce}`}
        alphabet={alphabet}
        group={group}
        progress={progress}
        onChange={change}
        onExit={() => setView("hub")}
        onRestart={() => setNonce((n) => n + 1)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackLink href="/learn/japanese" labelKey="learn.backToModules" />
        <PageHeader
          icon="pen"
          accent="bg-teal-700"
          title={<T id="kana.title" />}
          subtitle={<T id="kana.desc" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-stone-100 p-1 dark:bg-stone-800/70">
        {(["hiragana", "katakana"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAlphabet(a)}
            className={`flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-colors ${
              alphabet === a
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-stone-100"
                : "text-stone-500 dark:text-stone-500"
            }`}
          >
            <span className="text-base">{a === "hiragana" ? "あ" : "ア"}</span>
            {t(a === "hiragana" ? "kana.hiragana" : "kana.katakana")}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">{t("kana.known")}</span>
          <span className="text-stone-500 dark:text-stone-500">
            {known}/{total}
          </span>
        </div>
        <div className="mt-3">
          <ProgressBar value={(known / total) * 100} />
        </div>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setView("drill")}
          className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 text-left transition-colors hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-teal-700"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-white">
            <Icon name="pen" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t("kana.recognize")}</p>
            <p className="text-xs text-stone-500 dark:text-stone-500">
              {t("kana.recognizeDesc")}
            </p>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setView("trace")}
          className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 text-left transition-colors hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-teal-700"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
            <Icon name="check" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t("kana.trace")}</p>
            <p className="text-xs text-stone-500 dark:text-stone-500">
              {t("kana.traceDesc")}
            </p>
          </div>
        </button>
      </section>

      <div className="flex flex-wrap gap-2">
        {KANA_GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setGroup(g)}
            className={`h-9 rounded-full border px-3 text-xs font-semibold transition-colors ${
              group === g
                ? "border-teal-600 bg-teal-700 text-white"
                : "border-stone-200 bg-white text-stone-600 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
            }`}
          >
            {t(GROUP_KEYS[g])}
          </button>
        ))}
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            {t(GROUP_KEYS[group])}
          </p>
          <p className="text-xs text-stone-500">
            {t("kana.tapToToggle")}
          </p>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
          {items
            .filter((i) => i.group === group)
            .map((i) => {
              const isKnown = knownSet.has(i.kana);
              return (
                <button
                  key={i.kana}
                  type="button"
                  onClick={() =>
                    change(toggleKanaKnown(progress, alphabet, i.kana))
                  }
                  aria-label={`${i.kana} (${i.romaji})`}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl border text-xl font-bold transition-colors active:scale-[0.95] ${
                    isKnown
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      : "border-stone-200 bg-white text-stone-700 hover:border-teal-300 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-teal-700"
                  }`}
                >
                  <span>{i.kana}</span>
                  <span className="text-[10px] font-normal text-stone-500">
                    {i.romaji}
                  </span>
                </button>
              );
            })}
        </div>
      </section>

      <button
        type="button"
        onClick={() => {
          if (typeof window !== "undefined" && window.confirm(t("kana.resetConfirm"))) {
            change({ hiragana: [], katakana: [] });
          }
        }}
        className="mx-auto flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold text-stone-500 transition-colors hover:text-red-500"
      >
        <Icon name="check" className="h-4 w-4 rotate-45" />
        {t("kana.reset")}
      </button>
    </div>
  );
}
