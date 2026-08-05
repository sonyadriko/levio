import type { IconName } from "@/lib/nav";
import type { LanguageModule } from "./types";

// Metode belajar generik. Setiap metode punya penjelasan "apa" (descKey)
// sehingga halaman hub menampilkan ringkasan cara kerjanya. Ketersediaan per
// modul ditentukan dari kemampuan modul.
export interface LanguageMethod {
  id: string;
  icon: IconName;
  titleKey: string;
  descKey: string;
  href: (module: LanguageModule) => string;
  available: (module: LanguageModule) => boolean;
}

export const LANGUAGE_METHODS: LanguageMethod[] = [
  {
    id: "flashcard",
    icon: "book",
    titleKey: "method.flashcard.title",
    descKey: "method.flashcard.desc",
    href: (m) => `/practice?module=${m.id}`,
    available: () => true,
  },
  {
    id: "lesson",
    icon: "pen",
    titleKey: "method.lesson.title",
    descKey: "method.lesson.desc",
    href: (m) => `/learn/${m.id}/1`,
    available: (m) => m.supportsLesson,
  },
  {
    id: "sentence",
    icon: "star",
    titleKey: "method.sentence.title",
    descKey: "method.sentence.desc",
    href: () => "/practice/order",
    available: (m) => m.id === "hsk",
  },
  {
    id: "listening",
    icon: "volume",
    titleKey: "method.listening.title",
    descKey: "method.listening.desc",
    href: (m) => `/practice/listening?module=${m.id}`,
    available: (m) => m.id === "hsk" || m.id === "english",
  },
  {
    id: "reading",
    icon: "book",
    titleKey: "method.reading.title",
    descKey: "method.reading.desc",
    href: (m) => `/practice/reading?module=${m.id}`,
    available: (m) => m.id === "hsk",
  },
  {
    id: "grammar",
    icon: "pen",
    titleKey: "method.grammar.title",
    descKey: "method.grammar.desc",
    href: (m) => `/practice/grammar?module=${m.id}`,
    available: (m) => m.id === "english",
  },
  {
    id: "typing",
    icon: "pen",
    titleKey: "method.typing.title",
    descKey: "method.typing.desc",
    href: (m) => `/learn/${m.id}/1`,
    available: (m) => m.supportsTyping,
  },
  {
    id: "kana",
    icon: "pen",
    titleKey: "method.kana.title",
    descKey: "method.kana.desc",
    href: (m) => m.script?.path ?? `/learn/${m.id}`,
    available: (m) => !!m.script,
  },
  {
    id: "mockTest",
    icon: "chart",
    titleKey: "method.mockTest.title",
    descKey: "method.mockTest.desc",
    href: (m) => `/mock-test?module=${m.id}`,
    available: () => true,
  },
];

export function methodsFor(module: LanguageModule): LanguageMethod[] {
  return LANGUAGE_METHODS.filter((method) => method.available(module));
}
