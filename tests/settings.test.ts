import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SETTINGS,
  SETTINGS_STORAGE_KEY,
  loadSettings,
  saveSettings,
} from "../lib/settings";

class MemoryStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

function stubWindow(storage: MemoryStorage): void {
  vi.stubGlobal("window", { localStorage: storage });
}

describe("loadSettings", () => {
  it("mengembalikan default tanpa storage", () => {
    const storage = new MemoryStorage();
    stubWindow(storage);
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    vi.unstubAllGlobals();
  });

  it("membaca nilai tersimpan", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({
        name: "Andi",
        dailyTargets: { vocab: 20, reviews: 30, xp: 80 },
        theme: "dark",
      }),
    );
    stubWindow(storage);
    expect(loadSettings()).toEqual({
      name: "Andi",
      dailyTargets: { vocab: 20, reviews: 30, xp: 80 },
      theme: "dark",
    });
    vi.unstubAllGlobals();
  });

  it("clamp target harian ke 1..100", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ dailyTargets: { vocab: 999, reviews: 0, xp: -5 } }),
    );
    stubWindow(storage);
    const s = loadSettings();
    expect(s.dailyTargets.vocab).toBe(100);
    expect(s.dailyTargets.reviews).toBe(1);
    expect(s.dailyTargets.xp).toBe(1);
    vi.unstubAllGlobals();
  });

  it("tema invalid jatuh ke auto", () => {
    const storage = new MemoryStorage();
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ theme: "neon" }));
    stubWindow(storage);
    expect(loadSettings().theme).toBe("auto");
    vi.unstubAllGlobals();
  });

  it("JSON rusak mengembalikan default", () => {
    const storage = new MemoryStorage();
    storage.setItem(SETTINGS_STORAGE_KEY, "{rusak");
    stubWindow(storage);
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    vi.unstubAllGlobals();
  });
});

describe("saveSettings", () => {
  it("menyimpan lalu bisa dibaca ulang", () => {
    const storage = new MemoryStorage();
    stubWindow(storage);
    saveSettings({ name: "Budi", dailyTargets: { vocab: 15, reviews: 20, xp: 100 }, theme: "light" });
    const saved = JSON.parse(storage.getItem(SETTINGS_STORAGE_KEY)!);
    expect(saved.name).toBe("Budi");
    expect(saved.theme).toBe("light");
    expect(loadSettings()).toEqual({
      name: "Budi",
      dailyTargets: { vocab: 15, reviews: 20, xp: 100 },
      theme: "light",
    });
    vi.unstubAllGlobals();
  });
});
