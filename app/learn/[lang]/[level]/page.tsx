import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { Icon } from "@/components/icons";
import { T } from "@/components/translate";
import { LevelContent } from "@/components/level-content";
import { allLanguageModules, getLanguageModule } from "@/lib/languages";

export function generateStaticParams() {
  const params: { lang: string; level: string }[] = [];
  for (const languageModule of allLanguageModules()) {
    for (const meta of languageModule.levels()) {
      params.push({ lang: languageModule.id, level: String(meta.index) });
    }
  }
  return params;
}

export default async function LanguageLevelPage({
  params,
}: PageProps<"/learn/[lang]/[level]">) {
  const { lang, level: raw } = await params;
  const languageModule = getLanguageModule(lang);
  const level = Number(raw);

  if (
    !languageModule ||
    !Number.isInteger(level) ||
    level < 1 ||
    level > languageModule.maxLevel
  ) {
    notFound();
  }

  const badge =
    languageModule.id === "hsk"
      ? String(level)
      : languageModule.levelName(level);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackLink href={`/learn/${languageModule.id}`} labelKey="level.back" />
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-700 font-bold text-white">
          {badge}
        </span>
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {languageModule.levelName(level)}
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            <T id={languageModule.levelDescriptionKey(level)} />
          </p>
        </div>
      </div>

      <LevelContent moduleId={languageModule.id} level={level} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href={`/practice?module=${languageModule.id}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
        >
          <Icon name="pen" className="h-5 w-5" />
          <T id="level.flashcards" />
        </Link>
        <Link
          href={`/mock-test?module=${languageModule.id}`}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-700 transition-colors hover:border-teal-300 hover:text-teal-600 active:scale-[0.97] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-teal-700 dark:hover:text-teal-400"
        >
          <Icon name="chart" className="h-5 w-5" />
          <T id="level.mockTest" vars={{ name: languageModule.levelName(level) }} />
        </Link>
      </div>
    </div>
  );
}
