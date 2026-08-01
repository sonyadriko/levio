"use client";

import { useEffect } from "react";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { todayKey } from "@/lib/date";
import {
  canNotify,
  isPastTime,
  loadReminder,
  saveReminder,
} from "@/lib/reminder";

// Mesin pengingat: dipasang di AppShell (selalu hidup saat aplikasi terbuka).
// Menampilkan notifikasi web hanya jika:
//  - user mengaktifkan pengingat & mengizinkan notifikasi,
//  - sudah lewat jam pengingat,
//  - belum pernah dikirim hari ini,
//  - user belum belajar apa pun hari ini.
export function DailyReminder() {
  const { progress } = useProgress();
  const { t } = useLanguage();

  useEffect(() => {
    if (!canNotify()) return;
    if (Notification.permission !== "granted") return;

    const check = () => {
      const settings = loadReminder();
      if (!settings.enabled) return;
      if (!isPastTime(settings.time)) return;
      if (settings.lastSentKey === todayKey()) return;
      if (progress.activityByDate[todayKey()]) return;

      const reminder = new Notification(t("reminder.notifyTitle"), {
        body: t("reminder.notifyBody"),
      });
      reminder.onclick = () => {
        window.focus();
        reminder.close();
      };
      saveReminder({ ...settings, lastSentKey: todayKey() });
    };

    check();
    const interval = window.setInterval(check, 60_000);
    return () => window.clearInterval(interval);
  }, [progress.activityByDate, t]);

  return null;
}
