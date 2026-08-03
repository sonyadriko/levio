import type { KanaAlphabet } from "./japanese/kana";

// Progres kana terpisah dari SRS vocab: hanya daftar huruf yang sudah
// dikuasai user (dari drill/tracing/ketukan manual). Tanpa XP/badge.
export const KANA_STORAGE_KEY = "levio.kana.v1";

export interface KanaProgress {
  hiragana: string[];
  katakana: string[];
}

export const EMPTY_KANA_PROGRESS: KanaProgress = { hiragana: [], katakana: [] };

export function loadKanaProgress(): KanaProgress {
  if (typeof window === "undefined") return EMPTY_KANA_PROGRESS;
  try {
    const raw = window.localStorage.getItem(KANA_STORAGE_KEY);
    if (!raw) return EMPTY_KANA_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<KanaProgress>;
    return {
      hiragana: Array.isArray(parsed.hiragana)
        ? parsed.hiragana.filter((k): k is string => typeof k === "string")
        : [],
      katakana: Array.isArray(parsed.katakana)
        ? parsed.katakana.filter((k): k is string => typeof k === "string")
        : [],
    };
  } catch {
    return EMPTY_KANA_PROGRESS;
  }
}

export function saveKanaProgress(progress: KanaProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KANA_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage penuh / tidak tersedia — abaikan.
  }
}

export function knownKana(progress: KanaProgress, alphabet: KanaAlphabet): Set<string> {
  return new Set(progress[alphabet]);
}

export function isKanaKnown(progress: KanaProgress, alphabet: KanaAlphabet, kana: string): boolean {
  return progress[alphabet].includes(kana);
}

export function toggleKanaKnown(
  progress: KanaProgress,
  alphabet: KanaAlphabet,
  kana: string,
): KanaProgress {
  const list = progress[alphabet];
  const next = list.includes(kana)
    ? list.filter((k) => k !== kana)
    : [...list, kana];
  return { ...progress, [alphabet]: next };
}

export function markKanaKnown(
  progress: KanaProgress,
  alphabet: KanaAlphabet,
  kana: string,
): KanaProgress {
  if (progress[alphabet].includes(kana)) return progress;
  return { ...progress, [alphabet]: [...progress[alphabet], kana] };
}

export function knownKanaCount(
  progress: KanaProgress,
  alphabet: KanaAlphabet,
  total: number,
): number {
  const count = progress[alphabet].length;
  return Math.max(0, Math.min(total, count));
}

// Store reaktif ringan di atas localStorage agar bisa dibaca via
// useSyncExternalStore tanpa SSR-hydration mismatch (server selalu kosong,
// klien memuat setelah hidrasi) dan tanpa setState di dalam effect.
let cached: KanaProgress | null = null;
const listeners = new Set<() => void>();

function current(): KanaProgress {
  if (cached === null) cached = loadKanaProgress();
  return cached;
}

function notify(): void {
  for (const l of listeners) l();
}

export function subscribeKana(onChange: () => void): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

export function getKanaSnapshot(): KanaProgress {
  return current();
}

export function getKanaServerSnapshot(): KanaProgress {
  return EMPTY_KANA_PROGRESS;
}

export function updateKana(next: KanaProgress): void {
  cached = next;
  saveKanaProgress(next);
  notify();
}
