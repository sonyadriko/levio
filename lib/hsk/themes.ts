/**
 * Paket tematik HSK — kosakata dikelompokkan per SITUASI nyata
 * (perjalanan, kantor, makanan, sehari-hari), bukan per kelas kata.
 *
 * Lihat lib/japanese/themes.ts untuk catatan dasar riset (kluster tematik
 * memfasilitasi retensi; kluster semantik menimbulkan interferensi).
 *
 * Kata yang sudah ada di kurikulum HSK dipakai ulang dengan ID yang SAMA
 * (`hskN-YYY`) agar progres SRS (keyed by `word.id`) menyatu dengan flashcard
 * level biasa. Kata baru diberi ID `hsk-theme-<tema>-NNN`.
 */

import type { VocabItem } from "../languages/types";
import type { ThemeId, ThemePack } from "../themes/types";

function w(
  id: string,
  hanzi: string,
  pinyin: string,
  meaning: string,
  level: number,
  example: string,
  examplePinyin: string,
  exampleMeaning: string,
  themes: ThemeId[],
): VocabItem {
  return {
    id,
    term: hanzi,
    reading: pinyin,
    meaning,
    level,
    example,
    exampleReading: examplePinyin,
    exampleMeaning,
    themes,
  };
}

const travel: VocabItem[] = [
  w("hsk1-082", "去", "qù", "pergi", 1, "我去北京。", "Wǒ qù Běijīng.", "Aku pergi ke Beijing.", ["travel"]),
  w("hsk1-053", "来", "lái", "datang", 1, "你明天来吗？", "Nǐ míngtiān lái ma?", "Kamu datang besok?", ["travel"]),
  w("hsk1-050", "看", "kàn", "melihat; membaca", 1, "我看书。", "Wǒ kàn shū.", "Aku membaca buku.", ["travel", "daily"]),
  w("hsk1-060", "买", "mǎi", "membeli", 1, "我要买东西。", "Wǒ yào mǎi dōngxi.", "Aku mau membeli barang.", ["travel", "food"]),
  w("hsk1-029", "飞机", "fēijī", "pesawat terbang", 1, "飞机很大。", "Fēijī hěn dà.", "Pesawatnya sangat besar.", ["travel"]),
  w("hsk1-149", "坐", "zuò", "duduk", 1, "我坐飞机去。", "Wǒ zuò fēijī qù.", "Aku naik pesawat ke sana.", ["travel"]),
  w("hsk1-109", "天气", "tiānqì", "cuaca", 1, "今天天气很好。", "Jīntiān tiānqì hěn hǎo.", "Hari ini cuacanya bagus.", ["travel", "daily"]),
  w("hsk1-079", "钱", "qián", "uang", 1, "这本书多少钱？", "Zhè běn shū duōshao qián?", "Berapa harga buku ini?", ["travel", "office"]),
  w("hsk1-012", "出租车", "chūzūchē", "taksi", 1, "我坐出租车去。", "Wǒ zuò chūzūchē qù.", "Aku naik taksi ke sana.", ["travel"]),
  w("hsk1-055", "冷", "lěng", "dingin", 1, "今天很冷。", "Jīntiān hěn lěng.", "Hari ini sangat dingin.", ["travel", "food"]),
  w("hsk1-083", "热", "rè", "panas", 1, "水很热。", "Shuǐ hěn rè.", "Airnya sangat panas.", ["travel", "food"]),
  w("hsk1-047", "今天", "jīntiān", "hari ini", 1, "今天天气很好。", "Jīntiān tiānqì hěn hǎo.", "Hari ini cuacanya bagus.", ["travel", "daily"]),
  w("hsk1-066", "明天", "míngtiān", "besok", 1, "明天我去学校。", "Míngtiān wǒ qù xuéxiào.", "Besok aku pergi ke sekolah.", ["travel", "daily"]),
  w("hsk1-150", "昨天", "zuótiān", "kemarin", 1, "昨天很热。", "Zuótiān hěn rè.", "Kemarin sangat panas.", ["travel", "daily"]),
  w("hsk1-137", "月", "yuè", "bulan", 1, "我八月去北京。", "Wǒ bā yuè qù Běijīng.", "Aku pergi ke Beijing pada bulan Agustus.", ["travel", "daily"]),
  w("hsk1-127", "星期", "xīngqī", "minggu", 1, "今天是星期三。", "Jīntiān shì Xīngqīsān.", "Hari ini hari Rabu.", ["travel", "office", "daily"]),
  w("hsk1-073", "年", "nián", "tahun", 1, "我今年九岁。", "Wǒ jīnnián jiǔ suì.", "Tahun ini aku berumur sembilan tahun.", ["travel", "daily"]),
  w("hsk2-143", "早上", "zǎoshang", "pagi hari", 2, "我早上六点起床。", "Wǒ zǎoshang liù diǎn qǐchuáng.", "Aku bangun pukul enam pagi.", ["travel", "daily"]),
  w("hsk2-110", "晚上", "wǎnshang", "malam", 2, "我晚上在家看电视。", "Wǒ wǎnshang zài jiā kàn diànshì.", "Aku menonton TV di rumah pada malam hari.", ["travel", "daily"]),
  w("hsk2-097", "时间", "shíjiān", "waktu", 2, "时间过得真快！", "Shíjiān guò de zhēn kuài!", "Waktu berlalu sangat cepat!", ["travel", "office", "daily"]),
  w("hsk2-086", "票", "piào", "tiket", 2, "请给我两张票。", "Qǐng gěi wǒ liǎng zhāng piào.", "Tolong beri aku dua tiket.", ["travel"]),
  w("hsk2-049", "机场", "jīchǎng", "bandara", 2, "我打车去机场。", "Wǒ dǎ chē qù jīchǎng.", "Aku naik taksi ke bandara.", ["travel"]),
  w("hsk3-052", "地图", "dìtú", "peta", 3, "我有中国地图。", "Wǒ yǒu Zhōngguó dìtú.", "Aku punya peta Tiongkok.", ["travel"]),
  w("hsk3-100", "护照", "hùzhào", "paspor", 3, "出国需要护照。", "Chūguó xūyào hùzhào.", "Keluar negeri perlu paspor.", ["travel"]),
  w("hsk4-055", "出发", "chūfā", "berangkat", 4, "我们早上八点出发。", "Wǒmen zǎoshang bā diǎn chūfā.", "Kami berangkat pukul delapan pagi.", ["travel"]),
  w("hsk4-111", "方向", "fāngxiàng", "arah", 4, "我不知道该往哪个方向走。", "Wǒ bù zhīdào gāi wǎng nǎge fāngxiàng zǒu.", "Aku tidak tahu harus pergi ke arah mana.", ["travel"]),
  w("hsk5-204", "到达", "dàodá", "tiba", 5, "我们到达了目的地。", "Wǒmen dàodá le mùdìdì.", "Kami tiba di tujuan.", ["travel"]),
  w("hsk-theme-travel-001", "酒店", "jiǔdiàn", "hotel", 2, "我住在酒店。", "Wǒ zhù zài jiǔdiàn.", "Aku menginap di hotel.", ["travel"]),
  w("hsk-theme-travel-002", "火车", "huǒchē", "kereta api", 2, "我坐火车去北京。", "Wǒ zuò huǒchē qù Běijīng.", "Aku naik kereta api ke Beijing.", ["travel"]),
  w("hsk-theme-travel-003", "车站", "chēzhàn", "stasiun", 2, "车站在饭店旁边。", "Chēzhàn zài fàndiàn pángbiān.", "Stasiunnya ada di sebelah restoran.", ["travel"]),
  w("hsk-theme-travel-004", "行李", "xíngli", "koper; barang bawaan", 3, "我的行李太重了。", "Wǒ de xíngli tài zhòng le.", "Koporku terlalu berat.", ["travel"]),
  w("hsk-theme-travel-005", "旅行", "lǚxíng", "perjalanan", 2, "我喜欢旅行。", "Wǒ xǐhuan lǚxíng.", "Aku suka bepergian.", ["travel"]),
];

const office: VocabItem[] = [
  w("hsk1-032", "工作", "gōngzuò", "bekerja; pekerjaan", 1, "我明天工作。", "Wǒ míngtiān gōngzuò.", "Besok aku bekerja.", ["office", "daily"]),
  w("hsk1-124", "写", "xiě", "menulis", 1, "我写汉字。", "Wǒ xiě Hànzì.", "Aku menulis aksara Mandarin.", ["office"]),
  w("hsk1-110", "听", "tīng", "mendengar", 1, "我听老师说话。", "Wǒ tīng lǎoshī shuōhuà.", "Aku mendengarkan guru berbicara.", ["office", "daily"]),
  w("hsk1-129", "学习", "xuéxí", "belajar", 1, "我学习汉语。", "Wǒ xuéxí Hànyǔ.", "Aku belajar bahasa Mandarin.", ["office", "daily"]),
  w("hsk1-017", "电脑", "diànnǎo", "komputer", 1, "我用电脑学习。", "Wǒ yòng diànnǎo xuéxí.", "Aku belajar memakai komputer.", ["office", "daily"]),
  w("hsk2-037", "公司", "gōngsī", "perusahaan", 2, "他在一家公司工作。", "Tā zài yì jiā gōngsī gōngzuò.", "Dia bekerja di sebuah perusahaan.", ["office"]),
  w("hsk2-093", "上班", "shàngbān", "masuk kerja", 2, "我八点上班。", "Wǒ bā diǎn shàngbān.", "Aku masuk kerja pukul delapan.", ["office"]),
  w("hsk2-154", "走", "zǒu", "berjalan; pergi", 2, "我每天走路上班。", "Wǒ měi tiān zǒulù shàngbān.", "Aku berjalan kaki ke kantor setiap hari.", ["office", "daily"]),
  w("hsk2-005", "报纸", "bàozhǐ", "koran", 2, "我看今天的报纸。", "Wǒ kàn jīntiān de bàozhǐ.", "Aku membaca koran hari ini.", ["office"]),
  w("hsk2-100", "手机", "shǒujī", "ponsel", 2, "我的手机没电了。", "Wǒ de shǒujī méi diàn le.", "Ponselku kehabisan baterai.", ["office", "daily"]),
  w("hsk2-097", "时间", "shíjiān", "waktu", 2, "时间过得真快！", "Shíjiān guò de zhēn kuài!", "Waktu berlalu sangat cepat!", ["office", "travel", "daily"]),
  w("hsk2-118", "小时", "xiǎoshí", "jam (satuan waktu)", 2, "我要等一个小时。", "Wǒ yào děng yí ge xiǎoshí.", "Aku harus menunggu satu jam.", ["office"]),
  w("hsk1-127", "星期", "xīngqī", "minggu", 1, "今天是星期三。", "Jīntiān shì Xīngqīsān.", "Hari ini hari Rabu.", ["office", "travel", "daily"]),
  w("hsk1-073", "年", "nián", "tahun", 1, "我今年九岁。", "Wǒ jīnnián jiǔ suì.", "Tahun ini aku berumur sembilan tahun.", ["office", "daily"]),
  w("hsk1-079", "钱", "qián", "uang", 1, "这本书多少钱？", "Zhè běn shū duōshao qián?", "Berapa harga buku ini?", ["office", "travel"]),
  w("hsk3-012", "办公室", "bàngōngshì", "kantor", 3, "经理在办公室等你。", "Jīnglǐ zài bàngōngshì děng nǐ.", "Manajer menunggumu di kantor.", ["office"]),
  w("hsk3-098", "会议", "huìyì", "rapat; pertemuan", 3, "下午有一个会议。", "Xiàwǔ yǒu yí ge huìyì.", "Sore ini ada rapat.", ["office"]),
  w("hsk3-212", "同事", "tóngshì", "rekan kerja", 3, "他是我的同事。", "Tā shì wǒ de tóngshì.", "Dia adalah rekan kerjaku.", ["office"]),
  w("hsk3-253", "银行", "yínháng", "bank", 3, "我去银行取钱。", "Wǒ qù yínháng qǔ qián.", "Aku pergi ke bank mengambil uang.", ["office"]),
  w("hsk4-214", "计划", "jìhuà", "rencana", 4, "你有什么计划？", "Nǐ yǒu shénme jìhuà?", "Kamu punya rencana apa?", ["office"]),
  w("hsk4-142", "工资", "gōngzī", "upah; gaji", 4, "他每个月的工资不高。", "Tā měi ge yuè de gōngzī bù gāo.", "Gaji bulanannya tidak tinggi.", ["office"]),
  w("hsk4-278", "联系", "liánxì", "menghubungi; hubungan", 4, "我们保持联系。", "Wǒmen bǎochí liánxì.", "Kita tetap menjalin kontak.", ["office"]),
  w("hsk5-027", "报告", "bàogào", "laporan", 5, "请你写一份报告。", "Qǐng nǐ xiě yí fèn bàogào.", "Tolong tulis sebuah laporan.", ["office"]),
  w("hsk5-576", "老板", "lǎobǎn", "bos; pemilik", 5, "他是这家店的老板。", "Tā shì zhè jiā diàn de lǎobǎn.", "Dia adalah bos toko ini.", ["office"]),
  w("hsk5-1040", "项目", "xiàngmù", "proyek; item", 5, "公司启动了新项目。", "Gōngsī qǐdòng le xīn xiàngmù.", "Perusahaan meluncurkan proyek baru.", ["office"]),
  w("hsk-theme-office-001", "邮件", "yóujiàn", "email; surat", 3, "我每天查邮件。", "Wǒ měi tiān chá yóujiàn.", "Aku memeriksa email setiap hari.", ["office"]),
  w("hsk-theme-office-002", "安排", "ānpái", "jadwal; mengatur", 3, "请安排明天的会议。", "Qǐng ānpái míngtiān de huìyì.", "Tolong atur rapat besok.", ["office"]),
  w("hsk-theme-office-003", "下班", "xiàbān", "pulang kerja", 3, "我五点下班。", "Wǒ wǔ diǎn xiàbān.", "Aku pulang kerja pukul lima.", ["office"]),
  w("hsk-theme-office-004", "招聘", "zhāopìn", "merekrut", 4, "公司正在招聘新人。", "Gōngsī zhèngzài zhāopìn xīnrén.", "Perusahaan sedang merekrut karyawan baru.", ["office"]),
];

const food: VocabItem[] = [
  w("hsk1-011", "吃", "chī", "makan", 1, "我们吃饭吧。", "Wǒmen chī fàn ba.", "Ayo kita makan.", ["food", "daily"]),
  w("hsk1-037", "喝", "hē", "minum", 1, "我想喝水。", "Wǒ xiǎng hē shuǐ.", "Aku ingin minum air.", ["food", "daily"]),
  w("hsk1-098", "水", "shuǐ", "air", 1, "我要喝热水。", "Wǒ yào hē rè shuǐ.", "Aku ingin minum air panas.", ["food", "daily"]),
  w("hsk1-009", "菜", "cài", "masakan; sayur", 1, "妈妈做的菜很好吃。", "Māmā zuò de cài hěn hǎochī.", "Masakan ibu sangat enak.", ["food"]),
  w("hsk1-010", "茶", "chá", "teh", 1, "我想喝茶。", "Wǒ xiǎng hē chá.", "Aku ingin minum teh.", ["food"]),
  w("hsk1-065", "米饭", "mǐfàn", "nasi", 1, "我想吃米饭。", "Wǒ xiǎng chī mǐfàn.", "Aku ingin makan nasi.", ["food"]),
  w("hsk1-077", "苹果", "píngguǒ", "apel", 1, "我想吃苹果。", "Wǒ xiǎng chī píngguǒ.", "Aku ingin makan apel.", ["food"]),
  w("hsk1-099", "水果", "shuǐguǒ", "buah", 1, "我喜欢吃水果。", "Wǒ xǐhuan chī shuǐguǒ.", "Aku suka makan buah.", ["food"]),
  w("hsk1-028", "饭店", "fàndiàn", "restoran", 1, "我们去饭店吃饭。", "Wǒmen qù fàndiàn chī fàn.", "Kita pergi makan di restoran.", ["food"]),
  w("hsk1-089", "商店", "shāngdiàn", "toko", 1, "商店九点开门。", "Shāngdiàn jiǔ diǎn kāi mén.", "Toko buka pukul sembilan.", ["food", "daily"]),
  w("hsk1-013", "大", "dà", "besar", 1, "这个苹果很大。", "Zhège píngguǒ hěn dà.", "Apel ini sangat besar.", ["food", "daily"]),
  w("hsk1-119", "小", "xiǎo", "kecil", 1, "这是小狗。", "Zhè shì xiǎo gǒu.", "Ini anjing kecil.", ["food", "daily"]),
  w("hsk1-083", "热", "rè", "panas", 1, "水很热。", "Shuǐ hěn rè.", "Airnya sangat panas.", ["food", "travel"]),
  w("hsk1-060", "买", "mǎi", "membeli", 1, "我要买东西。", "Wǒ yào mǎi dōngxi.", "Aku mau membeli barang.", ["food", "travel"]),
  w("hsk2-038", "贵", "guì", "mahal", 2, "这件衣服很贵。", "Zhè jiàn yīfu hěn guì.", "Pakaian ini sangat mahal.", ["food"]),
  w("hsk2-085", "便宜", "piányi", "murah", 2, "这个很便宜。", "Zhège hěn piányi.", "Ini sangat murah.", ["food"]),
  w("hsk2-042", "好吃", "hǎochī", "enak", 2, "这个苹果很好吃。", "Zhège píngguǒ hěn hǎochī.", "Apel ini sangat enak.", ["food"]),
  w("hsk2-057", "咖啡", "kāfēi", "kopi", 2, "我每天喝咖啡。", "Wǒ měi tiān hē kāfēi.", "Aku minum kopi setiap hari.", ["food"]),
  w("hsk2-081", "牛奶", "niúnǎi", "susu", 2, "我早上喝牛奶。", "Wǒ zǎoshang hē niúnǎi.", "Aku minum susu di pagi hari.", ["food"]),
  w("hsk2-050", "鸡蛋", "jīdàn", "telur", 2, "我早上吃鸡蛋。", "Wǒ zǎoshang chī jīdàn.", "Aku makan telur di pagi hari.", ["food"]),
  w("hsk2-138", "鱼", "yú", "ikan", 2, "水里有很多鱼。", "Shuǐ lǐ yǒu hěn duō yú.", "Di dalam air ada banyak ikan.", ["food"]),
  w("hsk3-157", "面包", "miànbāo", "roti", 3, "我早上吃面包。", "Wǒ zǎoshang chī miànbāo.", "Aku makan roti di pagi hari.", ["food"]),
  w("hsk3-136", "筷子", "kuàizi", "sumpit", 3, "中国人吃饭用筷子。", "Zhōngguórén chī fàn yòng kuàizi.", "Orang Tiongkok makan dengan sumpit.", ["food"]),
  w("hsk3-219", "碗", "wǎn", "mangkuk", 3, "他吃了一碗米饭。", "Tā chī le yì wǎn mǐfàn.", "Dia makan semangkuk nasi.", ["food"]),
  w("hsk3-031", "超市", "chāoshì", "supermarket", 3, "我去超市买东西。", "Wǒ qù chāoshì mǎi dōngxi.", "Aku pergi ke supermarket membeli barang.", ["food", "daily"]),
  w("hsk3-208", "甜", "tián", "manis", 3, "这个西瓜很甜。", "Zhège xīguā hěn tián.", "Semangka ini sangat manis.", ["food"]),
  w("hsk4-265", "辣", "là", "pedas", 4, "四川菜很辣。", "Sìchuān cài hěn là.", "Masakan Sichuan sangat pedas.", ["food"]),
  w("hsk4-422", "糖", "táng", "gula; permen", 4, "糖吃多了不好。", "Táng chī duō le bù hǎo.", "Makan gula terlalu banyak tidak baik.", ["food"]),
  w("hsk4-492", "盐", "yán", "garam", 4, "请给我一点盐。", "Qǐng gěi wǒ yìdiǎn yán.", "Tolong beri aku sedikit garam.", ["food"]),
  w("hsk-theme-food-001", "早饭", "zǎofàn", "sarapan", 2, "我七点吃早饭。", "Wǒ qī diǎn chī zǎofàn.", "Aku sarapan pukul tujuh.", ["food", "daily"]),
  w("hsk-theme-food-002", "午饭", "wǔfàn", "makan siang", 2, "我们一起吃午饭。", "Wǒmen yìqǐ chī wǔfàn.", "Kita makan siang bersama.", ["food"]),
  w("hsk-theme-food-003", "晚饭", "wǎnfàn", "makan malam", 2, "晚饭很好吃。", "Wǎnfàn hěn hǎochī.", "Makan malamnya sangat enak.", ["food", "daily"]),
  w("hsk-theme-food-004", "肉", "ròu", "daging", 2, "我不吃肉。", "Wǒ bù chī ròu.", "Aku tidak makan daging.", ["food"]),
];

const daily: VocabItem[] = [
  w("hsk1-045", "家", "jiā", "rumah; keluarga", 1, "我爱我的家。", "Wǒ ài wǒ de jiā.", "Aku mencintai rumahku.", ["daily"]),
  w("hsk1-076", "朋友", "péngyou", "teman", 1, "她是我的好朋友。", "Tā shì wǒ de hǎo péngyou.", "Dia teman baikku.", ["daily"]),
  w("hsk1-001", "爱", "ài", "cinta; suka", 1, "我爱我家。", "Wǒ ài wǒ jiā.", "Aku mencintai keluargaku.", ["daily"]),
  w("hsk1-126", "喜欢", "xǐhuan", "suka", 1, "我喜欢汉语。", "Wǒ xǐhuan Hànyǔ.", "Aku suka bahasa Mandarin.", ["daily"]),
  w("hsk1-100", "睡觉", "shuìjiào", "tidur", 1, "我十点睡觉。", "Wǒ shí diǎn shuìjiào.", "Aku tidur pukul sepuluh.", ["daily"]),
  w("hsk1-130", "学校", "xuéxiào", "sekolah", 1, "我的学校很大。", "Wǒ de xuéxiào hěn dà.", "Sekolahku sangat besar.", ["daily"]),
  w("hsk1-050", "看", "kàn", "melihat; membaca", 1, "我看书。", "Wǒ kàn shū.", "Aku membaca buku.", ["daily", "travel"]),
  w("hsk1-129", "学习", "xuéxí", "belajar", 1, "我学习汉语。", "Wǒ xuéxí Hànyǔ.", "Aku belajar bahasa Mandarin.", ["daily", "office"]),
  w("hsk1-110", "听", "tīng", "mendengar", 1, "我听老师说话。", "Wǒ tīng lǎoshī shuōhuà.", "Aku mendengarkan guru berbicara.", ["daily", "office"]),
  w("hsk1-013", "大", "dà", "besar", 1, "这个苹果很大。", "Zhège píngguǒ hěn dà.", "Apel ini sangat besar.", ["daily", "food"]),
  w("hsk1-119", "小", "xiǎo", "kecil", 1, "这是小狗。", "Zhè shì xiǎo gǒu.", "Ini anjing kecil.", ["daily", "food"]),
  w("hsk1-047", "今天", "jīntiān", "hari ini", 1, "今天天气很好。", "Jīntiān tiānqì hěn hǎo.", "Hari ini cuacanya bagus.", ["daily", "travel"]),
  w("hsk1-066", "明天", "míngtiān", "besok", 1, "明天我去学校。", "Míngtiān wǒ qù xuéxiào.", "Besok aku pergi ke sekolah.", ["daily", "travel"]),
  w("hsk1-150", "昨天", "zuótiān", "kemarin", 1, "昨天很热。", "Zuótiān hěn rè.", "Kemarin sangat panas.", ["daily", "travel"]),
  w("hsk1-127", "星期", "xīngqī", "minggu", 1, "今天是星期三。", "Jīntiān shì Xīngqīsān.", "Hari ini hari Rabu.", ["daily", "travel", "office"]),
  w("hsk1-137", "月", "yuè", "bulan", 1, "我八月去北京。", "Wǒ bā yuè qù Běijīng.", "Aku pergi ke Beijing pada bulan Agustus.", ["daily", "travel"]),
  w("hsk1-073", "年", "nián", "tahun", 1, "我今年九岁。", "Wǒ jīnnián jiǔ suì.", "Tahun ini aku berumur sembilan tahun.", ["daily", "travel"]),
  w("hsk1-109", "天气", "tiānqì", "cuaca", 1, "今天天气很好。", "Jīntiān tiānqì hěn hǎo.", "Hari ini cuacanya bagus.", ["daily", "travel"]),
  w("hsk1-018", "电视", "diànshì", "televisi", 1, "爸爸在看电视。", "Bàba zài kàn diànshì.", "Ayah sedang menonton televisi.", ["daily"]),
  w("hsk1-017", "电脑", "diànnǎo", "komputer", 1, "我用电脑学习。", "Wǒ yòng diànnǎo xuéxí.", "Aku belajar memakai komputer.", ["daily", "office"]),
  w("hsk1-132", "衣服", "yīfu", "pakaian", 1, "衣服在椅子上。", "Yīfu zài yǐzi shang.", "Baju ada di atas kursi.", ["daily"]),
  w("hsk1-134", "医院", "yīyuàn", "rumah sakit", 1, "妈妈在医院工作。", "Māmā zài yīyuàn gōngzuò.", "Ibu bekerja di rumah sakit.", ["daily"]),
  w("hsk2-143", "早上", "zǎoshang", "pagi hari", 2, "我早上六点起床。", "Wǒ zǎoshang liù diǎn qǐchuáng.", "Aku bangun pukul enam pagi.", ["daily", "travel"]),
  w("hsk2-110", "晚上", "wǎnshang", "malam", 2, "我晚上在家看电视。", "Wǒ wǎnshang zài jiā kàn diànshì.", "Aku menonton TV di rumah pada malam hari.", ["daily", "travel"]),
  w("hsk2-089", "起床", "qǐchuáng", "bangun tidur", 2, "我每天早上七点起床。", "Wǒ měi tiān zǎoshang qī diǎn qǐchuáng.", "Aku bangun pukul tujuh setiap pagi.", ["daily"]),
  w("hsk2-097", "时间", "shíjiān", "waktu", 2, "时间过得真快！", "Shíjiān guò de zhēn kuài!", "Waktu berlalu sangat cepat!", ["daily", "travel", "office"]),
  w("hsk2-100", "手机", "shǒujī", "ponsel", 2, "我的手机没电了。", "Wǒ de shǒujī méi diàn le.", "Ponselku kehabisan baterai.", ["daily", "office"]),
  w("hsk2-064", "快乐", "kuàilè", "bahagia", 2, "祝你生日快乐！", "Zhù nǐ shēngrì kuàilè!", "Selamat ulang tahun!", ["daily"]),
  w("hsk2-122", "休息", "xiūxi", "istirahat", 2, "我想休息一下。", "Wǒ xiǎng xiūxi yíxià.", "Aku ingin istirahat sebentar.", ["daily"]),
  w("hsk3-044", "打扫", "dǎsǎo", "membersihkan", 3, "我每天打扫房间。", "Wǒ měi tiān dǎsǎo fángjiān.", "Aku membersihkan kamar setiap hari.", ["daily"]),
  w("hsk3-241", "洗澡", "xǐzǎo", "mandi", 3, "我晚上洗澡。", "Wǒ wǎnshang xǐzǎo.", "Aku mandi pada malam hari.", ["daily"]),
  w("hsk3-031", "超市", "chāoshì", "supermarket", 3, "我去超市买东西。", "Wǒ qù chāoshì mǎi dōngxi.", "Aku pergi ke supermarket membeli barang.", ["daily", "food"]),
  w("hsk4-362", "散步", "sànbù", "jalan-jalan", 4, "晚饭后我们去散步。", "Wǎnfàn hòu wǒmen qù sànbù.", "Setelah makan malam kami pergi jalan-jalan.", ["daily"]),
  w("hsk-theme-daily-001", "做饭", "zuòfàn", "memasak", 2, "妈妈在做饭。", "Māmā zài zuòfàn.", "Ibu sedang memasak.", ["daily"]),
  w("hsk-theme-daily-002", "逛街", "guàngjiē", "jalan-jalan belanja", 3, "我和朋友去逛街。", "Wǒ hé péngyou qù guàngjiē.", "Aku pergi jalan-jalan belanja dengan teman.", ["daily"]),
];

export const HSK_THEMES: ThemePack[] = [
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

export function getHskTheme(id: string): ThemePack | undefined {
  return HSK_THEMES.find((theme) => theme.id === id);
}

export function allHskThemes(): ThemePack[] {
  return HSK_THEMES;
}
