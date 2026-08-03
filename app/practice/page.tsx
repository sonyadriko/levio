import Link from "next/link";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";
import { getLanguageModule, defaultModule } from "@/lib/languages";

const cards = [
  {
    href: "/practice/order",
    icon: "pen" as const,
    accent: "bg-amber-600",
    titleKey: "builder.title",
    descKey: "builder.subtitle",
  },
  {
    href: "/practice/listening",
    icon: "flame" as const,
    accent: "bg-sky-600",
    titleKey: "listen.title",
    descKey: "listen.subtitle",
  },
  {
    href: "/practice/reading",
    icon: "book" as const,
    accent: "bg-violet-600",
    titleKey: "read.title",
    descKey: "read.subtitle",
  },
  {
    href: "/mock-test",
    icon: "chart" as const,
    accent: "bg-teal-600",
    titleKey: "practice.takeTest",
    descKey: "practice.takeTestDesc",
  },
];

export default async function PracticePage({
  searchParams,
}: PageProps<"/practice">) {
  const { module: moduleId } = await searchParams;
  const languageModule =
    getLanguageModule(typeof moduleId === "string" ? moduleId : "") ??
    defaultModule();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="pen"
        accent="bg-emerald-600"
        title={<T id="practice.title" />}
        subtitle={<T id="practice.subtitle" />}
      />

      {/* Latihan CJK (susun kalimat, mendengarkan, membaca) hanya relevan
          untuk modul dengan tulisan & pelafalan — saat ini HSK. */}
      {languageModule.id === "hsk" && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-teal-700"
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white ${card.accent}`}
              >
                <Icon name={card.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  <T id={card.titleKey} />
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  <T id={card.descKey} />
                </p>
              </div>
              <span className="text-stone-300 dark:text-stone-700">→</span>
            </Link>
          ))}
        </section>
      )}

      <FlashcardDeck moduleId={languageModule.id} />
    </div>
  );
}
