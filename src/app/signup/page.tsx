"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { SITE_NAME } from "@/lib/constants";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 pb-16 px-4">
        <div className="w-full max-w-md">
          <GlassCard className="text-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--color-accent-muted)" }}
            >
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="font-heading font-black text-xl mb-2">Check your email</h2>
            <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
            </p>
            <Link href="/login" className="btn-accent text-sm">
              Go to Login
            </Link>
          </GlassCard>
        </div>
      </div>
    );
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
          <h1 className="text-3xl font-heading font-black mb-2">Create account</h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Start discovering Chinese universities
          </p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Full name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your name"
                className="input-glass w-full"
              />
            </div>

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
                minLength={8}
                autoComplete="new-password"
                placeholder="Min 8 characters"
                className="input-glass w-full"
              />
            </div>

            {error && (
              <p className="text-sm rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full justify-center"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "var(--color-text-secondary)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--color-accent)" }}>
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
