"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";

export function BackLink({
  href,
  labelKey,
}: {
  href: string;
  labelKey: string;
}) {
  const { t } = useLanguage();
  return (
    <Link
      href={href}
      aria-label={t(labelKey)}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-500 transition-colors hover:border-teal-300 hover:text-teal-700 dark:border-stone-800 dark:text-stone-500 dark:hover:border-teal-700"
    >
      ←
    </Link>
  );
}
