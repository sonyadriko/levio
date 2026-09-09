# Motion — Panduan mikro-interaksi (spring physics)

Referensi: [Kinetics — Spring-physics motion for web interfaces](https://kinetics.colorion.co/)
(135 interaksi berbasis spring; tiap efek punya versi CSS / React / prompt AI).

Dokumen ini berisi keputusan desain (UI/UX): **apa yang diadopsi** dan **apa yang
tidak diadopsi**, plus alasan. Tujuannya supaya motion di Levio konsisten,
bermakna (mendukung belajar), dan tidak menjadi hiasan yang berisik.

## Prinsip yang dipegang

1. **Konsistensi dulu.** Motion hanya diadopsi bila selaras dengan bahasa visual
   yang sudah ada. Levio sudah memakai kurva *spring* `cubic-bezier(0.34, 1.56, 0.64, 1)`
   (`--animate-pop`, `--animate-ring-fill`) dan `cubic-bezier(0.16, 1, 0.3, 1)`
   (`--animate-slide-up`, `--animate-bar-grow`). Adopsi baru memperluas keluarga
   kurva yang sama, bukan memperkenalkan bahasa baru.
2. **Motion = fungsi, bukan hiasan.** Efek dipakai untuk memperkuat *feedback*
   belajar (benar/salah, progres, XP, streak) dan navigasi (tab, mode), bukan
   untuk sekadar "wow".
3. **Mobile-first.** Semua efek harus bekerja di layar sentuh (bottom nav).
   Efek yang bergantung `:hover` dianggap mati untuk mayoritas pengguna.
4. **Performa & aksesibilitas.** Hanya `transform`/`opacity` (GPU-composited,
   tanpa layout thrash), plus guard `prefers-reduced-motion` global.

## Kenapa spring physics? (premis Kinetics)

- **Bisa diinterupsi**. Spring merespons interupsi (ketuk cepat, ganti tab
  mendadak) dengan natural; easing berbasis durasi akan *restart* tersendat.
  Levio penuh interaksi cepat: gurik flashcard, lanjut soal, stepper.
- **Konsisten dengan pola yang ada** (lihat prinsip #1).
- **Feedback belajar** — pop kecil saat jawaban benar / XP / streak memperkuat
  penguatan positif, inti aplikasi belajar.

## ✅ Diadopsi

| Efek (Hero) | Tempat di Levio | Kurva | Alasan |
|---|---|---|---|
| **Toast Overshoot** | Sistem `components/toast.tsx` (baru) | masuk: `cubic-bezier(0.18, 1.25, 0.4, 1)`; keluar: ease-in | Tidak ada toast global sebelumnya (baru inline banner di profil & sync-banner). Feedback ringan di atas konten tanpa memindah layout; kurva overshoot konsisten dengan bahasa spring. Dipakai pertama di: selesai mode **Match**. |
| **Tab Pill Glide** | `components/sliding-tabs.tsx` (baru) dipasang di switcher **5 mode latihan** | `cubic-bezier(0.65, 0, 0.35, 1)` (glide) | Indikator aktif yang mengukur lebar tombol lalu meluncur memberi feedback "posisi saya" langsung — krusial pada switcher mode yang sering diganti (flashcard/kuis/ketik/cocok/dengar). |
| **Number Counter bump** | `components/spring-counter.tsx` (baru) dipakai di XP (`home-stats`) & skor (`mock-test`) | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Digit "berbentur" saat XP/skor bertambah memperkuat rasa pencapaian; melanjutkan pola `useCountUp` yang sudah ada (tinggal menambah overshoot kecil). |
| Accordion Spring | `<details>` log gym & "Yang Baru" (belum dianimasi) | `cubic-bezier(0.16,1,0.3,1)` + chevron `(0.34,1.56,0.64,1)` | Chevron putar-spring + body glide membuat expand/collapse hidup; `details` native tetap dapat keyboard/focus. **Catatan:** batasi konten pendek agar tak layout thrash. ✅ diimplementasi |
| Squish Button | tombol aksi utama ("Periksa"/"Selanjutnya") | cepat `0.08s` turun, pegas `0.5s` kembali | Tekan terasa fisik; mensampling `active:scale` saat ini. Asimetris (turun cepat, pulang bouncy) = kunci terasa responsif. ✅ diimplementasi |
| Choice Chips | pill filter mode/tag otot | `(0.34,1.56,0.64,1)` | Sudah sejalan `animate-pop`; tinggal konsisten. ✅ diimplementasi |
| Quantity Stepper | target harian di profil | value bump `(0.34,1.56,0.64,1)` + `tabular-nums` | Digit tidak "menari" saat berubah. ✅ diimplementasi |

> Sudah diadopsi langkah pertama: **Toast**, **Tab Pill**, **Number bump**.
> Langkah kedua: **Accordion Spring**, **Squish Button**, **Choice Chips**,
> **Quantity Stepper** — semuanya sudah diimplementasi (v0.17.0).

## ❌ Tidak diadopsi (beserta alasan)

### Kelompok hover-only / dekoratif → Magnetic Button, Cursor Trail, Pointer Tooltip, Orbital Menu, Contextual Dock, Inertial Dial, Elastic Lasso, Like Burst, Swatch-ring
- Levio **mobile-first**; hover tidak ada di sentuh &gt; mayoritas pengguna tidak pernah melihatnya (dead code).
- Aplikasi belajar butuh fokus & tenang; efek "mengejar kursor" menambah noise kognitif dan mengalihkan dari konten. Fungsinya "wow", bukan membantu belajar.
- Celebration sudah ditangani `Confetti`; *like burst* tidak relevan (tanpa fitur sosial).

### Kelompok tabrakan gaya visual → Push Button 3D, Keycap, rubber/3D edge
- Desain Levio **flat**: stone gelap + teal, bayangan halus, tekan 1px (`translate-y-px`). Shadow 3D "bottom edge" memperkenalkan bahasa visual kedua yang skeuomorphic — terasa game-y dan tidak konsisten. Konsistensi visual &gt; kebaruan.

### Kelompok konflik model interaksi → Hold-to-Confirm, Slide-to-Unlock, Reorderable List
- Hold & geser punya **biaya aksesibilitas** (motorik, discoverability) dan melawan pola confirm-dialog (reset/delete data) yang sudah mapan & jelas untuk semua umur. Reset data adalah aksi destruktif → dialog 2-langkah eksplisit lebih aman.
- `sentence-builder` memakai tap-to-place; drag-reorder menambah risiko salah geser saat latihan. Tap lebih sederhana & sudah jalan.

### Kelompok tak ada fiturnya → PIN Input, Password Meter, Star Rating, Tag Input, Rotary Knob, Slider, Value Scrubber, Expanding Search, Copy Button, Swipe-to-Reveal
- Tidak ada autentikasi OTP, password, rating, input tag bebas (tag otot sudah pill preset), slider, atau pencarian ringkas. Menambah motion tanpa fitur = *premature*. (Copy Button layak **nanti** bila daftar kata butuh "salin kata".)

### Kelompok mahal/caveat → Card Resize (height spring), Expanding Search
- Animasi `height`/`max-height` tetap rawan layout thrash; prefer efek berbasis `transform`. Bila dipakai (accordion), batasi konten pendek.

## Keputusan token CSS (kandang)

Ditambahkan ke `@theme` (`app/globals.css`):

```css
--animate-toast-in:    toast-in  520ms cubic-bezier(0.18, 1.25, 0.4, 1) both;
--animate-toast-out:   toast-out 200ms ease-in both;
--animate-count-bump:  count-bump 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
```

Untuk Squish Button ditambahkan util CSS biasa (bukan token): `.btn-squish`
(asimetris: `:active` durasi 0.08s + scale 0.97, kembali 0.5s spring). Util
unlayered agar menang atas `transition-colors` Tailwind pada tombol.

Plus guard reduced-motion global (nonaktifkan semua animasi/transisi).

## anime.js — kapan boleh keluar dari CSS

CSS keyframe tetap **default** di Levio. anime.js (v4, `animate`/`stagger`)
dipakai hanya bila efeknya tidak bisa diekspresikan satu keyframe, yaitu saat
tiap elemen butuh nilai & timing sendiri.

### ✅ Dipakai — `components/confetti.tsx` (Unreleased)

Keyframe `confetti-fall` lama membuat semua kepingan jatuh **lurus, linear,
putaran seragam** — beda antar kepingan hanya `left`, `delay`, dan `duration`
lewat inline style. Sekarang tiap kepingan punya:

- **gravitasi** — `y` dengan `ease: "in(1.7)"` (makin ke bawah makin cepat),
- **drift** menyamping acak (`x`, `ease: "inOut(2)"`) seperti kertas ketiup angin,
- **spin** 1–3 putaran, arah acak,
- `scale` pop-in `out(4)` + `delay: stagger(25, { from: "center" })`.

Token `--animate-confetti` dan keyframe `confetti-fall` dihapus dari
`app/globals.css` (sudah tak terpakai).

> ⚠️ **Guard reduced-motion wajib manual.** Guard global di `globals.css` hanya
> menyentuh `animation-duration`/`transition-duration` CSS — animasi JS
> **melewatinya**. Pola di `confetti.tsx`: container di-render
> `visibility: hidden`, dan efek baru men-set `visible` setelah
> `matchMedia("(prefers-reduced-motion: reduce)")` dicek. Saat reduce, tak ada
> animasi yang dijalankan sama sekali. Setiap pemakaian anime.js berikutnya
> **harus** mengulang guard ini.

Cleanup: simpan hasil `animate()` lalu `animation.revert()` di cleanup
`useEffect` — mengembalikan style inline dan membatalkan animasi saat unmount.

### ✅ Dipakai — `components/badge-grid.tsx` (Unreleased)

Grid penghargaan di `/profile` sebelumnya statis: semua kartu muncul sekaligus
dan bar progres tergambar lewat `style.width` tanpa transisi. Sekarang:

- **reveal bertahap** — `delay: stagger(38, { grid: [cols, rows], from: "center" })`.
  Jumlah kolom (2/3/4) tergantung breakpoint, jadi delay tiap kartu **hanya bisa
  dihitung saat runtime** dari posisi grid sebenarnya (`countColumns()` membaca
  `offsetTop`). Satu keyframe CSS tidak bisa mengekspresikan delay yang
  bergantung baris+kolom.
- **bar per badge** — `scaleX` ke rasio masing-masing dengan **durasi sendiri**
  (`420ms + rasio × 520ms`) supaya kecepatan isian terasa seragam antar badge.
  `scaleX` + `transform-origin: left`, bukan `width` (GPU-composited, prinsip #4).

Urutan kartu juga diubah: yang sudah diraih dulu, sisanya diurut dari yang
paling dekat terbuka — badge "tinggal sedikit lagi" terlihat tanpa scroll penuh.

> ⚠️ Guard reduced-motion sama seperti confetti, tapi **kebalikannya**: confetti
> murni dekorasi jadi saat reduce tidak dirender sama sekali; badge adalah
> konten, jadi saat reduce kartu langsung dipasang ke keadaan akhir
> (`opacity: 1`, `scaleX(rasio)`) tanpa animasi. Cleanup `revert()` diikuti
> pemulihan `opacity: 1` agar kartu tidak tertinggal tersembunyi saat remount.

### ❌ Tidak dipindah ke anime.js
`sliding-tabs`, `progress-bar`, `progress-ring`, `pop`/`shake`, `toast`,
`count-bump` — semua sudah murni `transform`/`opacity` dengan satu kurva
seragam. Memindahkannya ke JS menambah kerja main-thread tanpa tambahan
ekspresi, dan melepaskan guard reduced-motion gratis dari CSS.

### 🔜 Kandidat berikutnya (belum dikerjakan)
- **Stroke order kana** (`kana-trace.tsx`) — `svg.createDrawable` untuk
  menganimasikan urutan coretan sebelum user menelusuri. Nilai belajar tertinggi;
  terhambat karena belum ada data path SVG per kana.
- **Timeline layar hasil** (`mock-test.tsx`) — `createTimeline()` untuk
  mengurutkan ring → count-up skor → confetti.
- **Stagger masuk** untuk daftar (leaderboard, word-list) — `stagger(40)`.

## Referensi
- Kinetics: <https://kinetics.colorion.co/> — pustaka spring + copy-paste CSS/React/prompt.
- anime.js: <https://animejs.com/documentation> — v4 ESM (`animate`, `stagger`, `spring`, `svg`).
- Kode: `docs/motion.md` (ini), `components/toast.tsx`, `components/sliding-tabs.tsx`, `components/spring-counter.tsx`, `components/confetti.tsx`.