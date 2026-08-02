import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const OTP_TYPES = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
] as const;

// Hanya izinkan redirect internal (path relatif di origin yang sama) untuk
// mencegah open redirect bila parameter `next` dimanipulasi.
function safeNext(raw: string | null): string {
  if (!raw) return "/profile";
  if (!raw.startsWith("/")) return "/profile";
  if (raw.startsWith("//") || raw.includes("://") || raw.includes("\\")) {
    return "/profile";
  }
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const next = safeNext(searchParams.get("next"));
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  const supabase = await getSupabaseServerClient();

  if (supabase) {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    } else if (
      tokenHash &&
      type &&
      (OTP_TYPES as readonly string[]).includes(type)
    ) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as (typeof OTP_TYPES)[number],
      });
      if (!error) {
        // Tautan recovery membuka halaman khusus untuk memasang kata sandi baru.
        const target = type === "recovery" ? "/auth/reset-password" : next;
        return NextResponse.redirect(`${origin}${target}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/profile?auth=error`);
}
