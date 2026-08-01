# Kontribusi — Levio

Terima kasih sudah mau berkontribusi! Panduan singkat ini memastikan perubahanmu konsisten dengan project.

## Setup

```bash
npm install
npm run dev
```

## Sebelum Mulai

Baca dulu:

- [`README.md`](../README.md) — gambaran project & script
- [`docs/ARCHITECTURE.md`](./ARCHITECTURE.md) — struktur & prinsip kode
- [`PLAN.md`](../PLAN.md) — roadmap produk
- [`docs/modules.md`](./modules.md) — pola menambah modul

> ⚠️ Project memakai **Next.js 16** yang punya breaking changes vs versi lama. Baca dokumentasi di `node_modules/next/dist/docs/` sebelum menulis kode Next.js.

## Aturan

1. **Tulis logika murni di `lib/`** (tanpa DOM/React) agar bisa diuji & dipakai di server/client.
2. **Server Component default.** Gunakan `"use client"` hanya untuk interaktivitas.
3. **Data tidak boleh di-hardcode di komponen** — taruh di `lib/<domain>/data.ts`.
4. **Tanpa komentar kode** kecuali diperlukan untuk kejelasan data/kontrak (ikuti gaya file yang ada).
5. **Jangan gunakan dependensi baru** tanpa diskusi; project sengaja minim dependensi.
6. **Pola responsive mobile-first**: pastikan UI berfungsi di layar kecil (bottom nav) dan desktop (sidebar).

## Menambah Kosakata HSK

Baca [`docs/hsk-curriculum.md`](./hsk-curriculum.md). Poin penting: ID unik, pinyin dengan tanda nada, arti Bahasa Indonesia, jangan duplikat.

## Verifikasi

Jalankan semua sebelum mengirim perubahan:

```bash
npm run lint
npm run build
```

Wajib lolos tanpa error.

## Rilis & Versioning

Versi mengikuti **SemVer** (`MAJOR.MINOR.PATCH`). Sumber tunggal: `package.json`.

- **MAJOR** — perubahan tidak kompatibel.
- **MINOR** — fitur baru (kompatibel).
- **PATCH** — perbaikan bug.

Alur rilis:

1. Bump `version` di `package.json` **dan** `APP_VERSION` di `lib/version.ts`.
2. Tambah entri di `CHANGELOG.md` (terbaru di atas) + highlight singkat di
   `RELEASE_NOTES` (`lib/version.ts`) dengan kunci i18n `id` + `en`.
3. Commit dengan pesan `release: vX.Y.Z`.

> Setiap fitur/update juga wajib memperbarui dokumen yang terdampak
> (README, `docs/*.md`, PLAN) — lihat aturan di README.

## Commit

- Pesan commit ringkas, deskriptif, sesuai gaya riwayat project.
- Jangan commit `.env.local` (sudah di-ignore; `.env.example` boleh ikut).
