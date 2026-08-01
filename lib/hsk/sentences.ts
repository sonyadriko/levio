import type { HskLevel } from "./types";

/**
 * Bank kalimat contoh untuk latihan pemahaman kalimat.
 *
 * Dasar riset: dukungan konteks semantik meningkatkan perolehan kosakata
 * (Mulder et al., 2018, Applied Psycholinguistics) — belajar kata lewat
 * kalimat utuh lebih efektif daripada hafalan isolasi.
 *
 * Kalimat ditulis hanya dari kosakata yang ada di `data.ts` level tsb
 * (field `words` = id kata yang dipakai), agar sejalan dengan kurikulum.
 * TODO: tambah kalimat untuk HSK 2–6 saat datanya tersedia.
 */
export interface ExampleSentence {
  id: string;
  hanzi: string;
  pinyin: string;
  meaning: string;
  hsk: HskLevel;
  words: string[];
}

export const sentences: ExampleSentence[] = [
  { id: "hsk1-s01", hanzi: "我爱你。", pinyin: "Wǒ ài nǐ.", meaning: "Aku mencintaimu.", hsk: 1, words: ["hsk1-001", "hsk1-112", "hsk1-072"] },
  { id: "hsk1-s02", hanzi: "我爸爸是老师。", pinyin: "Wǒ bàba shì lǎoshī.", meaning: "Ayahku seorang guru.", hsk: 1, words: ["hsk1-003", "hsk1-095", "hsk1-054", "hsk1-112"] },
  { id: "hsk1-s03", hanzi: "她是我的好朋友。", pinyin: "Tā shì wǒ de hǎo péngyou.", meaning: "Dia teman baikku.", hsk: 1, words: ["hsk1-105", "hsk1-095", "hsk1-015", "hsk1-035", "hsk1-076"] },
  { id: "hsk1-s04", hanzi: "我有一个女儿。", pinyin: "Wǒ yǒu yí ge nǚ'ér.", meaning: "Aku punya anak perempuan.", hsk: 1, words: ["hsk1-112", "hsk1-136", "hsk1-131", "hsk1-031", "hsk1-075"] },
  { id: "hsk1-s05", hanzi: "妈妈在看书。", pinyin: "Māmā zài kàn shū.", meaning: "Ibu sedang membaca buku.", hsk: 1, words: ["hsk1-059", "hsk1-138", "hsk1-050", "hsk1-096"] },
  { id: "hsk1-s06", hanzi: "他喜欢喝茶。", pinyin: "Tā xǐhuan hē chá.", meaning: "Dia suka minum teh.", hsk: 1, words: ["hsk1-104", "hsk1-115", "hsk1-037", "hsk1-010"] },
  { id: "hsk1-s07", hanzi: "我明天去学校。", pinyin: "Wǒ míngtiān qù xuéxiào.", meaning: "Besok aku pergi ke sekolah.", hsk: 1, words: ["hsk1-112", "hsk1-067", "hsk1-082", "hsk1-130"] },
  { id: "hsk1-s08", hanzi: "你叫什么名字？", pinyin: "Nǐ jiào shénme míngzi?", meaning: "Siapa namamu?", hsk: 1, words: ["hsk1-072", "hsk1-046", "hsk1-092", "hsk1-066"] },
  { id: "hsk1-s09", hanzi: "这是我的家。", pinyin: "Zhè shì wǒ de jiā.", meaning: "Ini rumahku.", hsk: 1, words: ["hsk1-142", "hsk1-095", "hsk1-015", "hsk1-045"] },
  { id: "hsk1-s10", hanzi: "我们都爱汉语。", pinyin: "Wǒmen dōu ài Hànyǔ.", meaning: "Kami semua suka bahasa Mandarin.", hsk: 1, words: ["hsk1-113", "hsk1-021", "hsk1-001", "hsk1-034"] },
  { id: "hsk1-s11", hanzi: "我不认识他。", pinyin: "Wǒ bú rènshi tā.", meaning: "Aku tidak mengenalnya.", hsk: 1, words: ["hsk1-112", "hsk1-008", "hsk1-085", "hsk1-104"] },
  { id: "hsk1-s12", hanzi: "现在是八点。", pinyin: "Xiànzài shì bā diǎn.", meaning: "Sekarang pukul delapan.", hsk: 1, words: ["hsk1-120", "hsk1-095", "hsk1-002", "hsk1-016"] },
  { id: "hsk1-s13", hanzi: "我今天很好。", pinyin: "Wǒ jīntiān hěn hǎo.", meaning: "Hari ini aku baik-baik saja.", hsk: 1, words: ["hsk1-112", "hsk1-047", "hsk1-039", "hsk1-035"] },
  { id: "hsk1-s14", hanzi: "我很喜欢小狗。", pinyin: "Wǒ hěn xǐhuan xiǎo gǒu.", meaning: "Aku sangat suka anjing kecil.", hsk: 1, words: ["hsk1-112", "hsk1-039", "hsk1-115", "hsk1-122", "hsk1-033"] },
  { id: "hsk1-s15", hanzi: "我想喝水。", pinyin: "Wǒ xiǎng hē shuǐ.", meaning: "Aku ingin minum air.", hsk: 1, words: ["hsk1-112", "hsk1-121", "hsk1-037", "hsk1-098"] },
  { id: "hsk1-s16", hanzi: "商店在哪儿？", pinyin: "Shāngdiàn zài nǎr?", meaning: "Di mana tokonya?", hsk: 1, words: ["hsk1-088", "hsk1-138", "hsk1-068"] },
  { id: "hsk1-s17", hanzi: "这本书是我的。", pinyin: "Zhè běn shū shì wǒ de.", meaning: "Buku ini milikku.", hsk: 1, words: ["hsk1-142", "hsk1-006", "hsk1-096", "hsk1-095", "hsk1-015"] },
  { id: "hsk1-s18", hanzi: "我有三个苹果。", pinyin: "Wǒ yǒu sān ge píngguǒ.", meaning: "Aku punya tiga apel.", hsk: 1, words: ["hsk1-112", "hsk1-136", "hsk1-087", "hsk1-031", "hsk1-077"] },
  { id: "hsk1-s19", hanzi: "他在看电视。", pinyin: "Tā zài kàn diànshì.", meaning: "Dia sedang menonton televisi.", hsk: 1, words: ["hsk1-104", "hsk1-138", "hsk1-050", "hsk1-018"] },
  { id: "hsk1-s20", hanzi: "明天是星期一。", pinyin: "Míngtiān shì xīngqīyī.", meaning: "Besok hari Senin.", hsk: 1, words: ["hsk1-067", "hsk1-095", "hsk1-127", "hsk1-131"] },
  { id: "hsk1-s21", hanzi: "这是我的猫。", pinyin: "Zhè shì wǒ de māo.", meaning: "Ini kucingku.", hsk: 1, words: ["hsk1-142", "hsk1-095", "hsk1-015", "hsk1-062"] },
  { id: "hsk1-s22", hanzi: "你在学校吗？", pinyin: "Nǐ zài xuéxiào ma?", meaning: "Apakah kamu di sekolah?", hsk: 1, words: ["hsk1-072", "hsk1-138", "hsk1-130", "hsk1-060"] },
  { id: "hsk1-s23", hanzi: "妈妈买东西。", pinyin: "Māmā mǎi dōngxi.", meaning: "Ibu membeli barang.", hsk: 1, words: ["hsk1-059", "hsk1-061", "hsk1-020"] },
  { id: "hsk1-s24", hanzi: "爸爸坐出租车去北京。", pinyin: "Bàba zuò chūzūchē qù Běijīng.", meaning: "Ayah naik taksi ke Beijing.", hsk: 1, words: ["hsk1-003", "hsk1-150", "hsk1-012", "hsk1-082", "hsk1-005"] },
  { id: "hsk1-s25", hanzi: "桌子很大。", pinyin: "Zhuōzi hěn dà.", meaning: "Mejanya sangat besar.", hsk: 1, words: ["hsk1-146", "hsk1-039", "hsk1-014"] },
];

export function getSentencesByLevel(level: HskLevel): ExampleSentence[] {
  return sentences.filter((s) => s.hsk === level);
}
