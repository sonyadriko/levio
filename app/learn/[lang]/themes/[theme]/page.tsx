import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";
import { ThemePractice } from "@/components/theme-practice";
import { getModuleThemes } from "@/lib/languages/themes";

export const dynamicParams = false;

export function generateStaticParams() {
  const out: { lang: string; theme: string }[] = [];
  for (const lang of ["hsk", "english", "japanese"]) {
    const themes = getModuleThemes(lang);
    if (!themes) continue;
    for (const theme of themes.packs) out.push({ lang, theme: theme.id });
  }
  return out;
}

export const metadata = {
  title: "Paket Tematik",
};

export default async function ThemePage({
  params,
}: PageProps<"/learn/[lang]/themes/[theme]">) {
  const { lang, theme: themeId } = await params;
  const moduleThemes = getModuleThemes(lang);
  const theme = moduleThemes?.packs.find((t) => t.id === themeId);
  if (!moduleThemes || !theme) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackLink href={`/learn/${lang}`} labelKey="learn.backToLevels" />
        <PageHeader
          icon="star"
          title={<T id={theme.titleKey} />}
          subtitle={<T id={theme.descKey} />}
        />
      </div>
      <ThemePractice theme={theme} speechLang={moduleThemes.speechLang} />
    </div>
  );
}
