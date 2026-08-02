import path from "node:path";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Host Supabase untuk `connect-src` (dipasang di browser client).
let supabaseHost = "";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
if (supabaseUrl) {
  try {
    supabaseHost = new URL(supabaseUrl).host;
  } catch {
    supabaseHost = "";
  }
}

const cspParts = [
  "default-src 'self'",
  // 'unsafe-inline' diperlukan karena Next.js menanamkan skrip inline RSC
  // (self.__next_f.push). 'unsafe-eval' hanya untuk dev (React devtools).
  // Untuk CSP ketat tanpa 'unsafe-inline' (nonce), lihat docs/:
  // node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self'" +
    (supabaseHost
      ? ` https://${supabaseHost} wss://${supabaseHost}`
      : ""),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
];
const contentSecurityPolicy = cspParts.join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  devIndicators: false,
  experimental: {
    viewTransition: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // HSTS hanya bermakna di produksi (HTTPS).
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]),
        ],
      },
    ];
  },
};

export default nextConfig;
