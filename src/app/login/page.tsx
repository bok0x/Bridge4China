"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE_NAME } from "@/lib/constants";

function LoginForm() {

  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSocialLogin(provider: "google" | "facebook") {
    setSocialLoading(provider);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError(authError.message);
      setSocialLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("invalid login credentials") || msg.includes("invalid credentials")) {
        setError("No account found or wrong password. Sign up instead.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    window.location.href = redirect;
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-heading font-black text-xl" style={{ color: "var(--color-accent)" }}>
              {SITE_NAME}
            </span>
          </Link>
          <h1 className="text-3xl font-heading font-black mb-2">Welcome back</h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Sign in to your account
          </p>
        </div>

        <GlassCard>
          {/* Social login */}
          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--color-text-primary)" }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" fill="none"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.3 0-9.7-3.6-11.3-8.5l-6.5 5C9.6 39.5 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.5l6.2 5.2C41 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
              {socialLoading === "google" ? "Redirecting…" : "Continue with Google"}
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("facebook")}
              disabled={!!socialLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all"
              style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--color-text-primary)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.5h-2.79V24C19.62 23.1 24 18.1 24 12.07z"/></svg>
              {socialLoading === "facebook" ? "Redirecting…" : "Continue with Facebook"}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>or continue with email</span>
            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="input-glass w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="input-glass w-full"
              />
            </div>

            {error && (
              <p className="text-sm rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error.includes("Sign up instead") ? (
                  <>{error.replace(" Sign up instead.", "")} <Link href="/signup" style={{ color: "#f87171", fontWeight: 700, textDecoration: "underline" }}>Sign up instead →</Link></>
                ) : error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full justify-center"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "var(--color-text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium" style={{ color: "var(--color-accent)" }}>
              Sign up
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
