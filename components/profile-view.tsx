"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth, type AuthResult } from "@/components/auth-provider";
import { useProgress } from "@/components/progress-provider";
import { useLanguage } from "@/components/language-provider";
import { useSettings } from "@/components/settings-provider";
import { Icon } from "@/components/icons";
import { StatCard } from "@/components/stat-card";
import { ReminderCard } from "@/components/reminder-card";
import { todayKey } from "@/lib/date";
import { XP_PER_LEVEL } from "@/lib/progress";
import { summarize, totalsToday } from "@/lib/stats";
import { getBadges } from "@/lib/badges";
import { APP_VERSION, latestRelease } from "@/lib/version";
import type { Locale } from "@/lib/i18n";

const LANGUAGE_OPTIONS: { locale: Locale; labelKey: string }[] = [
  { locale: "id", labelKey: "profile.langId" },
  { locale: "en", labelKey: "profile.langEn" },
];

function TargetStepper({
  label,
  value,
  onChange,
  min = 1,
  max = 100,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  const step = (direction: number) => {
    const next = value + direction;
    if (next >= min && next <= max) onChange(next);
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-950">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${label} −1`}
          onClick={() => step(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 text-lg font-bold text-stone-600 transition-colors hover:bg-stone-200 active:scale-90 dark:bg-stone-800 dark:text-stone-300 dark:hover:bg-stone-700"
        >
          −
        </button>
        <span className="w-10 text-center text-sm font-bold tabular-nums">
          {value}
        </span>
        <button
          type="button"
          aria-label={`${label} +1`}
          onClick={() => step(1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-lg font-bold text-white transition-colors hover:bg-teal-800 active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ProfileView() {
  const { user, ready, configured, signIn, signUp, signInWithGoogle, resetPassword, signOut } = useAuth();
  const { progress, resetProgress, importProgress } = useProgress();
  const { locale, setLocale, t } = useLanguage();
  const { settings, setName, setDailyTargets } = useSettings();
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const noticeTimer = useRef<number | null>(null);

  const summary = useMemo(() => summarize(progress), [progress]);
  const today = useMemo(() => totalsToday(progress.activityByDate), [progress]);
  const badges = useMemo(() => getBadges(progress), [progress]);
  const level = Math.floor(progress.xp / XP_PER_LEVEL) + 1;
  const initial = (settings.name.trim() || "L").slice(0, 1).toUpperCase();

  const showNotice = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      setNotice({ message, tone });
      if (noticeTimer.current !== null) window.clearTimeout(noticeTimer.current);
      noticeTimer.current = window.setTimeout(() => {
        setNotice(null);
        noticeTimer.current = null;
      }, 3000);
    },
    [],
  );

  const exportData = () => {
    const blob = new Blob([JSON.stringify(progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `levio-progress-${todayKey()}.json`;
    // Safari/iOS butuh link yang sudah ada di DOM agar click() memicu download.
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showNotice("profile.exported");
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text) as unknown;
      const ok = await importProgress(data);
      showNotice(
        ok ? "profile.imported" : "profile.importFailed",
        ok ? "success" : "error",
      );
    } catch {
      showNotice("profile.importFailed", "error");
    }
  };

  const handleReset = async () => {
    const ok = await resetProgress();
    setConfirmingReset(false);
    showNotice(
      ok ? "profile.resetDone" : "profile.resetFailed",
      ok ? "success" : "error",
    );
  };

  if (!configured) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-500/10 dark:text-amber-400">
          <Icon name="check" className="h-4 w-4 shrink-0" />
          {t("auth.offline")}
        </div>
        <ProfileSections
          t={t}
          settings={settings}
          setName={setName}
          setDailyTargets={setDailyTargets}
          locale={locale}
          setLocale={setLocale}
          summary={summary}
          today={today}
          level={level}
          xp={progress.xp}
          initial={initial}
          badges={badges}
          confirmingReset={confirmingReset}
          setConfirmingReset={setConfirmingReset}
          notice={notice}
          exportData={exportData}
          handleImport={handleImport}
          handleReset={handleReset}
          fileRef={fileRef}
        />
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-28 animate-pulse rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950" />
        <div className="h-40 animate-pulse rounded-2xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <AuthCard
          t={t}
          signIn={signIn}
          signUp={signUp}
          signInWithGoogle={signInWithGoogle}
          resetPassword={resetPassword}
        />
        <ProfilePreviewPlaceholder t={t} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Icon name="check" className="h-4 w-4" />
          </span>
          <p className="truncate text-sm text-stone-600 dark:text-stone-300">
            {t("auth.signedIn", { email: user.email ?? "" })}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="shrink-0 rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 active:scale-[0.97] dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          {t("auth.signOut")}
        </button>
      </div>

      <ProfileSections
        t={t}
        settings={settings}
        setName={setName}
        setDailyTargets={setDailyTargets}
        locale={locale}
        setLocale={setLocale}
        summary={summary}
        today={today}
        level={level}
        xp={progress.xp}
        initial={initial}
        badges={badges}
        confirmingReset={confirmingReset}
        setConfirmingReset={setConfirmingReset}
        notice={notice}
        exportData={exportData}
        handleImport={handleImport}
        handleReset={handleReset}
        fileRef={fileRef}
      />
    </div>
  );
}

function AuthCard({
  t,
  signIn,
  signUp,
  signInWithGoogle,
  resetPassword,
}: {
  t: (key: string, vars?: Record<string, string | number>) => string;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  resetPassword: (email: string) => Promise<AuthResult>;
}) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // AuthCard hanya dipasang di sisi klien (setelah `ready`), jadi window aman
  // diakses dari initializer.
  const [error, setError] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("auth") === "error"
      ? "auth.errorLink"
      : null;
  });
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("auth") === "error") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSubmitting(true);
    if (mode === "forgot") {
      const result = await resetPassword(email);
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error ?? "auth.errorNetwork");
        return;
      }
      setNotice("auth.resetSent");
      setPassword("");
      return;
    }
    const result =
      mode === "login"
        ? await signIn(email, password)
        : await signUp(email, password);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "auth.errorNetwork");
      return;
    }
    if (result.needsConfirmation) {
      setNotice("auth.checkEmail");
      setPassword("");
      return;
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    setNotice(null);
    setPassword("");
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 dark:border-stone-800 dark:bg-stone-950">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-700 text-xl font-bold text-white shadow-lg shadow-teal-700/20">
        L
      </span>
      <h2 className="mt-4 text-center text-lg font-bold tracking-tight">
        {t(mode === "forgot" ? "auth.resetTitle" : "auth.title")}
      </h2>
      <p className="mx-auto mt-1 max-w-sm text-center text-sm text-stone-500 dark:text-stone-400">
        {t(mode === "forgot" ? "auth.resetSubtitle" : "auth.subtitle")}
      </p>

      {mode !== "forgot" && (
        <div className="mx-auto mt-6 flex max-w-xs rounded-xl bg-stone-100 p-1 dark:bg-stone-800/70">
          <button
            type="button"
            onClick={() => mode !== "login" && switchMode()}
            className={`h-9 flex-1 rounded-lg text-sm font-semibold transition-colors ${
              mode === "login"
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-stone-100"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            {t("auth.loginTab")}
          </button>
          <button
            type="button"
            onClick={() => mode !== "register" && switchMode()}
            className={`h-9 flex-1 rounded-lg text-sm font-semibold transition-colors ${
              mode === "register"
                ? "bg-white text-stone-900 shadow-sm dark:bg-stone-900 dark:text-stone-100"
                : "text-stone-500 dark:text-stone-400"
            }`}
          >
            {t("auth.registerTab")}
          </button>
        </div>
      )}

      {mode !== "forgot" && (
        <button
          type="button"
          disabled={googleSubmitting}
          onClick={async () => {
            setError(null);
            setNotice(null);
            setGoogleSubmitting(true);
            const result = await signInWithGoogle();
            setGoogleSubmitting(false);
            if (!result.ok) setError(result.error ?? "auth.errorNetwork");
          }}
          className="mx-auto mt-5 flex h-12 w-full max-w-xs items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-700 shadow-sm transition-colors hover:border-teal-300 hover:text-teal-700 active:scale-[0.97] disabled:opacity-60 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-teal-700 dark:hover:text-teal-300"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.43.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.97 10.97 0 0 0 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
            />
          </svg>
          {googleSubmitting ? "…" : t("auth.signInGoogle")}
        </button>
      )}

      {mode !== "forgot" && (
        <div className="mx-auto mt-5 flex max-w-xs items-center gap-3">
          <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
          <span className="text-xs text-stone-400">{t("auth.or")}</span>
          <span className="h-px flex-1 bg-stone-200 dark:bg-stone-800" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="mx-auto mt-5 flex max-w-xs flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            {t("auth.email")}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none transition-colors focus:border-teal-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
          />
        </label>
        {mode !== "forgot" && (
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {t("auth.password")}
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="h-11 rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none transition-colors focus:border-teal-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
            />
          </label>
        )}
        {mode === "register" && (
          <p className="text-xs text-stone-400">{t("auth.passwordHint")}</p>
        )}

        {error && (
          <p className="animate-slide-down rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
            {t(error)}
          </p>
        )}
        {notice && (
          <p className="animate-slide-down rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            {t(notice)}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-1 flex h-12 items-center justify-center rounded-xl bg-teal-700 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 transition-colors hover:bg-teal-800 active:scale-[0.97] disabled:opacity-60"
        >
          {submitting
            ? "…"
            : t(
                mode === "forgot"
                  ? "auth.sendReset"
                  : mode === "login"
                    ? "auth.submitLogin"
                    : "auth.submitRegister",
              )}
        </button>
      </form>

      {mode === "login" && (
        <p className="mt-3 text-center text-xs">
          <button
            type="button"
            onClick={() => {
              setMode("forgot");
              setError(null);
              setNotice(null);
            }}
            className="font-medium text-teal-700 hover:underline dark:text-teal-600"
          >
            {t("auth.forgotPassword")}
          </button>
        </p>
      )}

      <p className="mt-4 text-center text-xs text-stone-400">
        {mode === "forgot" ? (
          <>
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setNotice(null);
              }}
              className="font-semibold text-teal-700 hover:underline dark:text-teal-600"
            >
              {t("auth.backToLogin")}
            </button>
          </>
        ) : (
          <>
            {t(mode === "login" ? "auth.noAccount" : "auth.haveAccount")}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-teal-700 hover:underline dark:text-teal-600"
            >
              {t(mode === "login" ? "auth.registerTab" : "auth.loginTab")}
            </button>
          </>
        )}
      </p>
      <p className="mt-4 text-center text-xs text-stone-400">{t("auth.migrate")}</p>
    </div>
  );
}

function ProfilePreviewPlaceholder({
  t,
}: {
  t: (key: string, vars?: Record<string, string | number>) => string;
}) {
  const stats = [
    { labelKey: "stats.streak", icon: "flame" as const },
    { labelKey: "stats.bestStreak", icon: "flame" as const },
    { labelKey: "stats.mastered", icon: "book" as const },
    { labelKey: "stats.completedTests", icon: "chart" as const },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
            <Icon name="lock" className="h-5 w-5 text-stone-400" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">{t("profile.previewTitle")}</h3>
            <p className="text-xs text-stone-400">{t("profile.previewDesc")}</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.labelKey}
              className="rounded-xl border border-dashed border-stone-200 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40"
            >
              <Icon name={stat.icon} className="h-4 w-4 text-stone-300 dark:text-stone-600" />
              <p className="mt-2 text-lg font-bold text-stone-300 dark:text-stone-600">—</p>
              <p className="text-[11px] text-stone-400">{t(stat.labelKey)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("badge.title")}</h3>
          <span className="text-xs text-stone-400">0/10</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-stone-200 bg-stone-50/60 p-3 dark:border-stone-800 dark:bg-stone-900/40"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-100 dark:bg-stone-800">
                <Icon name="lock" className="h-4 w-4 text-stone-300 dark:text-stone-600" />
              </span>
              <span className="h-1.5 w-3/4 rounded-full bg-stone-200 dark:bg-stone-800" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">{t("profile.data")}</h3>
          <Icon name="lock" className="h-4 w-4 text-stone-300 dark:text-stone-600" />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[t("profile.export"), t("profile.import"), t("profile.reset"), t("profile.prefs")].map(
            (label) => (
              <div
                key={label}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-stone-200 bg-stone-50/60 text-sm font-semibold text-stone-300 dark:border-stone-800 dark:bg-stone-900/40 dark:text-stone-600"
              >
                <Icon name="lock" className="h-4 w-4" />
                {label}
              </div>
            ),
          )}
        </div>
        <p className="mt-3 text-center text-xs text-stone-400">
          {t("profile.previewCta")}
        </p>
      </div>
    </div>
  );
}

function ProfileSections({
  t,
  settings,
  setName,
  setDailyTargets,
  locale,
  setLocale,
  summary,
  today,
  level,
  xp,
  initial,
  badges,
  confirmingReset,
  setConfirmingReset,
  notice,
  exportData,
  handleImport,
  handleReset,
  fileRef,
}: {
  t: (key: string, vars?: Record<string, string | number>) => string;
  settings: ReturnType<typeof useSettings>["settings"];
  setName: (name: string) => void;
  setDailyTargets: (targets: Partial<{ vocab: number; reviews: number; xp: number }>) => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  summary: ReturnType<typeof summarize>;
  today: { xp: number; reviews: number; tests: number };
  level: number;
  xp: number;
  initial: string;
  badges: ReturnType<typeof getBadges>;
  confirmingReset: boolean;
  setConfirmingReset: (value: boolean) => void;
  notice: { message: string; tone: "success" | "error" } | null;
  exportData: () => void;
  handleImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleReset: () => void;
  fileRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const release = latestRelease();
  return (
    <>
      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-700 text-xl font-bold text-white shadow-lg shadow-teal-700/20">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <label className="sr-only" htmlFor="profile-name">
              {t("profile.name")}
            </label>
            <input
              id="profile-name"
              type="text"
              value={settings.name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("profile.namePlaceholder")}
              maxLength={24}
              className="w-full bg-transparent text-lg font-bold tracking-tight outline-none placeholder:text-stone-400"
            />
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {t("profile.role")}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold leading-tight">
              {t("common.level")} {level}
            </p>
            <p className="text-xs text-stone-400">
              {xp} {t("common.xp")}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-stone-400">
          {t("profile.today")}{" "}
          <span className="font-semibold text-stone-600 dark:text-stone-300">
            {today.xp} {t("common.xp")} · {today.reviews} {t("stats.review")} ·{" "}
            {today.tests} {t("stats.test")}
          </span>
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label={t("stats.streak")}
            value={t("stats.days", { n: summary.streak })}
            icon="flame"
          />
          <StatCard
            label={t("stats.bestStreak")}
            value={t("stats.days", { n: summary.bestStreak })}
            icon="flame"
          />
          <StatCard
            label={t("stats.mastered")}
            value={summary.mastered}
            icon="book"
          />
          <StatCard
            label={t("stats.completedTests")}
            value={summary.completedTests}
            icon="chart"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold">{t("badge.title")}</h2>
          <p className="text-xs text-stone-400">
            {t("badge.subtitle", {
              earned: badges.filter((b) => b.earned).length,
              total: badges.length,
            })}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex flex-col gap-1.5 rounded-xl border p-3 transition-colors ${
                badge.earned
                  ? "animate-pop border-amber-200 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-500/10"
                  : "border-stone-200 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-900/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    badge.earned
                      ? "bg-amber-400 text-stone-900"
                      : "bg-stone-200 text-stone-500 dark:bg-stone-800 dark:text-stone-500"
                  }`}
                >
                  <Icon name={badge.icon} className="h-4 w-4" />
                </span>
                {badge.earned && (
                  <Icon name="check" className="h-4 w-4 text-amber-600" />
                )}
              </div>
              <p className="text-sm font-semibold leading-tight">
                {t(badge.titleKey)}
              </p>
              <p className="text-[11px] leading-snug text-stone-500 dark:text-stone-400">
                {t(badge.descKey)}
              </p>
              <div className="mt-auto flex items-center gap-1.5">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800">
                  <div
                    className={`h-full rounded-full ${
                      badge.earned ? "bg-amber-500" : "bg-teal-600"
                    }`}
                    style={{ width: `${(badge.current / badge.target) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] tabular-nums text-stone-400">
                  {t("badge.progress", {
                    current: badge.current,
                    target: badge.target,
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <h2 className="mb-4 text-sm font-semibold">{t("profile.prefs")}</h2>
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
              {t("profile.language")}
            </p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  key={option.locale}
                  type="button"
                  onClick={() => setLocale(option.locale)}
                  className={`flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors active:scale-[0.97] ${
                    locale === option.locale
                      ? "bg-teal-700 text-white"
                      : "border border-stone-200 bg-white text-stone-600 hover:border-teal-300 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-400"
                  }`}
                >
                  {t(option.labelKey)}
                  {locale === option.locale && (
                    <Icon name="check" className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-stone-400">
              {t("profile.dailyTarget")}
            </p>
            <div className="flex flex-col gap-2">
              <TargetStepper
                label={t("profile.targetVocab")}
                value={settings.dailyTargets.vocab}
                onChange={(value) => setDailyTargets({ vocab: value })}
              />
              <TargetStepper
                label={t("profile.targetReviews")}
                value={settings.dailyTargets.reviews}
                onChange={(value) => setDailyTargets({ reviews: value })}
              />
              <TargetStepper
                label={t("profile.targetXp")}
                value={settings.dailyTargets.xp}
                onChange={(value) => setDailyTargets({ xp: value })}
              />
            </div>
          </div>
        </div>
      </section>

      <ReminderCard />

      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <h2 className="mb-1 text-sm font-semibold">{t("profile.data")}</h2>
        <p className="mb-4 text-xs text-stone-400">{t("profile.dataNote")}</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={exportData}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-700 transition-colors hover:border-teal-300 hover:text-teal-700 active:scale-[0.97] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-teal-700 dark:hover:text-teal-600"
          >
            <Icon name="check" className="h-4 w-4" />
            {t("profile.export")}
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-700 transition-colors hover:border-teal-300 hover:text-teal-700 active:scale-[0.97] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-teal-700 dark:hover:text-teal-600"
          >
            <Icon name="pen" className="h-4 w-4" />
            {t("profile.import")}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImport}
          />
        </div>

        <div className="mt-4 rounded-xl border border-red-200 bg-red-50/60 p-4 dark:border-red-900 dark:bg-red-500/10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                {t("profile.reset")}
              </p>
              <p className="text-xs text-red-400">{t("profile.resetHint")}</p>
            </div>
            {confirmingReset ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex h-9 items-center gap-2 rounded-lg bg-red-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 active:scale-[0.97]"
                >
                  <Icon name="check" className="h-4 w-4 rotate-90" />
                  {t("profile.confirmReset")}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingReset(false)}
                  className="h-9 rounded-lg border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300"
                >
                  {t("profile.cancel")}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmingReset(true)}
                className="flex h-9 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 active:scale-[0.97] dark:border-red-800 dark:bg-stone-950 dark:text-red-400 dark:hover:bg-red-500/10"
              >
                <Icon name="check" className="h-4 w-4 rotate-90" />
                {t("profile.reset")}
              </button>
            )}
          </div>
        </div>

        {notice && (
          <div
            key={notice.message}
            className={`animate-slide-down mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
              notice.tone === "error"
                ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            }`}
          >
            <Icon
              name="check"
              className={`h-4 w-4 ${notice.tone === "error" ? "rotate-90" : ""}`}
            />
            {t(notice.message)}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-950">
        <h2 className="mb-2 text-sm font-semibold">{t("profile.about")}</h2>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Levio · {t("profile.version", { version: APP_VERSION })}
        </p>
        <button
          type="button"
          onClick={() => setShowWhatsNew((value) => !value)}
          className="mt-2 flex h-8 items-center gap-2 rounded-lg border border-stone-200 px-3 text-sm font-medium text-stone-600 transition-colors hover:border-teal-300 hover:text-teal-700 active:scale-[0.97] dark:border-stone-700 dark:text-stone-300 dark:hover:border-teal-700 dark:hover:text-teal-600"
        >
          <Icon name="star" className="h-4 w-4" />
          {t("profile.whatsNew")}
        </button>
        {showWhatsNew && (
          <div className="animate-slide-down mt-3 rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
              v{release.version} · {release.date}
            </p>
            <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-4 text-sm text-stone-600 dark:text-stone-300">
              {release.highlightKeys.map((key) => (
                <li key={key}>{t(key)}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-3 text-xs text-stone-400">{t("profile.localNote")}</p>
      </section>
    </>
  );
}
