import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 200;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 5000;

// Rate limit per IP (token bucket sederhana) agar endpoint tidak dipakai
// sebagai proxy sintesis gratis / korban banjir request.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 60;
const MAX_IP_BUCKETS = 10_000;

// Whitelist bahasa yang benar-benar dipakai aplikasi.
const ALLOWED_LANGS = new Set(["zh-CN", "en", "id"]);

const audioCache = new Map<string, { buf: ArrayBuffer; added: number }>();
const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) return true;

  // Bersihkan bucket lama bila peta membesar, agar memori tidak bocor.
  if (ipBuckets.size > MAX_IP_BUCKETS) {
    for (const [key, value] of ipBuckets) {
      if (now >= value.resetAt) ipBuckets.delete(key);
    }
  }
  return false;
}

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text") ?? "";
  const lang = request.nextUrl.searchParams.get("tl") ?? "zh-CN";

  if (!ALLOWED_LANGS.has(lang)) {
    return NextResponse.json(
      { error: "unsupported language" },
      { status: 400 },
    );
  }

  if (!text || text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "text missing or too long" },
      { status: 400 },
    );
  }

  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json({ error: "rate limited" }, { status: 429 });
  }

  const key = `${lang}:${text}`;
  const hit = audioCache.get(key);
  if (hit && Date.now() - hit.added < CACHE_TTL_MS) {
    return new NextResponse(hit.buf, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=604800",
      },
    });
  }

  const upstreamUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(
    lang,
  )}&q=${encodeURIComponent(text)}`;

  let res: Response;
  try {
    res = await fetch(upstreamUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Levio/1.0)",
        Referer: "https://translate.google.com",
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ error: "tts upstream unreachable" }, { status: 502 });
  }

  if (!res.ok) {
    return NextResponse.json({ error: "tts upstream error" }, { status: 502 });
  }

  const buf = await res.arrayBuffer();
  if (audioCache.size > MAX_CACHE_ENTRIES) audioCache.clear();
  audioCache.set(key, { buf, added: Date.now() });

  return new NextResponse(buf, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "audio/mpeg",
      "Cache-Control": "public, max-age=604800",
    },
  });
}
