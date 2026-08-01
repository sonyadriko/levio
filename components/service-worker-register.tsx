"use client";

import { useEffect } from "react";

// Daftarkan service worker untuk dukungan offline (PWA). Precache dijalankan
// sekali; navigasi memakai network-first dengan fallback cache.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // abaikan — mode offline / dev.
    });
  }, []);

  return null;
}
