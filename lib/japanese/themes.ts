/**
 * Paket tematik Jepang — kosakata dikelompokkan per SITUASI nyata
 * (perjalanan, kantor, makanan, sehari-hari), bukan per kelas kata.
 *
 * Dasar riset: kluster TEMATIK (skenario, campur jenis kata) memfasilitasi
 * retensi kosakata, sedangkan kluster SEMANTIK (daftar kata serupa, mis. hanya
 * kata benda kantor) justru menimbulkan interferensi (Tinkham 1997; Waring
 * 1997). Karena itu setiap paket menyusun kata kerja + kata benda + kata
 * sifat dalam satu narasi kejadian.
 *
 * Kata yang sudah ada di kurikulum JLPT dipakai ulang dengan ID yang SAMA
 * (`ja-nX-YYY`) agar progres SRS (keyed by `word.id`) menyatu dengan flashcard
 * level biasa. Kata baru diberi ID `ja-theme-<tema>-NNN` sebagai perluasan
 * pool kosakata.
 */

import type { VocabItem } from "../languages/types";

export type JapaneseThemeId = "travel" | "office" | "food" | "daily";

export interface JapaneseTheme {
  id: JapaneseThemeId;
  titleKey: string;
  descKey: string;
  icon: string;
  words: VocabItem[];
}

function w(
  id: string,
  term: string,
  reading: string,
  meaning: string,
  level: number,
  example: string,
  exampleReading: string,
  exampleMeaning: string,
  themes: JapaneseThemeId[],
): VocabItem {
  return {
    id,
    term,
    reading,
    meaning,
    level,
    example,
    exampleReading,
    exampleMeaning,
    themes,
  };
}

const travel: VocabItem[] = [
  w("ja-n5-051", "行く", "いく", "pergi", 1, "京都へ行きます。", "きょうとへいきます。", "Saya pergi ke Kyoto.", ["travel"]),
  w("ja-n5-042", "駅", "えき", "stasiun", 1, "駅で電車を待ちます。", "えきででんしゃをまちます。", "Saya menunggu kereta di stasiun.", ["travel"]),
  w("ja-n5-014", "電車", "でんしゃ", "kereta", 1, "電車で学校へ行きます。", "でんしゃでがっこうへいきます。", "Saya pergi ke sekolah naik kereta.", ["travel"]),
  w("ja-n5-040", "道", "みち", "jalan", 1, "この道をまっすぐ行きます。", "このみちをまっすぐいきます。", "Jalan lurus lewat jalan ini.", ["travel"]),
  w("ja-n5-039", "町", "まち", "kota", 1, "この町は静かです。", "このまちはしずかです。", "Kota ini sepi.", ["travel"]),
  w("ja-n5-037", "山", "やま", "gunung", 1, "山が高いです。", "やまがたかいです。", "Gunungnya tinggi.", ["travel"]),
  w("ja-n5-038", "海", "うみ", "laut", 1, "海で泳ぎます。", "うみでおよぎます。", "Saya berenang di laut.", ["travel"]),
  w("ja-n5-034", "天気", "てんき", "cuaca", 1, "今日は天気がいいです。", "きょうはてんきがいいです。", "Hari ini cuacanya bagus.", ["travel"]),
  w("ja-n5-045", "お金", "おかね", "uang", 1, "お金がありません。", "おかねがありません。", "Saya tidak punya uang.", ["travel"]),
  w("ja-n5-060", "買う", "かう", "membeli", 1, "パンを買います。", "パンをかいます。", "Saya membeli roti.", ["travel", "food"]),
  w("ja-n5-055", "見る", "みる", "melihat", 1, "映画を見ます。", "えいがをみます。", "Saya menonton film.", ["travel", "daily"]),
  w("ja-n5-095", "楽しい", "たのしい", "menyenangkan", 1, "旅行は楽しいです。", "りょこうはたのしいです。", "Perjalanan itu menyenangkan.", ["travel"]),
  w("ja-n4-029", "切符", "きっぷ", "tiket", 2, "切符を買ってください。", "きっぷをかってください。", "Tolong beli tiket.", ["travel"]),
  w("ja-n4-030", "荷物", "にもつ", "barang bawaan", 2, "荷物が重いです。", "にもつがおもいです。", "Barang bawaannya berat.", ["travel"]),
  w("ja-n4-026", "出口", "でぐち", "pintu keluar", 2, "出口はあちらです。", "でぐちはあちらです。", "Pintu keluar ada di sana.", ["travel"]),
  w("ja-n4-027", "入り口", "いりぐち", "pintu masuk", 2, "入り口で待っています。", "いりぐちでまっています。", "Saya menunggu di pintu masuk.", ["travel"]),
  w("ja-n4-066", "降りる", "おりる", "turun", 2, "次の駅で降ります。", "つぎのえきでおります。", "Saya turun di stasiun berikutnya.", ["travel"]),
  w("ja-n4-073", "決める", "きめる", "memutuskan", 2, "旅行の日を決めました。", "りょこうのひをきめました。", "Saya menentukan tanggal perjalanan.", ["travel"]),
  w("ja-n4-083", "運転する", "うんてんする", "mengemudi", 2, "父はタクシーを運転しています。", "ちちはタクシーをうんてんしています。", "Ayah mengemudikan taksi.", ["travel"]),
  w("ja-n4-010", "写真", "しゃしん", "foto", 2, "家族の写真を見せてください。", "かぞくのしゃしんをみせてください。", "Tolong tunjukkan foto keluarga.", ["travel", "daily"]),
  w("ja-n3-071", "準備", "じゅんび", "persiapan", 3, "旅行の準備をしました。", "りょこうのじゅんびをしました。", "Saya bersiap untuk perjalanan.", ["travel"]),
  w("ja-n2-087", "予定", "よてい", "rencana; jadwal", 4, "予定を変更しました。", "よていをへんこうしました。", "Saya mengubah jadwal.", ["travel", "office"]),
  w("ja-theme-travel-001", "旅行", "りょこう", "perjalanan", 3, "来月、日本へ旅行します。", "らいげつ、にほんへりょこうします。", "Bulan depan saya pergi ke Jepang.", ["travel"]),
  w("ja-theme-travel-002", "飛行機", "ひこうき", "pesawat", 2, "飛行機で東京へ行きます。", "ひこうきでとうきょうへいきます。", "Saya pergi ke Tokyo naik pesawat.", ["travel"]),
  w("ja-theme-travel-003", "空港", "くうこう", "bandara", 3, "空港まで車で送ります。", "くうこうまでくるまでおくります。", "Saya mengantar sampai bandara dengan mobil.", ["travel"]),
  w("ja-theme-travel-004", "ホテル", "ホテル", "hotel", 2, "ホテルを予約しました。", "ホテルをよやくしました。", "Saya sudah memesan hotel.", ["travel"]),
  w("ja-theme-travel-005", "泊まる", "とまる", "menginap", 3, "京都のホテルに泊まります。", "きょうとのホテルにとまります。", "Saya menginap di hotel di Kyoto.", ["travel"]),
  w("ja-theme-travel-006", "予約", "よやく", "reservasi", 3, "切符を予約してください。", "きっぷをよやくしてください。", "Tolong pesan tiketnya.", ["travel"]),
  w("ja-theme-travel-007", "地図", "ちず", "peta", 2, "地図で道を調べます。", "ちずでみちをしらべます。", "Saya mencari jalan lewat peta.", ["travel"]),
  w("ja-theme-travel-008", "乗る", "のる", "naik (kendaraan)", 2, "この電車に乗ります。", "このでんしゃにのります。", "Saya naik kereta ini.", ["travel"]),
  w("ja-theme-travel-009", "案内", "あんない", "petunjuk; memandu", 3, "駅員が案内してくれました。", "えきいんがあんないしてくれました。", "Petugas stasiun menunjukkan jalannya.", ["travel"]),
  w("ja-theme-travel-010", "パスポート", "パスポート", "paspor", 3, "パスポートを忘れました。", "パスポートをわすれました。", "Saya lupa membawa paspor.", ["travel"]),
];

const office: VocabItem[] = [
  w("ja-n5-010", "会社", "かいしゃ", "perusahaan", 1, "会社は九時に始まります。", "かいしゃはくじにはじまります。", "Perusahaan mulai pukul sembilan.", ["office"]),
  w("ja-n5-046", "仕事", "しごと", "pekerjaan", 1, "仕事が終わりました。", "しごとがおわりました。", "Pekerjaan sudah selesai.", ["office"]),
  w("ja-n5-066", "働く", "はたらく", "bekerja", 1, "父は銀行で働いています。", "ちちはぎんこうではたらいています。", "Ayah bekerja di bank.", ["office"]),
  w("ja-n5-044", "電話", "でんわ", "telepon", 1, "母に電話をかけます。", "ははにでんわをかけます。", "Saya menelepon ibu.", ["office", "daily"]),
  w("ja-n5-059", "書く", "かく", "menulis", 1, "名前を書いてください。", "なまえをかいてください。", "Tolong tulis nama Anda.", ["office", "daily"]),
  w("ja-n5-063", "使う", "つかう", "memakai; menggunakan", 1, "この辞書を使います。", "このじしょをつかいます。", "Saya memakai kamus ini.", ["office"]),
  w("ja-n5-025", "時間", "じかん", "waktu", 1, "時間がありません。", "じかんがありません。", "Saya tidak punya waktu.", ["office", "daily"]),
  w("ja-n5-047", "休み", "やすみ", "libur; istirahat", 1, "今日は休みです。", "きょうはやすみです。", "Hari ini libur.", ["office", "daily"]),
  w("ja-n5-030", "毎日", "まいにち", "setiap hari", 1, "毎日日本語を勉強します。", "まいにちにほんごをべんきょうします。", "Saya belajar bahasa Jepang setiap hari.", ["office", "daily"]),
  w("ja-n5-057", "話す", "はなす", "berbicara", 1, "日本語で話します。", "にほんごではなします。", "Saya berbicara dalam bahasa Jepang.", ["office", "daily"]),
  w("ja-n5-077", "分かる", "わかる", "mengerti", 1, "日本語が分かりますか。", "にほんごがわかりますか。", "Apakah kamu mengerti bahasa Jepang?", ["office"]),
  w("ja-n5-076", "思う", "おもう", "berpikir", 1, "それはいいと思います。", "それはいいとおもいます。", "Menurut saya itu bagus.", ["office"]),
  w("ja-n5-084", "新しい", "あたらしい", "baru", 1, "新しい車を買いました。", "あたらしいくるまをかいました。", "Saya membeli mobil baru.", ["office", "daily"]),
  w("ja-n5-062", "作る", "つくる", "membuat", 1, "母は弁当を作ります。", "はははべんとうをつくります。", "Ibu membuat bekal.", ["office", "food"]),
  w("ja-n5-098", "忙しい", "いそがしい", "sibuk", 1, "今週は忙しいです。", "こんしゅうはいそがしいです。", "Minggu ini sibuk.", ["office"]),
  w("ja-n4-016", "銀行", "ぎんこう", "bank", 2, "銀行でお金をおろします。", "ぎんこうでおかねをおろします。", "Saya menarik uang di bank.", ["office"]),
  w("ja-n3-099", "報告", "ほうこく", "laporan", 3, "結果を報告しました。", "けっかをほうこくしました。", "Saya melaporkan hasilnya.", ["office"]),
  w("ja-theme-office-001", "会議", "かいぎ", "rapat", 3, "会議は十時からです。", "かいぎはじゅうじからです。", "Rapat dimulai pukul sepuluh.", ["office"]),
  w("ja-theme-office-002", "出張", "しゅっちょう", "perjalanan dinas", 3, "来週、大阪へ出張します。", "らいしゅう、おおさかへしゅっちょうします。", "Minggu depan saya dinas ke Osaka.", ["office"]),
  w("ja-theme-office-003", "連絡", "れんらく", "menghubungi", 3, "後で連絡します。", "あとでれんらくします。", "Saya hubungi nanti.", ["office"]),
  w("ja-theme-office-004", "資料", "しりょう", "dokumen; materi", 3, "資料を準備してください。", "しりょうをじゅんびしてください。", "Tolong siapkan dokumennya.", ["office"]),
  w("ja-theme-office-005", "同僚", "どうりょう", "rekan kerja", 3, "同僚と昼ご飯を食べます。", "どうりょうとひるごはんをたべます。", "Saya makan siang dengan rekan kerja.", ["office"]),
  w("ja-theme-office-006", "上司", "じょうし", "atasan", 3, "上司に報告しました。", "じょうしにほうこくしました。", "Saya melapor kepada atasan.", ["office"]),
  w("ja-theme-office-007", "締め切り", "しめきり", "tenggat waktu", 3, "締め切りは金曜日です。", "しめきりはきんようびです。", "Tenggat waktunya hari Jumat.", ["office"]),
  w("ja-theme-office-008", "企画", "きかく", "proposal; rencana", 3, "新しい企画を考えます。", "あたらしいきかくをかんがえます。", "Saya memikirkan rencana baru.", ["office"]),
  w("ja-theme-office-009", "始まる", "はじまる", "dimulai", 2, "会議が始まります。", "かいぎがはじまります。", "Rapat akan dimulai.", ["office", "daily"]),
  w("ja-theme-office-010", "終わる", "おわる", "selesai", 2, "仕事が終わりました。", "しごとがおわりました。", "Pekerjaan sudah selesai.", ["office", "daily"]),
];

const food: VocabItem[] = [
  w("ja-n5-016", "水", "みず", "air", 1, "水を飲みます。", "みずをのみます。", "Saya minum air.", ["food", "daily"]),
  w("ja-n5-017", "お茶", "おちゃ", "teh", 1, "お茶は熱いです。", "おちゃはあついです。", "Tehnya panas.", ["food"]),
  w("ja-n5-018", "ご飯", "ごはん", "nasi; makanan", 1, "ご飯を食べます。", "ごはんをたべます。", "Saya makan nasi.", ["food"]),
  w("ja-n5-019", "食べ物", "たべもの", "makanan", 1, "食べ物は美味しいです。", "たべものはおいしいです。", "Makanannya lezat.", ["food"]),
  w("ja-n5-020", "飲み物", "のみもの", "minuman", 1, "何か飲み物をください。", "なにかのみものをください。", "Tolong beri saya sesuatu untuk diminum.", ["food"]),
  w("ja-n5-021", "肉", "にく", "daging", 1, "肉と野菜を食べます。", "にくとやさいをたべます。", "Saya makan daging dan sayur.", ["food"]),
  w("ja-n5-022", "魚", "さかな", "ikan", 1, "魚が好きです。", "さかながすきです。", "Saya suka ikan.", ["food"]),
  w("ja-n5-023", "野菜", "やさい", "sayur", 1, "野菜は体にいいです。", "やさいはからだにいいです。", "Sayur baik untuk tubuh.", ["food"]),
  w("ja-n5-024", "果物", "くだもの", "buah", 1, "果物を買いました。", "くだものをかいました。", "Saya membeli buah.", ["food"]),
  w("ja-n5-041", "店", "みせ", "toko", 1, "この店は安いです。", "このみせはやすいです。", "Toko ini murah.", ["food", "daily"]),
  w("ja-n5-053", "食べる", "たべる", "makan", 1, "朝ご飯を食べます。", "あさごはんをたべます。", "Saya makan sarapan.", ["food", "daily"]),
  w("ja-n5-054", "飲む", "のむ", "minum", 1, "コーヒーを飲みます。", "コーヒーをのみます。", "Saya minum kopi.", ["food", "daily"]),
  w("ja-n5-094", "美味しい", "おいしい", "lezat", 1, "このラーメンは美味しいです。", "このラーメンはおいしいです。", "Ramen ini lezat.", ["food"]),
  w("ja-n5-087", "安い", "やすい", "murah", 1, "この店の物は安いです。", "このみせのものはやすいです。", "Barang di toko ini murah.", ["food", "daily"]),
  w("ja-n5-086", "高い", "たかい", "tinggi; mahal", 1, "この料理は高いです。", "このりょうりはたかいです。", "Masakan ini mahal.", ["food"]),
  w("ja-n5-082", "大きい", "おおきい", "besar", 1, "この部屋は大きいです。", "このへやはおおきいです。", "Ruang ini besar.", ["food", "daily"]),
  w("ja-n5-083", "小さい", "ちいさい", "kecil", 1, "猫が小さいです。", "ねこがちいさいです。", "Kucingnya kecil.", ["food", "daily"]),
  w("ja-theme-food-001", "朝ご飯", "あさごはん", "sarapan", 1, "毎朝パンを食べます。", "まいあさパンをたべます。", "Saya makan roti setiap pagi.", ["food", "daily"]),
  w("ja-theme-food-002", "昼ご飯", "ひるごはん", "makan siang", 1, "昼ご飯を食べました。", "ひるごはんをたべました。", "Saya sudah makan siang.", ["food"]),
  w("ja-theme-food-003", "晩ご飯", "ばんごはん", "makan malam", 1, "晩ご飯を作ります。", "ばんごはんをつくります。", "Saya memasak makan malam.", ["food"]),
  w("ja-theme-food-004", "料理", "りょうり", "masakan", 2, "母は料理が上手です。", "はははりょうりがじょうずです。", "Ibu pandai memasak.", ["food"]),
  w("ja-theme-food-005", "甘い", "あまい", "manis", 2, "このケーキは甘いです。", "このケーキはあまいです。", "Kue ini manis.", ["food"]),
  w("ja-theme-food-006", "辛い", "からい", "pedas", 2, "このカレーは辛いです。", "このカレーはからいです。", "Kari ini pedas.", ["food"]),
  w("ja-theme-food-007", "塩", "しお", "garam", 2, "塩を少し入れてください。", "しおをすこしいれてください。", "Tolong tambahkan sedikit garam.", ["food"]),
  w("ja-theme-food-008", "砂糖", "さとう", "gula", 2, "砂糖は要りません。", "さとうはいりません。", "Saya tidak perlu gula.", ["food"]),
  w("ja-theme-food-009", "箸", "はし", "sumpit", 2, "箸で食べます。", "はしでたべます。", "Saya makan pakai sumpit.", ["food"]),
  w("ja-theme-food-010", "コーヒー", "コーヒー", "kopi", 1, "コーヒーをもう一杯ください。", "コーヒーをもういっぱいください。", "Tolong satu kopi lagi.", ["food", "daily"]),
  w("ja-theme-food-011", "注文する", "ちゅうもんする", "memesan", 3, "料理を注文します。", "りょうりをちゅうもんします。", "Saya memesan makanan.", ["food"]),
];

const daily: VocabItem[] = [
  w("ja-n5-026", "今", "いま", "sekarang", 1, "今、何時ですか。", "いま、なんじですか。", "Sekarang jam berapa?", ["daily"]),
  w("ja-n5-027", "今日", "きょう", "hari ini", 1, "今日は日曜日です。", "きょうはにちようびです。", "Hari ini hari Minggu.", ["daily"]),
  w("ja-n5-028", "明日", "あした", "besok", 1, "明日は休みます。", "あしたはやすみます。", "Besok saya beristirahat.", ["daily"]),
  w("ja-n5-029", "昨日", "きのう", "kemarin", 1, "昨日、雨が降りました。", "きのう、あめがふりました。", "Kemarin turun hujan.", ["daily"]),
  w("ja-n5-031", "週", "しゅう", "minggu", 1, "週に二回日本語の授業があります。", "しゅうににかいにほんごのじゅぎょうがあります。", "Ada pelajaran bahasa Jepang dua kali seminggu.", ["daily"]),
  w("ja-n5-032", "月", "つき", "bulan", 1, "今月は忙しいです。", "こんげつはいそがしいです。", "Bulan ini sibuk.", ["daily"]),
  w("ja-n5-033", "年", "とし", "tahun", 1, "今年は二十歳です。", "ことしははたちです。", "Tahun ini saya berumur dua puluh tahun.", ["daily"]),
  w("ja-n5-012", "家", "いえ", "rumah", 1, "私の家は大きいです。", "わたしのいえはおおきいです。", "Rumah saya besar.", ["daily"]),
  w("ja-n5-011", "学校", "がっこう", "sekolah", 1, "学校は駅の近くです。", "がっこうはえきのちかくです。", "Sekolahnya dekat stasiun.", ["daily"]),
  w("ja-n5-004", "友達", "ともだち", "teman", 1, "彼は私の友達です。", "かれはわたしのともだちです。", "Dia teman saya.", ["daily"]),
  w("ja-n5-005", "家族", "かぞく", "keluarga", 1, "家族は五人です。", "かぞくはごにんです。", "Keluarga kami lima orang.", ["daily"]),
  w("ja-n5-067", "休む", "やすむ", "beristirahat", 1, "少し休みましょう。", "すこしやすみましょう。", "Mari beristirahat sebentar.", ["daily"]),
  w("ja-n5-068", "寝る", "ねる", "tidur", 1, "十時に寝ます。", "じゅうじにねます。", "Saya tidur pukul sepuluh.", ["daily"]),
  w("ja-n5-069", "起きる", "おきる", "bangun", 1, "毎朝六時に起きます。", "まいあさろくじにおきます。", "Saya bangun pukul enam setiap pagi.", ["daily"]),
  w("ja-n5-072", "歩く", "あるく", "berjalan", 1, "駅まで歩きます。", "えきまであるきます。", "Saya berjalan sampai stasiun.", ["daily"]),
  w("ja-n5-064", "遊ぶ", "あそぶ", "bermain", 1, "公園で遊びます。", "こうえんであそびます。", "Saya bermain di taman.", ["daily"]),
  w("ja-n5-065", "泳ぐ", "およぐ", "berenang", 1, "プールで泳ぎます。", "プールでおよぎます。", "Saya berenang di kolam.", ["daily"]),
  w("ja-n5-058", "読む", "よむ", "membaca", 1, "新聞を読みます。", "しんぶんをよみます。", "Saya membaca koran.", ["daily"]),
  w("ja-n5-050", "日本語", "にほんご", "bahasa Jepang", 1, "日本語が分かります。", "にほんごがわかります。", "Saya mengerti bahasa Jepang.", ["daily"]),
  w("ja-n5-099", "元気", "げんき", "sehat; semangat", 1, "お元気ですか。", "おげんきですか。", "Apa kabar?", ["daily"]),
  w("ja-n5-100", "好き", "すき", "suka", 1, "私は日本語が好きです。", "わたしはにほんごがすきです。", "Saya suka bahasa Jepang.", ["daily"]),
  w("ja-n5-009", "学生", "がくせい", "pelajar; mahasiswa", 1, "私は大学生です。", "わたしはだいがくせいです。", "Saya mahasiswa.", ["daily"]),
  w("ja-n5-043", "病院", "びょういん", "rumah sakit", 1, "病院は銀行の隣です。", "びょういんはぎんこうのとなりです。", "Rumah sakit ada di sebelah bank.", ["daily"]),
  w("ja-n5-035", "雨", "あめ", "hujan", 1, "雨が降っています。", "あめがふっています。", "Sedang turun hujan.", ["daily"]),
  w("ja-theme-daily-001", "朝", "あさ", "pagi", 1, "朝早く起きます。", "あさはやくおきます。", "Saya bangun pagi-pagi.", ["daily"]),
  w("ja-theme-daily-002", "昼", "ひる", "siang", 1, "昼に買い物へ行きます。", "ひるにかいものへいきます。", "Siang ini saya pergi belanja.", ["daily"]),
  w("ja-theme-daily-003", "夜", "よる", "malam", 1, "夜、テレビを見ます。", "よる、テレビをみます。", "Malam hari saya menonton TV.", ["daily"]),
  w("ja-theme-daily-004", "買い物", "かいもの", "belanja", 2, "母と買い物に行きます。", "ははとかいものにいきます。", "Saya pergi belanja dengan ibu.", ["daily"]),
  w("ja-theme-daily-005", "掃除", "そうじ", "membersihkan", 3, "週末に部屋を掃除します。", "しゅうまつにへやをそうじします。", "Saya membersihkan kamar di akhir pekan.", ["daily"]),
  w("ja-theme-daily-006", "洗濯", "せんたく", "mencuci", 3, "洗濯をしてから寝ます。", "せんたくをしてからねます。", "Saya mencuci dulu, baru tidur.", ["daily"]),
  w("ja-theme-daily-007", "散歩", "さんぽ", "jalan-jalan santai", 2, "毎朝公園を散歩します。", "まいあさこうえんをさんぽします。", "Saya berjalan santai di taman setiap pagi.", ["daily"]),
  w("ja-theme-daily-008", "一緒", "いっしょ", "bersama", 2, "一緒に昼ご飯を食べましょう。", "いっしょにひるごはんをたべましょう。", "Mari makan siang bersama.", ["daily"]),
];

export const JAPANESE_THEMES: JapaneseTheme[] = [
  {
    id: "travel",
    titleKey: "theme.travel.title",
    descKey: "theme.travel.desc",
    icon: "star",
    words: travel,
  },
  {
    id: "office",
    titleKey: "theme.office.title",
    descKey: "theme.office.desc",
    icon: "user",
    words: office,
  },
  {
    id: "food",
    titleKey: "theme.food.title",
    descKey: "theme.food.desc",
    icon: "flame",
    words: food,
  },
  {
    id: "daily",
    titleKey: "theme.daily.title",
    descKey: "theme.daily.desc",
    icon: "sun",
    words: daily,
  },
];

export function getJapaneseTheme(
  id: string,
): JapaneseTheme | undefined {
  return JAPANESE_THEMES.find((theme) => theme.id === id);
}

export function allJapaneseThemes(): JapaneseTheme[] {
  return JAPANESE_THEMES;
}
