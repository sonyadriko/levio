import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";
import { totalWordCount } from "@/lib/hsk";

export default function LearnPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="book"
        title={<T id="learn.hubTitle" />}
        subtitle={<T id="learn.hubSubtitle" />}
      />

      <section className="flex flex-col gap-3">
        <Link
          href="/learn/hsk"
          className="flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 transition-colors hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:hover:border-teal-700"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-lg font-bold text-white">
            汉
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              <T id="learn.moduleMandarin" />
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              <T id="learn.moduleHskDesc" />
            </p>
          </div>
          <span className="shrink-0 text-xs font-medium text-stone-400">
            <T id="learn.wordCount" vars={{ n: totalWordCount() }} />
          </span>
        </Link>
      </section>
    </div>
  );
}
