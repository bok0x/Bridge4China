"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { GlassCard } from "@/components/ui/GlassCard";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { OTPInput } from "@/components/ui/OTPInput";
import { SITE_NAME } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 71 }, (_, i) => CURRENT_YEAR - 10 - i); // 10 to 80 years ago
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

type Step = "details" | "otp";

export default function SignupPage() {
  const { t } = useLanguage();
  // Step state
  const [step, setStep] = useState<Step>("details");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCode, setPhoneCode] = useState("+212");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function handleSocialLogin(provider: "google") {
    setSocialLoading(provider);
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/dashboard&from=signup` },
    });
    if (authError) {
      setError(authError.message);
      setSocialLoading(null);
    }
  }

  function validateDetails(): string | null {
    if (!name.trim()) return "Full name is required.";
    if (!email.trim()) return "Email is required.";
    if (!birthDay || !birthMonth || !birthYear) return "Please enter your complete birthday.";
    if (!phoneNumber.trim()) return "Phone number is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  }

  async function handleDetailsSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validateDetails();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");

    const birthday = `${birthYear}-${String(MONTHS.indexOf(birthMonth) + 1).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
    const phone = `${phoneCode} ${phoneNumber}`;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, birthday, phone, nationality_code: phoneCode },
        // Supabase will send a 6-digit OTP if your email template uses {{ .Token }}
        // Dashboard → Auth → Email Templates → Confirm signup → add {{ .Token }} to body
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists") || msg.includes("email address is already")) {
        setError("An account with this email already exists. Please sign in instead.");
      } else {
        setError(authError.message);
      }
      setLoading(false);
      return;
    }

    setLoading(false);
    setStep("otp");
    setResendCooldown(60);
  }

  async function handleOTPComplete(code: string) {
    setOtpLoading(true);
    setOtpError("");
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "signup",
    });

    if (verifyError) {
      setOtpError("Invalid or expired code. Please check your email and try again.");
      setOtpLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setOtpError("");
    const supabase = createClient();
    await supabase.auth.resend({ type: "signup", email });
    setResendCooldown(60);
  }

  // ── OTP Step ─────────────────────────────────────────────────────────────────
  if (step === "otp") {
    return (
      <div className="min-h-screen flex items-center justify-center pt-36 pb-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <span className="font-heading font-black text-xl" style={{ color: "var(--color-accent)" }}>
                {SITE_NAME}
              </span>
            </Link>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: "rgba(72,197,156,0.12)", border: "1px solid rgba(72,197,156,0.3)" }}
            >
              <span style={{ fontSize: 28 }}>📧</span>
            </div>
            <h1 className="text-2xl font-heading font-black mb-2">{t("signup_otp_title")}</h1>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {t("signup_otp_subtitle")} <strong style={{ color: "var(--color-text-primary)" }}>{email}</strong>
            </p>
          </div>

          <GlassCard>
            <div className="space-y-6">
              <OTPInput length={8} onComplete={handleOTPComplete} disabled={otpLoading} />

              {otpError && (
                <p className="text-sm rounded-xl px-4 py-3 text-center" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                  {otpError}
                </p>
              )}

              {otpLoading && (
                <p className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Verifying…
                </p>
              )}

              <div className="text-center">
                <p className="text-sm mb-3" style={{ color: "var(--color-text-secondary)" }}>
                  Didn&apos;t receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0}
                  className="text-sm font-medium"
                  style={{ color: resendCooldown > 0 ? "var(--color-text-tertiary)" : "var(--color-accent)", cursor: resendCooldown > 0 ? "not-allowed" : "pointer", background: "none", border: "none" }}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setStep("details"); setOtpError(""); }}
                className="w-full text-sm"
                style={{ color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer" }}
              >
                ← Back to registration
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── Details Step ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-16 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <span className="font-heading font-black text-xl" style={{ color: "var(--color-accent)" }}>
              {SITE_NAME}
            </span>
          </Link>
          <h1 className="text-3xl font-heading font-black mb-2">{t("signup_badge")}</h1>
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {t("signup_title")}
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
              {socialLoading === "google" ? "Redirecting…" : "Sign up with Google"}
            </button>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
            <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>or sign up with email</span>
            <div className="flex-1 h-px" style={{ background: "var(--glass-border)" }} />
          </div>

          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                {t("signup_name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoComplete="name"
                placeholder="Your full name"
                className="input-glass w-full"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="input-glass w-full"
              />
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Date of birth
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr 1fr", gap: 8 }}>
                <select value={birthDay} onChange={e => setBirthDay(e.target.value)} required className="input-glass w-full" style={{ fontSize: 14 }}>
                  <option value="">Day</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)} required className="input-glass w-full" style={{ fontSize: 14 }}>
                  <option value="">Month</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={birthYear} onChange={e => setBirthYear(e.target.value)} required className="input-glass w-full" style={{ fontSize: 14 }}>
                  <option value="">Year</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Phone number
              </label>
              <PhoneInput
                code={phoneCode}
                number={phoneNumber}
                onCodeChange={setPhoneCode}
                onNumberChange={setPhoneNumber}
                required
              />
              <p className="text-xs mt-1.5" style={{ color: "var(--color-text-tertiary)" }}>
                ⚡ WhatsApp number recommended
              </p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Min 8 characters"
                className="input-glass w-full"
              />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Repeat your password"
                className="input-glass w-full"
                style={{ borderColor: confirmPassword && confirmPassword !== password ? "rgba(239,68,68,0.6)" : undefined }}
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs mt-1" style={{ color: "#f87171" }}>Passwords do not match</p>
              )}
            </div>

            {error && (
              <p className="text-sm rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
                {error.includes("sign in instead") ? (
                  <>{error.replace(" Please sign in instead.", "")} <Link href="/login" style={{ color: "#f87171", fontWeight: 700, textDecoration: "underline" }}>Sign in instead →</Link></>
                ) : error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full justify-center"
            >
              {loading ? t("signup_creating") : t("signup_create_btn")}
            </button>
          </form>

          <p className="text-center text-sm mt-5" style={{ color: "var(--color-text-secondary)" }}>
            {t("signup_have_account")}{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--color-accent)" }}>
              {t("login_sign_in")}
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
