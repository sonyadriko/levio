import { notFound, redirect } from "next/navigation";
import { getLanguageModule } from "@/lib/languages";
import { ModuleLevelList } from "@/components/module-level-list";

// Halaman level per modul bahasa: /learn/hsk, /learn/english, dst.
// Segmen numerik dianggap URL legacy (mis. /learn/3) → dialihkan ke
// /learn/hsk/3.
export default async function LanguagePage({
  params,
}: PageProps<"/learn/[lang]">) {
  const { lang } = await params;

  if (/^\d+$/.test(lang)) {
    const n = Number(lang);
    if (Number.isInteger(n) && n >= 1 && n <= 6) redirect(`/learn/hsk/${n}`);
  }

  const languageModule = getLanguageModule(lang);
  if (!languageModule) notFound();

  return <ModuleLevelList moduleId={languageModule.id} />;
}
