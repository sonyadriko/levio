"use client";

import { useEffect } from "react";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { useGym } from "@/components/gym/use-gym";
import { todayKey } from "@/lib/date";
import { todayStatus } from "@/lib/habits";
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
//  - masih ada aktivitas yang belum dikerjakan hari ini (belajar / gym).
export function DailyReminder() {
  const { progress } = useProgress();
  const { t } = useLanguage();
  const { gym } = useGym();

  useEffect(() => {
    if (!canNotify()) return;
    if (Notification.permission !== "granted") return;

    const check = () => {
      const settings = loadReminder();
      if (!settings.enabled) return;
      if (!isPastTime(settings.time)) return;
      if (settings.lastSentKey === todayKey()) return;

      const { studied, workedOut } = todayStatus(progress, gym);
      if (studied && workedOut) return;

      const body = workedOut
        ? t("reminder.studyNotifyBody")
        : studied
          ? t("reminder.gymNotifyBody")
          : t("reminder.notifyBody");
      const reminder = new Notification(t("reminder.notifyTitle"), { body });
      reminder.onclick = () => {
        window.focus();
        reminder.close();
      };
      saveReminder({ ...settings, lastSentKey: todayKey() });
    };

    check();
    const interval = window.setInterval(check, 60_000);
    return () => window.clearInterval(interval);
  }, [progress, gym, t]);

  return null;
}
