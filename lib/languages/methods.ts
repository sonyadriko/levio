import type { IconName } from "@/lib/nav";
import type { LanguageModule } from "./types";

// Metode belajar generik. Setiap metode punya penjelasan "apa" (descKey) dan
// "kenapa" (whyKey) — alasan pedagogis — sehingga halaman hub bisa menjelaskan
// metode ke user. Ketersediaan per modul ditentukan dari kemampuan modul.
export interface LanguageMethod {
  id: string;
  icon: IconName;
  titleKey: string;
  descKey: string;
  whyKey: string;
  href: (module: LanguageModule) => string;
  available: (module: LanguageModule) => boolean;
}

export const LANGUAGE_METHODS: LanguageMethod[] = [
  {
    id: "flashcard",
    icon: "book",
    titleKey: "method.flashcard.title",
    descKey: "method.flashcard.desc",
    whyKey: "method.flashcard.why",
    href: (m) => `/practice?module=${m.id}`,
    available: () => true,
  },
  {
    id: "lesson",
    icon: "pen",
    titleKey: "method.lesson.title",
    descKey: "method.lesson.desc",
    whyKey: "method.lesson.why",
    href: (m) => `/learn/${m.id}/1`,
    available: (m) => m.supportsLesson,
  },
  {
    id: "sentence",
    icon: "star",
    titleKey: "method.sentence.title",
    descKey: "method.sentence.desc",
    whyKey: "method.sentence.why",
    href: () => "/practice/order",
    available: (m) => m.id === "hsk",
  },
  {
    id: "listening",
    icon: "volume",
    titleKey: "method.listening.title",
    descKey: "method.listening.desc",
    whyKey: "method.listening.why",
    href: () => "/practice/listening",
    available: (m) => m.id === "hsk",
  },
  {
    id: "reading",
    icon: "book",
    titleKey: "method.reading.title",
    descKey: "method.reading.desc",
    whyKey: "method.reading.why",
    href: () => "/practice/reading",
    available: (m) => m.id === "hsk",
  },
  {
    id: "typing",
    icon: "pen",
    titleKey: "method.typing.title",
    descKey: "method.typing.desc",
    whyKey: "method.typing.why",
    href: (m) => `/learn/${m.id}/1`,
    available: (m) => m.supportsTyping,
  },
  {
    id: "kana",
    icon: "pen",
    titleKey: "method.kana.title",
    descKey: "method.kana.desc",
    whyKey: "method.kana.why",
    href: (m) => m.script?.path ?? `/learn/${m.id}`,
    available: (m) => !!m.script,
  },
  {
    id: "mockTest",
    icon: "chart",
    titleKey: "method.mockTest.title",
    descKey: "method.mockTest.desc",
    whyKey: "method.mockTest.why",
    href: (m) => `/mock-test?module=${m.id}`,
    available: () => true,
  },
];

export function methodsFor(module: LanguageModule): LanguageMethod[] {
  return LANGUAGE_METHODS.filter((method) => method.available(module));
}
