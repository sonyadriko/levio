import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_TEXT_LENGTH = 200;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_CACHE_ENTRIES = 5000;

const audioCache = new Map<string, { buf: ArrayBuffer; added: number }>();

export async function GET(request: NextRequest) {
  const text = request.nextUrl.searchParams.get("text") ?? "";
  const lang = request.nextUrl.searchParams.get("tl") ?? "zh-CN";

  if (!text || text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: "text missing or too long" },
      { status: 400 },
    );
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
