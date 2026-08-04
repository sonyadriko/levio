import { notFound } from "next/navigation";
import { BackLink } from "@/components/back-link";
import { PageHeader } from "@/components/page-header";
import { T } from "@/components/translate";
import { ThemePractice } from "@/components/theme-practice";
import {
  allJapaneseThemes,
  getJapaneseTheme,
} from "@/lib/japanese/themes";

export const dynamicParams = false;

export function generateStaticParams() {
  return allJapaneseThemes().map((theme) => ({ theme: theme.id }));
}

export const metadata = {
  title: "Paket Tematik",
};

export default async function ThemePage({
  params,
}: PageProps<"/learn/japanese/themes/[theme]">) {
  const { theme: themeId } = await params;
  const theme = getJapaneseTheme(themeId);
  if (!theme) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <BackLink href="/learn/japanese" labelKey="learn.backToLevels" />
        <PageHeader
          icon="star"
          title={<T id={theme.titleKey} />}
          subtitle={<T id={theme.descKey} />}
        />
      </div>
      <ThemePractice theme={theme} />
    </div>
  );
}
