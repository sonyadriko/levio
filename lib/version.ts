export const APP_VERSION = "0.14.0";

export interface ReleaseNote {
  version: string;
  date: string;
  highlightKeys: string[];
}

// Riwayat rilis singkat untuk ditampilkan di aplikasi (Profil → "Yang Baru").
// Urutan: terbaru di atas. Detail lengkap ada di CHANGELOG.md.
export const RELEASE_NOTES: ReleaseNote[] = [
  {
    version: "0.14.0",
    date: "2026-08-03",
    highlightKeys: [
      "release.0.14.0.h1",
      "release.0.14.0.h2",
    ],
  },
  {
    version: "0.13.0",
    date: "2026-08-03",
    highlightKeys: [
      "release.0.13.0.h1",
      "release.0.13.0.h2",
    ],
  },
  {
    version: "0.12.1",
    date: "2026-08-03",
    highlightKeys: [
      "release.0.12.1.h1",
      "release.0.12.1.h2",
      "release.0.12.1.h3",
    ],
  },
  {
    version: "0.12.0",
    date: "2026-08-03",
    highlightKeys: [
      "release.0.12.0.h1",
      "release.0.12.0.h2",
      "release.0.12.0.h3",
    ],
  },
  {
    version: "0.11.0",
    date: "2026-08-03",
    highlightKeys: [
      "release.0.11.0.h1",
      "release.0.11.0.h2",
      "release.0.11.0.h3",
    ],
  },
  {
    version: "0.10.0",
    date: "2026-08-02",
    highlightKeys: [
      "release.0.10.0.h1",
      "release.0.10.0.h2",
    ],
  },
  {
    version: "0.9.0",
    date: "2026-08-02",
    highlightKeys: [
      "release.0.9.0.h1",
      "release.0.9.0.h2",
    ],
  },
  {
    version: "0.8.0",
    date: "2026-08-02",
    highlightKeys: [
      "release.0.8.0.h1",
      "release.0.8.0.h2",
    ],
  },
  {
    version: "0.7.0",
    date: "2026-08-02",
    highlightKeys: [
      "release.0.7.0.h1",
      "release.0.7.0.h2",
    ],
  },
  {
    version: "0.6.0",
    date: "2026-08-02",
    highlightKeys: [
      "release.0.6.0.h1",
      "release.0.6.0.h2",
    ],
  },
  {
    version: "0.5.0",
    date: "2026-08-01",
    highlightKeys: [
      "release.0.5.0.h1",
      "release.0.5.0.h2",
    ],
  },
  {
    version: "0.4.0",
    date: "2026-08-01",
    highlightKeys: [
      "release.0.4.0.h1",
    ],
  },
  {
    version: "0.3.0",
    date: "2026-08-01",
    highlightKeys: [
      "release.0.3.0.h1",
      "release.0.3.0.h2",
    ],
  },
  {
    version: "0.2.0",
    date: "2026-08-01",
    highlightKeys: [
      "release.0.2.0.h1",
      "release.0.2.0.h2",
      "release.0.2.0.h3",
      "release.0.2.0.h4",
      "release.0.2.0.h5",
    ],
  },
];

export function latestRelease(): ReleaseNote {
  return RELEASE_NOTES[0];
}
