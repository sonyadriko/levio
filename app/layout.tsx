import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";
import { ProgressProvider } from "@/components/progress-provider";
import { LanguageProvider } from "@/components/language-provider";
import { SettingsProvider } from "@/components/settings-provider";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Levio — Belajar HSK, Bahasa & Kesehatan",
  description:
    "Satu platform untuk semua rutinitas self-improvement: belajar HSK, bahasa lain, dan kesehatan.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf9f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a09" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var pairs=[["leveling.locale.v1","levio.locale.v1"],["leveling.settings.v1","levio.settings.v1"],["leveling.reminder.v1","levio.reminder.v1"],["leveling.progress.v1","levio.progress.v1"],["leveling.syncbanner.dismissed.v1","levio.syncbanner.dismissed.v1"]];for(var i=0;i<pairs.length;i++){var legacy=pairs[i][0],current=pairs[i][1];if(localStorage.getItem(current)===null){var value=localStorage.getItem(legacy);if(value!==null)localStorage.setItem(current,value);}}}catch(e){}
(function(){try{var raw=localStorage.getItem("levio.settings.v1");if(raw===null)raw=localStorage.getItem("leveling.settings.v1");var mode="auto";if(raw){var p=JSON.parse(raw);if(p&&(p.theme==="light"||p.theme==="dark"||p.theme==="auto"))mode=p.theme;}var dark=mode==="dark"||(mode==="auto"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.dataset.theme=dark?"dark":"light";}catch(e){document.documentElement.dataset.theme="light";}})();`,
          }}
        />
      </head>
      <body className="min-h-full">
        <ServiceWorkerRegister />
        <AuthProvider>
          <ProgressProvider>
            <LanguageProvider>
              <SettingsProvider>
                <AppShell>{children}</AppShell>
              </SettingsProvider>
            </LanguageProvider>
          </ProgressProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
