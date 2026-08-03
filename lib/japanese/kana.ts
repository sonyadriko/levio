/**
 * Data kana Jepang (hiragana & katakana) untuk latihan pengenalan & menulis.
 * Bukan VocabItem — kana adalah sistem huruf, bukan kosakata, jadi progresnya
 * terpisah dari SRS vocab (localStorage `levio.kana.v1`, tanpa XP/badge).
 */

export type KanaAlphabet = "hiragana" | "katakana";
export type KanaGroup = "base" | "dakuten" | "handakuten" | "combination";

export interface KanaItem {
  kana: string;
  romaji: string;
  alphabet: KanaAlphabet;
  group: KanaGroup;
}

const kana = (kana: string, romaji: string, alphabet: KanaAlphabet, group: KanaGroup): KanaItem => ({
  kana,
  romaji,
  alphabet,
  group,
});

const H: KanaAlphabet = "hiragana";
const K: KanaAlphabet = "katakana";

const hiragana = [
  // base (46)
  kana("あ", "a", H, "base"), kana("い", "i", H, "base"), kana("う", "u", H, "base"), kana("え", "e", H, "base"), kana("お", "o", H, "base"),
  kana("か", "ka", H, "base"), kana("き", "ki", H, "base"), kana("く", "ku", H, "base"), kana("け", "ke", H, "base"), kana("こ", "ko", H, "base"),
  kana("さ", "sa", H, "base"), kana("し", "shi", H, "base"), kana("す", "su", H, "base"), kana("せ", "se", H, "base"), kana("そ", "so", H, "base"),
  kana("た", "ta", H, "base"), kana("ち", "chi", H, "base"), kana("つ", "tsu", H, "base"), kana("て", "te", H, "base"), kana("と", "to", H, "base"),
  kana("な", "na", H, "base"), kana("に", "ni", H, "base"), kana("ぬ", "nu", H, "base"), kana("ね", "ne", H, "base"), kana("の", "no", H, "base"),
  kana("は", "ha", H, "base"), kana("ひ", "hi", H, "base"), kana("ふ", "fu", H, "base"), kana("へ", "he", H, "base"), kana("ほ", "ho", H, "base"),
  kana("ま", "ma", H, "base"), kana("み", "mi", H, "base"), kana("む", "mu", H, "base"), kana("め", "me", H, "base"), kana("も", "mo", H, "base"),
  kana("や", "ya", H, "base"), kana("ゆ", "yu", H, "base"), kana("よ", "yo", H, "base"),
  kana("ら", "ra", H, "base"), kana("り", "ri", H, "base"), kana("る", "ru", H, "base"), kana("れ", "re", H, "base"), kana("ろ", "ro", H, "base"),
  kana("わ", "wa", H, "base"), kana("を", "o", H, "base"), kana("ん", "n", H, "base"),
  // dakuten (25)
  kana("が", "ga", H, "dakuten"), kana("ぎ", "gi", H, "dakuten"), kana("ぐ", "gu", H, "dakuten"), kana("げ", "ge", H, "dakuten"), kana("ご", "go", H, "dakuten"),
  kana("ざ", "za", H, "dakuten"), kana("じ", "ji", H, "dakuten"), kana("ず", "zu", H, "dakuten"), kana("ぜ", "ze", H, "dakuten"), kana("ぞ", "zo", H, "dakuten"),
  kana("だ", "da", H, "dakuten"), kana("ぢ", "ji", H, "dakuten"), kana("づ", "zu", H, "dakuten"), kana("で", "de", H, "dakuten"), kana("ど", "do", H, "dakuten"),
  kana("ば", "ba", H, "dakuten"), kana("び", "bi", H, "dakuten"), kana("ぶ", "bu", H, "dakuten"), kana("べ", "be", H, "dakuten"), kana("ぼ", "bo", H, "dakuten"),
  // handakuten (5)
  kana("ぱ", "pa", H, "handakuten"), kana("ぴ", "pi", H, "handakuten"), kana("ぷ", "pu", H, "handakuten"), kana("ぺ", "pe", H, "handakuten"), kana("ぽ", "po", H, "handakuten"),
  // combination (33)
  kana("きゃ", "kya", H, "combination"), kana("きゅ", "kyu", H, "combination"), kana("きょ", "kyo", H, "combination"),
  kana("しゃ", "sha", H, "combination"), kana("しゅ", "shu", H, "combination"), kana("しょ", "sho", H, "combination"),
  kana("ちゃ", "cha", H, "combination"), kana("ちゅ", "chu", H, "combination"), kana("ちょ", "cho", H, "combination"),
  kana("にゃ", "nya", H, "combination"), kana("にゅ", "nyu", H, "combination"), kana("にょ", "nyo", H, "combination"),
  kana("ひゃ", "hya", H, "combination"), kana("ひゅ", "hyu", H, "combination"), kana("ひょ", "hyo", H, "combination"),
  kana("みゃ", "mya", H, "combination"), kana("みゅ", "myu", H, "combination"), kana("みょ", "myo", H, "combination"),
  kana("りゃ", "rya", H, "combination"), kana("りゅ", "ryu", H, "combination"), kana("りょ", "ryo", H, "combination"),
  kana("ぎゃ", "gya", H, "combination"), kana("ぎゅ", "gyu", H, "combination"), kana("ぎょ", "gyo", H, "combination"),
  kana("じゃ", "ja", H, "combination"), kana("じゅ", "ju", H, "combination"), kana("じょ", "jo", H, "combination"),
  kana("びゃ", "bya", H, "combination"), kana("びゅ", "byu", H, "combination"), kana("びょ", "byo", H, "combination"),
  kana("ぴゃ", "pya", H, "combination"), kana("ぴゅ", "pyu", H, "combination"), kana("ぴょ", "pyo", H, "combination"),
];

const katakana = [
  kana("ア", "a", K, "base"), kana("イ", "i", K, "base"), kana("ウ", "u", K, "base"), kana("エ", "e", K, "base"), kana("オ", "o", K, "base"),
  kana("カ", "ka", K, "base"), kana("キ", "ki", K, "base"), kana("ク", "ku", K, "base"), kana("ケ", "ke", K, "base"), kana("コ", "ko", K, "base"),
  kana("サ", "sa", K, "base"), kana("シ", "shi", K, "base"), kana("ス", "su", K, "base"), kana("セ", "se", K, "base"), kana("ソ", "so", K, "base"),
  kana("タ", "ta", K, "base"), kana("チ", "chi", K, "base"), kana("ツ", "tsu", K, "base"), kana("テ", "te", K, "base"), kana("ト", "to", K, "base"),
  kana("ナ", "na", K, "base"), kana("ニ", "ni", K, "base"), kana("ヌ", "nu", K, "base"), kana("ネ", "ne", K, "base"), kana("ノ", "no", K, "base"),
  kana("ハ", "ha", K, "base"), kana("ヒ", "hi", K, "base"), kana("フ", "fu", K, "base"), kana("ヘ", "he", K, "base"), kana("ホ", "ho", K, "base"),
  kana("マ", "ma", K, "base"), kana("ミ", "mi", K, "base"), kana("ム", "mu", K, "base"), kana("メ", "me", K, "base"), kana("モ", "mo", K, "base"),
  kana("ヤ", "ya", K, "base"), kana("ユ", "yu", K, "base"), kana("ヨ", "yo", K, "base"),
  kana("ラ", "ra", K, "base"), kana("リ", "ri", K, "base"), kana("ル", "ru", K, "base"), kana("レ", "re", K, "base"), kana("ロ", "ro", K, "base"),
  kana("ワ", "wa", K, "base"), kana("ヲ", "o", K, "base"), kana("ン", "n", K, "base"),
  kana("ガ", "ga", K, "dakuten"), kana("ギ", "gi", K, "dakuten"), kana("グ", "gu", K, "dakuten"), kana("ゲ", "ge", K, "dakuten"), kana("ゴ", "go", K, "dakuten"),
  kana("ザ", "za", K, "dakuten"), kana("ジ", "ji", K, "dakuten"), kana("ズ", "zu", K, "dakuten"), kana("ゼ", "ze", K, "dakuten"), kana("ゾ", "zo", K, "dakuten"),
  kana("ダ", "da", K, "dakuten"), kana("ヂ", "ji", K, "dakuten"), kana("ヅ", "zu", K, "dakuten"), kana("デ", "de", K, "dakuten"), kana("ド", "do", K, "dakuten"),
  kana("バ", "ba", K, "dakuten"), kana("ビ", "bi", K, "dakuten"), kana("ブ", "bu", K, "dakuten"), kana("ベ", "be", K, "dakuten"), kana("ボ", "bo", K, "dakuten"),
  kana("パ", "pa", K, "handakuten"), kana("ピ", "pi", K, "handakuten"), kana("プ", "pu", K, "handakuten"), kana("ペ", "pe", K, "handakuten"), kana("ポ", "po", K, "handakuten"),
  kana("キャ", "kya", K, "combination"), kana("キュ", "kyu", K, "combination"), kana("キョ", "kyo", K, "combination"),
  kana("シャ", "sha", K, "combination"), kana("シュ", "shu", K, "combination"), kana("ショ", "sho", K, "combination"),
  kana("チャ", "cha", K, "combination"), kana("チュ", "chu", K, "combination"), kana("チョ", "cho", K, "combination"),
  kana("ニャ", "nya", K, "combination"), kana("ニュ", "nyu", K, "combination"), kana("ニョ", "nyo", K, "combination"),
  kana("ヒャ", "hya", K, "combination"), kana("ヒュ", "hyu", K, "combination"), kana("ヒョ", "hyo", K, "combination"),
  kana("ミャ", "mya", K, "combination"), kana("ミュ", "myu", K, "combination"), kana("ミョ", "myo", K, "combination"),
  kana("リャ", "rya", K, "combination"), kana("リュ", "ryu", K, "combination"), kana("リョ", "ryo", K, "combination"),
  kana("ギャ", "gya", K, "combination"), kana("ギュ", "gyu", K, "combination"), kana("ギョ", "gyo", K, "combination"),
  kana("ジャ", "ja", K, "combination"), kana("ジュ", "ju", K, "combination"), kana("ジョ", "jo", K, "combination"),
  kana("ビャ", "bya", K, "combination"), kana("ビュ", "byu", K, "combination"), kana("ビョ", "byo", K, "combination"),
  kana("ピャ", "pya", K, "combination"), kana("ピュ", "pyu", K, "combination"), kana("ピョ", "pyo", K, "combination"),
];

export const KANA_GROUPS: KanaGroup[] = ["base", "dakuten", "handakuten", "combination"];

export const HIRAGANA: KanaItem[] = hiragana;
export const KATAKANA: KanaItem[] = katakana;

export const KANA_ITEMS: KanaItem[] = [...hiragana, ...katakana];

export function kanaByAlphabet(alphabet: KanaAlphabet): KanaItem[] {
  return alphabet === "hiragana" ? HIRAGANA : KATAKANA;
}
