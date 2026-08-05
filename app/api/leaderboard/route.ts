import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { LeaderboardRow } from "@/lib/leaderboard";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  const client = await getSupabaseServerClient();
  if (!client) {
    return NextResponse.json({ enabled: false, error: false, rows: [] });
  }

  const { data, error } = await client.rpc("get_weekly_leaderboard");
  if (error) {
    return NextResponse.json(
      { enabled: true, error: true, rows: [] },
      { status: 502 },
    );
  }

  return NextResponse.json({
    enabled: true,
    error: false,
    rows: (data ?? []) as LeaderboardRow[],
  });
}
