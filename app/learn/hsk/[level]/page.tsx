import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { Icon } from "@/components/icons";
import { T } from "@/components/translate";
import { LevelContent } from "@/components/level-content";
import { allLevels, getLevelMeta } from "@/lib/hsk/levels";
import type { HskLevel } from "@/lib/hsk/types";

export function generateStaticParams() {
  return allLevels().map((level) => ({ level: String(level) }));
}

export default async function LevelPage({
  params,
}: PageProps<"/learn/hsk/[level]">) {
  const { level: raw } = await params;
  const level = Number(raw) as HskLevel;

  if (!getLevelMeta(level)) notFound();

  const meta = getLevelMeta(level);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackLink href="/learn/hsk" labelKey="level.back" />
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 font-bold text-white">
          {level}
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {meta.name}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            <T id={`levelDesc.${level}`} />
          </p>
        </div>
      </div>

      <LevelContent level={level} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/practice"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
        >
          <Icon name="pen" className="h-5 w-5" />
          <T id="level.flashcards" />
        </Link>
        <Link
          href="/mock-test"
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-700 transition-colors hover:border-teal-300 hover:text-teal-600 active:scale-[0.97] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-teal-700 dark:hover:text-teal-400"
        >
          <Icon name="chart" className="h-5 w-5" />
          <T id="level.mockTest" vars={{ name: meta.name }} />
        </Link>
      </div>
    </div>
  );
}
