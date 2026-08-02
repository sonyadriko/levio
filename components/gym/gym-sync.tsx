"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  getGymSnapshot,
  setGymSnapshot,
  useGym,
} from "@/components/gym/use-gym";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  hasCloudGymData,
  hasLocalGymData,
  pullGym,
  pushGym,
} from "@/lib/supabase/sync";
import { mergeGym } from "@/lib/gym";

// Sinkronisasi gym ke cloud — dipasang di AppShell (selalu hidup). Mirip
// progress-provider: pull + merge saat login, push debounce saat berubah.
export function GymSync() {
  const { user } = useAuth();
  const { gym } = useGym();
  const pullDone = useRef(false);
  const [pullDoneCount, setPullDoneCount] = useState(0);

  // Muat dari cloud saat login; migrasi data lokal kalau cloud masih kosong.
  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;
    let cancelled = false;
    pullDone.current = false;
    const localAtStart = getGymSnapshot();

    (async () => {
      try {
        const cloud = await pullGym(client, userId);
        if (cancelled) return;

        if (cloud && hasCloudGymData(cloud)) {
          // Jangan timpa aktivitas lokal yang terjadi selama pull berjalan.
          if (!cancelled && getGymSnapshot() === localAtStart) {
            const local = getGymSnapshot();
            setGymSnapshot(
              hasLocalGymData(local) ? mergeGym(local, cloud) : cloud,
            );
          }
        } else if (hasLocalGymData(getGymSnapshot())) {
          await pushGym(client, userId, getGymSnapshot());
        }
        if (!cancelled) {
          pullDone.current = true;
          setPullDoneCount((count) => count + 1);
        }
      } catch {
        // Pull gagal (jaringan/RLS) → biarkan push dimatikan agar data lokal
        // yang stale tidak menimpa data cloud.
      }
    })();

    return () => {
      cancelled = true;
      pullDone.current = false;
    };
  }, [user?.id]);

  // Sinkronkan perubahan gym ke cloud saat login (debounce). `pullDoneCount`
  // membuat efek ini berjalan ulang begitu pull selesai.
  useEffect(() => {
    const userId = user?.id;
    if (!userId || !pullDone.current) return;
    const client = getSupabaseBrowserClient();
    if (!client) return;

    const timeout = window.setTimeout(() => {
      if (hasLocalGymData(gym)) {
        void pushGym(client, userId, gym);
      }
    }, 600);

    return () => window.clearTimeout(timeout);
  }, [gym, user?.id, pullDoneCount]);

  return null;
}
