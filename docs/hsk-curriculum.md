# Kurikulum HSK — Panduan Konten

Dokumen ini menjelaskan bagaimana kosakata HSK disimpan, aturan datanya, dan cara menambahkan/mengisi data kosakata.

## Sumber Standar

Level HSK mengikuti daftar kosakata resmi **HSK (Hanyu Shuiping Kaoshi)**:

| Level | Jumlah kata resmi |
|---|---|
| HSK 1 | 150 |
| HSK 2 | 300 |
| HSK 3 | 600 |
| HSK 4 | 1200 |
| HSK 5 | 2500 |
| HSK 6 | 5000 |

> ⚠️ **Status konten**:
>
> - ✅ **HSK 1 — lengkap (150 kata resmi)** di `lib/hsk/data.ts`.
> - ✅ **HSK 2 — lengkap (156 kata baru, di luar HSK 1)** di `lib/hsk/data.ts`.
> - ✅ **HSK 3 — lengkap (287 kata baru, di luar HSK 1 & 2, sesuai daftar resmi HSK 2.0)** di `lib/hsk/data.ts`.
>   Daftar resmi HSK 3 memuat 300 kata (298 hanzi unik); 11 sudah masuk HSK 1/2,
>   jadi tersimpan 287 kata. Kata yang bukan bagian daftar resmi (kebanyakan
>   HSK 4) dibuang saat review kamus (v0.2.0).
> - ✅ **HSK 4 — lengkap (598 kata baru, di luar HSK 1–3, sesuai daftar resmi HSK 2.0)** di `lib/hsk/data.ts`.
>   Daftar resmi HSK 4 memuat 600 kata baru; 得 & 等 sudah ada di HSK 2, jadi
>   tersimpan 598 kata.
> - ✅ **HSK 5 — lengkap (1235 kata baru, di luar HSK 1–4, sesuai daftar resmi HSK 2.0)** di `lib/hsk/data.ts`.
>   Daftar resmi HSK 5 memuat 1300 kata baru; setelah dedup terhadap HSK 1–4
>   (kata yang hanzi-nya sudah ada di level bawah dibuang), tersimpan 1235 kata.
> - ⏳ HSK 6 belum diisi. Daftar resmi lengkap menyusul — ikuti panduan di bawah ini.
>
> Catatan leveling: setiap level hanya memuat **kata yang belum ada di level
> sebelumnya** (HSK 2 = kata baru HSK 2, HSK 3 = kata baru HSK 3, bukan gabungan
> level bawah). Progress, checklist, dan tes kelulusan berjalan per level dengan
> basis ini. Saat menambah level baru, jalankan **dedup**: buang kata yang hanzi-nya
> sudah ada di level bawah (dengan skrip serupa `dedup-hsk3`), lalu penomoran
> ulang ID berurutan.

## Struktur Data

Setiap kata direpresentasikan sebagai `VocabWord`:

```ts
interface VocabWord {
  id: string;          // format: "hsk{level}-{urutan}" → "hsk1-061"
  hanzi: string;       // hanzi/tulisan Mandarin
  pinyin: string;      // pelafalan dengan tanda nada → "nǐ hǎo"
  meaning: string;     // arti dalam Bahasa Indonesia
  hsk: HskLevel;       // 1–6
  example?: string;    // contoh kalimat (opsional)
  examplePinyin?: string;
  exampleMeaning?: string;
}
```

Lokasi file: `lib/hsk/data.ts`.

## Aturan Pengisian Data

1. **ID unik** per kata, format `hsk{level}-{000}` berurutan. Jangan duplikat.
2. **Satu kata = satu level.** Level N hanya memuat kata yang belum ada di level N−1 (HSK 2 ≠ gabungan HSK 1+2).
3. **Pinyin wajib pakai tanda nada** (tone marks):
   - `nǐ hǎo` (bukan `ni hao`)
   - `xièxie` (netral tone dibiarkan tanpa tanda)
   - Suara netral: `xuésheng` (untuk 学生), `péngyou` (untuk 朋友).
4. **Arti dalam Bahasa Indonesia**, singkat dan netral.
5. **Contoh kalimat opsional**, tetapi sangat dianjurkan untuk HSK 1–2.
6. **Satu entri = satu kata**. Kata majemuk (mis. 再见) tetap satu entri, bukan dipecah.
7. Kelompokkan sesuai level (semua `hsk: 2` di blok yang jelas).

## Cara Menambahkan Kosakata

Edit `lib/hsk/data.ts` dan tambahkan entri baru ke array `hskWords`:

```ts
{ id: "hsk1-061", hanzi: "猫", pinyin: "māo", meaning: "kucing", hsk: 1 },
```

Untuk level baru (HSK 4 dst), tambahkan blok `hsk{level}-001…` lalu jalankan
**dedup + penomoran ulang** agar ID berurutan dan tidak ada hanzi yang sama
dengan level bawah:

```bash
# contoh pola (skrip sekali pakai; hapus setelah dipakai)
node -e '
const fs=require("fs");
let src=fs.readFileSync("lib/hsk/data.ts","utf8");
const re=/^(\s*\{ id: "hsk(\d)-\d+", hanzi: "([^"]+)", pinyin: "([^"]+)", meaning: "([^"]+)", hsk: (\d) \},?)(\r?\n?)/gm;
const known=new Set(), seen=new Set(); let c=0;
src=src.replace(re,(w,line,lv,hanzi,pinyin,meaning,hsk)=>{
  if(lv==="4"){
    if(known.has(hanzi)||seen.has(hanzi)) return "";
    seen.add(hanzi); c++;
    return `  { id: "hsk4-${String(c).padStart(3,"0")}", hanzi: "${hanzi}", pinyin: "${pinyin}", meaning: "${meaning}", hsk: 4 },\n`;
  }
  known.add(hanzi); return line;
});
fs.writeFileSync("lib/hsk/data.ts",src);
console.log("hsk4 kept:",c);
'
```

Lalu pastikan tetap lolos:

```bash
npm run lint
npm run build
```

## Verifikasi & Sumber Referensi

- Gunakan daftar kosakata resmi HSK terbaru sebagai acuan (perhatikan bahwa standar HSK 3.0 mengubah struktur level menjadi 9 tingkatan — pastikan target versi resminya ditentukan dulu).
- Cek pinyin nada di kamus tepercaya sebelum commit.
- Audio native speaker akan ditambahkan di V3; kolom `audio_url` sudah disiapkan di skema DB (lihat `docs/data-model.md`).

## Ekspansi ke Bahasa Lain (V2)

Saat bahasa baru ditambahkan, struktur kosakata di-refactor agar generic:

- Field `hanzi` → `script` (menampung hanzi / kana / huruf latin).
- Field `pinyin` → `reading` (pinyin / romaji / IPA).
- Field `hsk` → `level_id` yang merujuk tabel `levels` (HSK, JLPT, dst).

Panduan lengkap: `docs/modules.md`.
