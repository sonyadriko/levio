import Link from "next/link";
import { Icon } from "@/components/icons";
import { T } from "@/components/translate";
import { methodsFor } from "@/lib/languages/methods";
import type { LanguageModule } from "@/lib/languages/types";

// Kartu modul di hub /learn: header navigasi ke daftar level + daftar metode
// belajar yang didukung modul (apa), bisa dibuka/tutup.
export function ModuleHubCard({ module }: { module: LanguageModule }) {
  const methods = methodsFor(module);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
      <Link
        href={`/learn/${module.id}`}
        className="flex items-center gap-4 p-4 transition-colors hover:bg-stone-50 dark:hover:bg-stone-900"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-700 text-lg font-bold text-white">
          {module.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            <T id={module.nameKey} />
          </p>
          <p className="text-xs text-stone-500 dark:text-stone-500">
            <T id={module.descriptionKey} />
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-stone-500">
          <T id="learn.wordCount" vars={{ n: module.totalWordCount() }} />
        </span>
      </Link>

      <details
        open
        className="group border-t border-stone-200 dark:border-stone-800"
      >
        <summary className="flex cursor-pointer select-none items-center justify-between px-4 py-3 text-xs font-semibold text-stone-500 transition-colors hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-200">
          <span>
            <T id="learn.methodsTitle" vars={{ n: methods.length }} />
          </span>
          <span className="text-stone-500 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)] group-open:rotate-180">
            ▾
          </span>
        </summary>

        <div className="grid grid-cols-1 gap-2 px-4 pb-4 sm:grid-cols-2">
          {methods.map((method) => (
            <div
              key={method.id}
              className="rounded-xl border border-stone-200 p-3 dark:border-stone-800"
            >
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-500">
                  <Icon name={method.icon} className="h-4 w-4" />
                </span>
                <p className="text-sm font-semibold">
                  <T id={method.titleKey} />
                </p>
              </div>
              <p className="mt-2 text-xs text-stone-600 dark:text-stone-300">
                <T id={method.descKey} />
              </p>
              <Link
                href={method.href(module)}
                className="mt-2 inline-flex h-8 items-center gap-1 rounded-lg bg-teal-700 px-3 text-xs font-semibold text-white transition-colors hover:bg-teal-800"
              >
                <T id="learn.methodStart" /> →
              </Link>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
