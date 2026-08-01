"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  AuthChangeEvent,
  Session,
  User,
} from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export interface AuthResult {
  ok: boolean;
  error: string | null;
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapAuthError(error: {
  code?: string;
  message?: string;
}): string {
  const code = error.code ?? "";
  const message = error.message?.toLowerCase() ?? "";
  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "auth.errorInvalidCredentials";
  }
  if (
    code === "email_exists" ||
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("already been registered")
  ) {
    return "auth.errorEmailExists";
  }
  if (code === "weak_password" || message.includes("password should be at least")) {
    return "auth.errorWeakPassword";
  }
  if (code === "invalid_email" || message.includes("valid email")) {
    return "auth.errorInvalidEmail";
  }
  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "auth.errorEmailNotConfirmed";
  }
  return "auth.errorNetwork";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    let mounted = true;

    if (client) {
      client.auth
        .getSession()
        .then(({ data }: { data: { session: Session | null } }) => {
          if (!mounted) return;
          setUser(data.session?.user ?? null);
        })
        .catch(() => {
          // abaikan — mode offline.
        })
        .finally(() => {
          if (mounted) setReady(true);
        });

      const { data: subscription } = client.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          setUser(session?.user ?? null);
        },
      );

      return () => {
        mounted = false;
        subscription.subscription.unsubscribe();
      };
    }

    void Promise.resolve().then(() => {
      if (mounted) setReady(true);
    });
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) return { ok: false, error: "auth.errorNetwork" };
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: mapAuthError(error) };
    return { ok: true, error: null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const client = getSupabaseBrowserClient();
    if (!client) return { ok: false, error: "auth.errorNetwork" };
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { ok: false, error: mapAuthError(error) };
    return {
      ok: true,
      error: null,
      needsConfirmation: !data.session,
    };
  }, []);

  const signOut = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    await client?.auth.signOut();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const client = getSupabaseBrowserClient();
    if (!client) return { ok: false, error: "auth.errorNetwork" };
    const { error } = await client.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { ok: false, error: mapAuthError(error) };
    return { ok: true, error: null };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        configured: isSupabaseConfigured(),
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return ctx;
}
