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
| Accordion Spring | `<details>` log gym & "Yang Baru" (belum dianimasi) | `cubic-bezier(0.16,1,0.3,1)` + chevron `(0.34,1.56,0.64,1)` | Chevron putar-spring + body glide membuat expand/collapse hidup; `details` native tetap dapat keyboard/focus. **Catatan:** batasi konten pendek agar tak layout thrash. |
| Squish Button | tombol aksi utama ("Periksa"/"Selanjutnya") | cepat `0.08s` turun, pegas `0.5s` kembali | Tekan terasa fisik; mensampling `active:scale` saat ini. Asimetris (turun cepat, pulang bouncy) = kunci terasa responsif. |
| Choice Chips | pill filter mode/tag otot | `(0.34,1.56,0.64,1)` | Sudah sejalan `animate-pop`; tinggal konsisten. |
| Quantity Stepper | target harian di profil | value bump `(0.34,1.56,0.64,1)` + `tabular-nums` | Digit tidak "menari" saat berubah. |

> "Sudah diadopsi" pada langkah pertama: **Toast**, **Tab Pill**, **Number bump**
> (3 item implementasi). Sisanya ditandai untuk langkah berikut bila relevan.

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

Plus guard reduced-motion global (nonaktifkan semua animasi/transisi).

## Referensi
- Kinetics: <https://kinetics.colorion.co/> — pustaka spring + copy-paste CSS/React/prompt.
- Kode: `docs/motion.md` (ini), `components/toast.tsx`, `components/sliding-tabs.tsx`, `components/spring-counter.tsx`.