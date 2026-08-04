/**
 * Paket tematik English — kosakata dikelompokkan per SITUASI nyata
 * (perjalanan, kantor, makanan, sehari-hari), bukan per kelas kata.
 *
 * Lihat lib/japanese/themes.ts untuk catatan dasar riset (kluster tematik
 * memfasilitasi retensi; kluster semantik menimbulkan interferensi).
 *
 * Kata yang sudah ada di kurikulum English CEFR dipakai ulang dengan ID yang
 * SAMA (`en-aX-NNN`) agar progres SRS (keyed by `word.id`) menyatu dengan
 * flashcard level biasa. Kata baru diberi ID `en-theme-<tema>-NNN`.
 */

import type { VocabItem } from "../languages/types";
import type { ThemeId, ThemePack } from "../themes/types";

function w(
  id: string,
  term: string,
  meaning: string,
  level: number,
  example: string,
  exampleMeaning: string,
  themes: ThemeId[],
): VocabItem {
  return {
    id,
    term,
    meaning,
    level,
    example,
    exampleMeaning,
    themes,
  };
}

const travel: VocabItem[] = [
  w("en-a1-033", "go", "pergi", 1, "I go to school.", "Saya pergi ke sekolah.", ["travel"]),
  w("en-a1-034", "come", "datang", 1, "Come here, please.", "Datang ke sini, tolong.", ["travel"]),
  w("en-a1-035", "see", "melihat", 1, "I see a bird.", "Saya melihat seekor burung.", ["travel"]),
  w("en-a1-026", "hot", "panas", 1, "The tea is hot.", "Tehnya panas.", ["travel", "food"]),
  w("en-a1-027", "cold", "dingin", 1, "The water is cold.", "Airnya dingin.", ["travel", "food"]),
  w("en-a1-040", "day", "hari", 1, "Have a good day!", "Semoga harimu menyenangkan!", ["travel", "daily"]),
  w("en-a1-041", "night", "malam", 1, "Good night, mom.", "Selamat malam, Bu.", ["travel", "daily"]),
  w("en-a2-008", "money", "uang", 2, "I need money for the bus.", "Saya butuh uang untuk bus.", ["travel", "office"]),
  w("en-a2-009", "buy", "membeli", 2, "We buy food at the market.", "Kami membeli makanan di pasar.", ["travel", "food"]),
  w("en-a2-012", "time", "waktu", 2, "What time is it?", "Sekarang jam berapa?", ["travel", "office", "daily"]),
  w("en-a2-014", "week", "minggu", 2, "I see her every week.", "Saya menemuinya setiap minggu.", ["travel", "office", "daily"]),
  w("en-a2-015", "month", "bulan", 2, "We travel next month.", "Kami bepergian bulan depan.", ["travel", "office"]),
  w("en-a2-016", "year", "tahun", 2, "She is six years old.", "Dia berumur enam tahun.", ["travel", "office", "daily"]),
  w("en-a2-020", "morning", "pagi", 2, "I run in the morning.", "Saya berlari di pagi hari.", ["travel", "daily"]),
  w("en-a2-030", "beautiful", "indah; cantik", 2, "The beach is beautiful.", "Pantainya indah.", ["travel"]),
  w("en-a2-035", "fast", "cepat", 2, "The train is fast.", "Keretanya cepat.", ["travel"]),
  w("en-a2-044", "travel", "bepergian; perjalanan", 2, "They travel by train.", "Mereka bepergian dengan kereta.", ["travel"]),
  w("en-a2-045", "weather", "cuaca", 2, "The weather is nice today.", "Cuacanya bagus hari ini.", ["travel"]),
  w("en-a2-046", "rain", "hujan", 2, "It will rain tonight.", "Akan turun hujan malam ini.", ["travel"]),
  w("en-a2-047", "sun", "matahari", 2, "The sun is bright.", "Mataharinya terang.", ["travel"]),
  w("en-a2-050", "city", "kota", 2, "The city is very busy.", "Kotanya sangat ramai.", ["travel"]),
  w("en-theme-travel-001", "airport", "bandara", 2, "We arrived at the airport in the morning.", "Kami tiba di bandara pada pagi hari.", ["travel"]),
  w("en-theme-travel-002", "ticket", "tiket", 2, "I bought a train ticket.", "Saya membeli tiket kereta.", ["travel"]),
  w("en-theme-travel-003", "train", "kereta", 2, "The train leaves at nine.", "Kereta berangkat pukul sembilan.", ["travel"]),
  w("en-theme-travel-004", "taxi", "taksi", 2, "Let's take a taxi to the hotel.", "Ayo naik taksi ke hotel.", ["travel"]),
  w("en-theme-travel-005", "map", "peta", 2, "Look at the map to find the station.", "Lihat peta untuk menemukan stasiun.", ["travel"]),
  w("en-theme-travel-006", "hotel", "hotel", 2, "The hotel is near the beach.", "Hotelnya dekat pantai.", ["travel"]),
  w("en-theme-travel-007", "passport", "paspor", 3, "Don't forget your passport.", "Jangan lupa paspormu.", ["travel"]),
  w("en-theme-travel-008", "luggage", "koper; barang bawaan", 3, "My luggage is too heavy.", "Koperku terlalu berat.", ["travel"]),
  w("en-theme-travel-009", "arrive", "tiba", 2, "We will arrive at noon.", "Kami akan tiba siang hari.", ["travel"]),
  w("en-theme-travel-010", "leave", "berangkat; pergi", 2, "The bus leaves at seven.", "Bus berangkat pukul tujuh.", ["travel"]),
];

const office: VocabItem[] = [
  w("en-a1-024", "new", "baru", 1, "This is a new phone.", "Ini ponsel baru.", ["office", "daily"]),
  w("en-a2-007", "work", "bekerja; pekerjaan", 2, "I work in an office.", "Saya bekerja di kantor.", ["office", "daily"]),
  w("en-a2-008", "money", "uang", 2, "I need money for the bus.", "Saya butuh uang untuk bus.", ["office", "travel"]),
  w("en-a2-012", "time", "waktu", 2, "What time is it?", "Sekarang jam berapa?", ["office", "travel", "daily"]),
  w("en-a2-013", "hour", "jam (durasi)", 2, "I study for one hour.", "Saya belajar selama satu jam.", ["office", "daily"]),
  w("en-a2-014", "week", "minggu", 2, "I see her every week.", "Saya menemuinya setiap minggu.", ["office", "travel", "daily"]),
  w("en-a2-015", "month", "bulan", 2, "We travel next month.", "Kami bepergian bulan depan.", ["office", "travel"]),
  w("en-a2-016", "year", "tahun", 2, "She is six years old.", "Dia berumur enam tahun.", ["office", "travel", "daily"]),
  w("en-a2-039", "learn", "belajar", 2, "I learn English every day.", "Saya belajar bahasa Inggris setiap hari.", ["office", "daily"]),
  w("en-a2-040", "speak", "berbicara", 2, "Can you speak slowly?", "Bisakah kamu berbicara pelan-pelan?", ["office"]),
  w("en-a2-041", "read", "membaca", 2, "I read before bed.", "Saya membaca sebelum tidur.", ["office", "daily"]),
  w("en-a2-042", "write", "menulis", 2, "Please write your name.", "Tolong tulis namamu.", ["office"]),
  w("en-a2-043", "listen", "mendengarkan", 2, "Listen to the music.", "Dengarkan musiknya.", ["office"]),
  w("en-b1-001", "achieve", "mencapai", 3, "She worked hard to achieve her goal.", "Dia bekerja keras untuk mencapai tujuannya.", ["office"]),
  w("en-b1-018", "discuss", "mendiskusikan", 3, "We discussed the plan for an hour.", "Kami mendiskusikan rencana itu selama satu jam.", ["office"]),
  w("en-b1-029", "information", "informasi", 3, "You can find more information on the website.", "Kamu bisa menemukan informasi lebih lanjut di situs web.", ["office"]),
  w("en-b1-033", "manage", "mengelola; mampu", 3, "She manages a small shop.", "Dia mengelola sebuah toko kecil.", ["office"]),
  w("en-b1-036", "plan", "rencana; merencanakan", 3, "We plan to visit Bali next month.", "Kami berencana mengunjungi Bali bulan depan.", ["office"]),
  w("en-b1-038", "prepare", "menyiapkan", 3, "She is preparing for the exam.", "Dia sedang menyiapkan diri untuk ujian.", ["office"]),
  w("en-b2-014", "colleague", "rekan kerja", 4, "My colleagues are very supportive.", "Rekan kerjaku sangat mendukung.", ["office"]),
  w("en-theme-office-001", "office", "kantor", 2, "I work in a big office.", "Saya bekerja di kantor yang besar.", ["office"]),
  w("en-theme-office-002", "meeting", "rapat", 3, "The meeting starts at ten.", "Rapat dimulai pukul sepuluh.", ["office"]),
  w("en-theme-office-003", "email", "email; surel", 2, "Please send me an email.", "Tolong kirim email kepadaku.", ["office"]),
  w("en-theme-office-004", "report", "laporan", 3, "I need to write a report.", "Saya perlu menulis laporan.", ["office"]),
  w("en-theme-office-005", "deadline", "tenggat waktu", 4, "The deadline is Friday.", "Tenggat waktunya hari Jumat.", ["office"]),
  w("en-theme-office-006", "boss", "atasan; bos", 2, "My boss is very kind.", "Boskuku sangat baik.", ["office"]),
  w("en-theme-office-007", "salary", "gaji", 3, "Her salary is good.", "Gajinya bagus.", ["office"]),
  w("en-theme-office-008", "appointment", "janji temu", 3, "I have an appointment at two.", "Saya punya janji temu pukul dua.", ["office"]),
  w("en-theme-office-009", "project", "proyek", 3, "We finished the project on time.", "Kami menyelesaikan proyek tepat waktu.", ["office"]),
  w("en-theme-office-010", "schedule", "jadwal", 3, "What is your schedule today?", "Apa jadwalmu hari ini?", ["office"]),
];

const food: VocabItem[] = [
  w("en-a1-020", "good", "baik; bagus", 1, "The food is good.", "Makanannya enak.", ["food", "daily"]),
  w("en-a1-022", "big", "besar", 1, "The house is big.", "Rumahnya besar.", ["food", "daily"]),
  w("en-a1-023", "small", "kecil", 1, "The cat is small.", "Kucingnya kecil.", ["food", "daily"]),
  w("en-a1-026", "hot", "panas", 1, "The tea is hot.", "Tehnya panas.", ["food", "travel"]),
  w("en-a1-027", "cold", "dingin", 1, "The water is cold.", "Airnya dingin.", ["food", "travel"]),
  w("en-a1-031", "eat", "makan", 1, "I eat rice every day.", "Saya makan nasi setiap hari.", ["food", "daily"]),
  w("en-a1-032", "drink", "minum", 1, "We drink water.", "Kami minum air.", ["food", "daily"]),
  w("en-a1-036", "like", "suka", 1, "I like apples.", "Saya suka apel.", ["food", "daily"]),
  w("en-a1-038", "want", "ingin", 1, "I want some tea.", "Saya ingin teh.", ["food"]),
  w("en-a1-042", "water", "air", 1, "I drink water.", "Saya minum air.", ["food", "daily"]),
  w("en-a1-043", "food", "makanan", 1, "The food is delicious.", "Makanannya lezat.", ["food"]),
  w("en-a1-049", "apple", "apel", 1, "The apple is red.", "Apelnya merah.", ["food"]),
  w("en-a1-050", "milk", "susu", 1, "I drink milk at night.", "Saya minum susu di malam hari.", ["food"]),
  w("en-a2-009", "buy", "membeli", 2, "We buy food at the market.", "Kami membeli makanan di pasar.", ["food", "travel"]),
  w("en-a2-011", "shop", "toko", 2, "The shop opens at eight.", "Tokonya buka pukul delapan.", ["food", "daily"]),
  w("en-a2-022", "breakfast", "sarapan", 2, "I have breakfast at seven.", "Saya sarapan pukul tujuh.", ["food", "daily"]),
  w("en-a2-023", "lunch", "makan siang", 2, "Lunch is ready.", "Makan siang sudah siap.", ["food", "daily"]),
  w("en-a2-024", "dinner", "makan malam", 2, "Dinner is at six.", "Makan malam pukul enam.", ["food", "daily"]),
  w("en-a2-025", "delicious", "lezat", 2, "This cake is delicious.", "Kue ini lezat.", ["food"]),
  w("en-a2-026", "hungry", "lapar", 2, "I am hungry now.", "Saya lapar sekarang.", ["food"]),
  w("en-a2-027", "thirsty", "haus", 2, "Are you thirsty?", "Apakah kamu haus?", ["food"]),
  w("en-a2-031", "expensive", "mahal", 2, "This phone is expensive.", "Ponsel ini mahal.", ["food"]),
  w("en-a2-032", "cheap", "murah", 2, "The food here is cheap.", "Makanan di sini murah.", ["food"]),
  w("en-theme-food-001", "rice", "nasi", 1, "We eat rice every day.", "Kami makan nasi setiap hari.", ["food"]),
  w("en-theme-food-002", "tea", "teh", 1, "Would you like a cup of tea?", "Mau secangkir teh?", ["food"]),
  w("en-theme-food-003", "coffee", "kopi", 2, "I drink coffee in the morning.", "Saya minum kopi di pagi hari.", ["food"]),
  w("en-theme-food-004", "bread", "roti", 2, "She bought some bread.", "Dia membeli roti.", ["food"]),
  w("en-theme-food-005", "egg", "telur", 2, "I eat an egg for breakfast.", "Saya makan telur untuk sarapan.", ["food"]),
  w("en-theme-food-006", "chicken", "ayam", 2, "This chicken is delicious.", "Ayam ini lezat.", ["food"]),
  w("en-theme-food-007", "fish", "ikan", 2, "My father likes fish.", "Ayahku suka ikan.", ["food"]),
  w("en-theme-food-008", "fruit", "buah", 2, "Fruit is good for your health.", "Buah baik untuk kesehatan.", ["food"]),
  w("en-theme-food-009", "vegetable", "sayur", 2, "Eat more vegetables.", "Makan lebih banyak sayur.", ["food"]),
  w("en-theme-food-010", "menu", "menu", 3, "Let me look at the menu.", "Biarkan aku melihat menu.", ["food"]),
  w("en-theme-food-011", "restaurant", "restoran", 2, "We had dinner at a restaurant.", "Kami makan malam di restoran.", ["food"]),
  w("en-theme-food-012", "sweet", "manis", 2, "This cake is too sweet.", "Kue ini terlalu manis.", ["food"]),
];

const daily: VocabItem[] = [
  w("en-a1-020", "good", "baik; bagus", 1, "The food is good.", "Makanannya enak.", ["daily", "food"]),
  w("en-a1-022", "big", "besar", 1, "The house is big.", "Rumahnya besar.", ["daily", "food"]),
  w("en-a1-023", "small", "kecil", 1, "The cat is small.", "Kucingnya kecil.", ["daily", "food"]),
  w("en-a1-024", "new", "baru", 1, "This is a new phone.", "Ini ponsel baru.", ["daily", "office"]),
  w("en-a1-031", "eat", "makan", 1, "I eat rice every day.", "Saya makan nasi setiap hari.", ["daily", "food"]),
  w("en-a1-032", "drink", "minum", 1, "We drink water.", "Kami minum air.", ["daily", "food"]),
  w("en-a1-037", "love", "cinta; menyayangi", 1, "I love my family.", "Saya menyayangi keluargaku.", ["daily"]),
  w("en-a1-040", "day", "hari", 1, "Have a good day!", "Semoga harimu menyenangkan!", ["daily", "travel"]),
  w("en-a1-041", "night", "malam", 1, "Good night, mom.", "Selamat malam, Bu.", ["daily", "travel"]),
  w("en-a1-045", "house", "rumah", 1, "My house is big.", "Rumahku besar.", ["daily"]),
  w("en-a1-046", "school", "sekolah", 1, "We go to school.", "Kami pergi ke sekolah.", ["daily"]),
  w("en-a1-047", "friend", "teman", 1, "She is my best friend.", "Dia sahabatku.", ["daily"]),
  w("en-a2-001", "family", "keluarga", 2, "My family is small.", "Keluargaku kecil.", ["daily"]),
  w("en-a2-007", "work", "bekerja; pekerjaan", 2, "I work in an office.", "Saya bekerja di kantor.", ["daily", "office"]),
  w("en-a2-012", "time", "waktu", 2, "What time is it?", "Sekarang jam berapa?", ["daily", "travel", "office"]),
  w("en-a2-013", "hour", "jam (durasi)", 2, "I study for one hour.", "Saya belajar selama satu jam.", ["daily", "office"]),
  w("en-a2-017", "today", "hari ini", 2, "Today is Monday.", "Hari ini hari Senin.", ["daily"]),
  w("en-a2-018", "tomorrow", "besok", 2, "See you tomorrow!", "Sampai jumpa besok!", ["daily"]),
  w("en-a2-019", "yesterday", "kemarin", 2, "It rained yesterday.", "Kemarin turun hujan.", ["daily"]),
  w("en-a2-020", "morning", "pagi", 2, "I run in the morning.", "Saya berlari di pagi hari.", ["daily", "travel"]),
  w("en-a2-021", "evening", "sore; malam", 2, "We eat together in the evening.", "Kami makan bersama di malam hari.", ["daily"]),
  w("en-a2-022", "breakfast", "sarapan", 2, "I have breakfast at seven.", "Saya sarapan pukul tujuh.", ["daily", "food"]),
  w("en-a2-023", "lunch", "makan siang", 2, "Lunch is ready.", "Makan siang sudah siap.", ["daily", "food"]),
  w("en-a2-024", "dinner", "makan malam", 2, "Dinner is at six.", "Makan malam pukul enam.", ["daily", "food"]),
  w("en-a2-028", "happy", "senang", 2, "I am very happy today.", "Saya sangat senang hari ini.", ["daily"]),
  w("en-a2-029", "sad", "sedih", 2, "The movie made me sad.", "Film itu membuatku sedih.", ["daily"]),
  w("en-a2-039", "learn", "belajar", 2, "I learn English every day.", "Saya belajar bahasa Inggris setiap hari.", ["daily", "office"]),
  w("en-a2-041", "read", "membaca", 2, "I read before bed.", "Saya membaca sebelum tidur.", ["daily", "office"]),
  w("en-theme-daily-001", "wake", "bangun tidur", 2, "I wake up at six every day.", "Saya bangun pukul enam setiap hari.", ["daily"]),
  w("en-theme-daily-002", "sleep", "tidur", 2, "I sleep eight hours.", "Saya tidur delapan jam.", ["daily"]),
  w("en-theme-daily-003", "shower", "mandi", 2, "He takes a shower in the morning.", "Dia mandi di pagi hari.", ["daily"]),
  w("en-theme-daily-004", "walk", "berjalan", 2, "We walk to the park.", "Kami berjalan kaki ke taman.", ["daily"]),
  w("en-theme-daily-005", "rest", "istirahat", 2, "You need some rest.", "Kamu butuh istirahat.", ["daily"]),
  w("en-theme-daily-006", "clean", "membersihkan", 2, "I clean my room on Sunday.", "Saya membersihkan kamar pada hari Minggu.", ["daily"]),
  w("en-theme-daily-007", "cook", "memasak", 2, "My mother cooks dinner.", "Ibuku memasak makan malam.", ["daily"]),
];

export const ENGLISH_THEMES: ThemePack[] = [
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

export function getEnglishTheme(id: string): ThemePack | undefined {
  return ENGLISH_THEMES.find((theme) => theme.id === id);
}

export function allEnglishThemes(): ThemePack[] {
  return ENGLISH_THEMES;
}
