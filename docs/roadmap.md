# Roadmap — Levio

Daftar pengembangan yang direncanakan. Item selesai ditandai, sisanya draft
dengan scope ringkas. Rincian pola menambah modul: [`modules.md`](./modules.md).

## Status per rilis

| Rilis | Isi | Status |
|---|---|---|
| v0.10.0 | Gym V2: database latihan, grafik progress, rest timer | ✅ rilis |
| v0.11.0 | Gym cloud sync, program multi-minggu, streak gabungan belajar+gym, domain `levio.space` | ✅ rilis |
| v0.12.0 (next) | — (belum ditentukan) | 🕓 |
| v4.x | Modul Financial Planner | 🕓 draft |

## Selesai

- **Gym V2 lengkap (v0.9.0–v0.11.0):** sesi + template, database 56 latihan,
  grafik progress (1RM/beban/volume), rest timer, item gym di Daily Checklist,
  sync cloud (Supabase), program multi-minggu (PPL 4 pekan) dengan target
  set/reps, streak gabungan belajar+gym, domain produksi `levio.space`.
- **Learn core (sebelum v0.9.0):** HSK 1–6, SRS, mock test, practice, PWA.

## Draft: Modul Financial Planner (v4)

Rencana untuk membawa "Financial Planner" ke Levio — terinspirasi template
**Loka Journey Financial Planner** yang dipakai saat ini, dibangun sebagai modul
native (bukan spreadsheet).

### Tujuan

Ganti/dukung spreadsheet manual dengan planner keuangan bulanan yang:
- mencatat **pemasukan** & **pengeluaran** dengan kategori,
- mengalokasikan **budget per kategori** dan menampilkan **sisa budget**,
- menetapkan **target (financial goals)** dan memantau progresnya,
- memberi **analitik & tren** pengeluaran antar bulan,
- memberi **saran alokasi** ("perencanaan pintar") berdasarkan pemasukan.

### Model data (draf)

Pola mengikuti `lib/gym/` + sync cloud (localStorage + Supabase).

```ts
type TxKind = "income" | "spending" | "savings" | "bill" | "goal";

interface TxCategory {
  id: string;
  nameKey: string;        // i18n id+en
  kind: TxKind;
  isSystem?: boolean;     // kategori bawaan (seperti Loka Journey)
}

interface BudgetAllocation {
  categoryId: string;
  amount: number;         // budget bulanan per kategori
}

interface Transaction {
  id: string;
  date: string;           // "YYYY-MM-DD"
  categoryId: string;
  amount: number;
  note?: string;
}

interface FinancialGoal {
  id: string;
  nameKey: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string;      // "YYYY-MM" opsional
}

interface FinancialState {
  transactions: Transaction[];
  allocations: Record<string /* YYYY-MM */, BudgetAllocation[]>;
  goals: FinancialGoal[];
}
```

Kategori bawaan (dari template Loka Journey):
- **Income:** Gaji, Bonus, Freelance, Refund, Pembayaran Piutang
- **Savings/Invest:** Tabungan, Dana Darurat
- **Spending:** Makan/minum, Transport, Komunikasi & Internet, Kebutuhan Pribadi,
  Hiburan & Sosial, Keluarga & Sosial, Kesehatan, Lainnya
- **Goals:** Dana Pendidikan, dst.
- **Bills:** langganan tetap (Youtube, dst.)

### UI (draf)

- `/finance` — dashboard bulan berjalan: ringkasan masuk/keluar/sisa, bar
  alokasi vs realisasi per kategori, progres goals.
- `/finance/transactions` — daftar + tambah/edit/hapus transaksi (filter bulan,
  kategori, pencarian).
- `/finance/budget` — set budget per kategori per bulan.
- `/finance/goals` — target tabungan + progres.
- `/finance/stats` — tren pengeluaran antar bulan (bar chart, reuse pola
  `StatsDashboard` / `exercise-chart`), komposisi per kategori.

### Perencanaan pintar (draf)

- Aturan 50/30/20 (kebutuhan/keinginan/tabungan) sebagai baseline saran alokasi.
- Usulan alokasi bulanan dari pemasukan rata-rata, dapat ditimpa manual.
- Peringatan bila realisasi melebihi budget kategori.

### Integrasi

- XP/streak: (opsional) transaksi tercatat memberi XP harian seperti sesi gym —
  keputusan diimplementasi.
- Daily Checklist: (opsional) task "Catat keuangan hari ini".
- Sync cloud: tabel `financial_transactions`, `financial_allocations`,
  `financial_goals` + RLS per-user (pola migration 0006).
- i18n id+en untuk semua label.

### Catatan pembuka (open questions)

- Apakah data keuangan perlu perlindungan ekstra (di luar RLS biasa)?
- Apakah mendukung import CSV dari spreadsheet Loka Journey?
- Apakah analitik pakai XP/streak atau sepenuhnya terpisah dari learning?

## Prinsip pengembangan

- Semua perubahan lewat flow wajib: branch → PR → CI (lint → test → build) → merge.
- Logic murni di `lib/`, UI client di `components/`, halaman di `app/`.
- Setiap teks baru di kedua kamus i18n (`id` + `en`).
- Responsive: mobile (bottom nav) & desktop (sidebar).
