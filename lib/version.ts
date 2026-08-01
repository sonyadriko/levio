export const APP_VERSION = "0.5.0";

export interface ReleaseNote {
  version: string;
  date: string;
  highlightKeys: string[];
}

// Riwayat rilis singkat untuk ditampilkan di aplikasi (Profil → "Yang Baru").
// Urutan: terbaru di atas. Detail lengkap ada di CHANGELOG.md.
export const RELEASE_NOTES: ReleaseNote[] = [
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
