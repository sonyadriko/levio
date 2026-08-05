import { describe, expect, it } from "vitest";
import {
  generateEnglishListeningQuestions,
  generateEnglishGrammarQuestions,
} from "../lib/english/exercises";
import type { VocabItem } from "../lib/languages/types";

const words: VocabItem[] = [
  { id: "en-a1-001", term: "I", meaning: "saya", level: 1, example: "I am a student.", exampleMeaning: "Saya seorang pelajar." },
  { id: "en-a1-002", term: "you", meaning: "kamu; Anda", level: 1, example: "You are my friend.", exampleMeaning: "Kamu temanku." },
  { id: "en-a1-003", term: "he", meaning: "dia", level: 1, example: "He is my brother.", exampleMeaning: "Dia saudara laki-lakiku." },
  { id: "en-a1-010", term: "is", meaning: "adalah", level: 1, example: "He is a teacher.", exampleMeaning: "Dia seorang guru." },
  { id: "en-a1-011", term: "are", meaning: "adalah", level: 1, example: "You are kind.", exampleMeaning: "Kamu baik." },
  { id: "en-a1-013", term: "yes", meaning: "ya", level: 1, example: "Yes, I like tea.", exampleMeaning: "Ya, saya suka teh." },
];

describe("generateEnglishListeningQuestions", () => {
  it("menghasilkan soal pilihan ganda dengar kata → pilih arti", () => {
    const questions = generateEnglishListeningQuestions(words, 4);
    expect(questions).toHaveLength(4);
    for (const q of questions) {
      expect(words.some((w) => w.term === q.prompt)).toBe(true);
      expect(q.options).toContain(q.answer);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.answer).toBe(words.find((w) => w.term === q.prompt)!.meaning);
    }
  });

  it("count lebih besar dari kata → memakai semua kata", () => {
    const questions = generateEnglishListeningQuestions(words, 100);
    expect(questions).toHaveLength(words.length);
  });

  it("tidak punya opsi jawaban ganda (meaning unik)", () => {
    const questions = generateEnglishListeningQuestions(words, 100);
    for (const q of questions) {
      const count = q.options.filter((o) => o === q.answer).length;
      expect(count).toBe(1);
    }
  });
});

describe("generateEnglishGrammarQuestions", () => {
  it("menghasilkan cloze dari kalimat contoh yang memuat kata", () => {
    const questions = generateEnglishGrammarQuestions(words, 3);
    expect(questions.length).toBeGreaterThan(0);
    for (const q of questions) {
      expect(q.blanked).toContain("_____");
      expect(q.blanked.toLowerCase()).not.toMatch(
        new RegExp(`\\b${q.answer}\\b`),
      );
      expect(q.sentence.toLowerCase()).toContain(q.answer.toLowerCase());
      expect(q.options).toContain(q.answer);
      expect(q.meaning.length).toBeGreaterThan(0);
    }
  });

  it("count lebih besar dari kata yang bisa dipakai → dibatasi jumlah kata", () => {
    const questions = generateEnglishGrammarQuestions(words, 100);
    expect(questions.length).toBeLessThanOrEqual(words.length);
  });

  it("membuang kata tanpa contoh kalimat", () => {
    const withBlanks = words.filter((w) => w.example);
    const without = withBlanks.map((w) => ({ ...w, example: undefined }));
    const questions = generateEnglishGrammarQuestions(without, 100);
    expect(questions).toHaveLength(0);
  });
});
