"use client";

import { useLanguage } from "@/components/language-provider";

export function T({
  id,
  vars,
}: {
  id: string;
  vars?: Record<string, string | number>;
}) {
  const { t } = useLanguage();
  return <>{t(id, vars)}</>;
}
