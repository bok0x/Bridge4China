"use client";
import { useState } from "react";
import { OTPInput } from "@/components/ui/OTPInput";
import { GlassCard } from "@/components/ui/GlassCard";

interface Props {
  email: string;
  onVerified: () => void;
}

export function QuizOTPStep({ email, onVerified }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleComplete(code: string) {
    setLoading(true);
    setError("");

    const res = await fetch("/api/otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    onVerified();
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(72,197,156,0.12)", border: "1px solid rgba(72,197,156,0.3)",
          borderRadius: 100, padding: "6px 16px", fontSize: 13,
          color: "var(--color-accent)", fontWeight: 600, marginBottom: 16,
        }}>
          ✉️ Check your email
        </div>
        <h2 className="text-3xl font-heading font-black mb-2">Verify your email</h2>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          We sent a 6-digit code to <strong>{email}</strong>
        </p>
      </div>

      <GlassCard>
        <div className="space-y-5">
          <OTPInput length={6} onComplete={handleComplete} disabled={loading} />
          {error && (
            <p className="text-sm rounded-xl px-4 py-3 text-center" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </p>
          )}
          {loading && (
            <p className="text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Verifying…
            </p>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
