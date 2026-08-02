"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Halaman pemulihan kata sandi: dibuka dari tautan recovery email
// (auth/callback?type=recovery). User sudah terautentikasi via verifyOtp di
// server; di sini cukup memasang kata sandi baru.
export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("auth.errorWeakPassword");
      return;
    }
    if (password !== confirm) {
      setError("auth.passwordMismatch");
      return;
    }
    setSubmitting(true);
    const client = getSupabaseBrowserClient();
    const { error: updateError } = client
      ? await client.auth.updateUser({ password })
      : { error: { message: "" } as unknown as Error };
    setSubmitting(false);
    if (updateError) {
      setError("auth.resetFailed");
      return;
    }
    setDone(true);
  };

  const inputClass =
    "h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none transition-colors focus:border-teal-400 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 py-10">
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center dark:border-stone-800 dark:bg-stone-950">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-700 to-emerald-700 text-xl font-bold text-white shadow-lg shadow-teal-700/20">
          L
        </span>
        <h1 className="mt-4 text-lg font-bold tracking-tight">
          {t("auth.resetTitle")}
        </h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">
          {t("auth.resetSubtitle")}
        </p>

        {done ? (
          <div className="mt-5">
            <p className="animate-slide-down rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              {t("auth.resetSuccess")}
            </p>
            <Link
              href="/profile"
              className="mt-4 flex h-12 items-center justify-center rounded-xl bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 active:scale-[0.97]"
            >
              {t("auth.submitLogin")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 text-left">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                {t("auth.newPassword")}
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                {t("auth.confirmPassword")}
              </span>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                className={inputClass}
              />
            </label>
            <p className="text-xs text-stone-400">{t("auth.passwordHint")}</p>

            {error && (
              <p className="animate-slide-down rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {t(error)}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex h-12 items-center justify-center rounded-xl bg-teal-700 text-sm font-semibold text-white shadow-sm shadow-teal-700/20 transition-colors hover:bg-teal-800 active:scale-[0.97] disabled:opacity-60"
            >
              {submitting ? "…" : t("auth.submitRegister")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
