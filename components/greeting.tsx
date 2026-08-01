"use client";

import { useLanguage } from "@/components/language-provider";
import { useSettings } from "@/components/settings-provider";

export function Greeting() {
  const { t } = useLanguage();
  const { settings } = useSettings();

  const name = settings.name.trim();
  return <>{name ? t("home.greetingNamed", { name }) : t("home.greeting")}</>;
}
