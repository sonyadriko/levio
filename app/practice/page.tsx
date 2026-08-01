import Link from "next/link";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { Icon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";

export default function PracticePage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="pen"
        accent="bg-emerald-600"
        title={<T id="practice.title" />}
        subtitle={<T id="practice.subtitle" />}
      />

      <Link
        href="/mock-test"
        className="flex items-center gap-3 rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-teal-700"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white">
          <Icon name="chart" className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            <T id="practice.takeTest" />
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            <T id="practice.takeTestDesc" />
          </p>
        </div>
        <span className="text-stone-300 dark:text-stone-700">→</span>
      </Link>

      <FlashcardDeck />
    </div>
  );
}
