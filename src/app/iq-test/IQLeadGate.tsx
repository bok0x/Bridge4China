"use client";
import { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface IQScores {
  iq: number; percentile: number;
  fri: number; qri: number; vci: number; vsi: number; wmi: number;
}

interface Props {
  scores: IQScores;
  sessionId: string;
  onUnlocked: () => void;
}

const WHATSAPP_GROUP = "https://chat.whatsapp.com/CLglLgiCl0BCCv7qhquEW0";

export function IQLeadGate({ scores, onUnlocked }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/quiz-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: name,
        email,
        whatsapp,
        quizAnswers: scores,
        recommendedMajors: [],
        recommendedUniversities: [],
        leadSource: "iq-test",
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    window.open(WHATSAPP_GROUP, "_blank", "noopener,noreferrer");
    onUnlocked();
  }

  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh" }}>
      {/* Blurred score teaser */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        filter: "blur(10px)", opacity: 0.25, pointerEvents: "none", userSelect: "none",
        fontSize: 120, fontWeight: 900, color: "var(--color-accent)",
        fontFamily: "var(--font-heading)",
      }}>
        {scores.iq}
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(72,197,156,0.12)", border: "1px solid rgba(72,197,156,0.3)",
              borderRadius: 100, padding: "6px 16px", fontSize: 13,
              color: "var(--color-accent)", fontWeight: 600, marginBottom: 16,
            }}>
              🧠 Your results are ready
            </div>
            <h2 className="text-3xl font-heading font-black mb-2">Unlock your IQ score</h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Enter your details to reveal your full cognitive profile and join our community.
            </p>
          </div>

          <GlassCard>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Full Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name" className="input-glass w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="input-glass w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--color-text-secondary)" }}>
                  WhatsApp <span style={{ fontWeight: 400, opacity: 0.6 }}>(recommended)</span>
                </label>
                <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ""))} required placeholder="+1 234 567 8900" className="input-glass w-full" />
              </div>
              {error && (
                <p className="text-sm rounded-xl px-4 py-3" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</p>
              )}
              <button type="submit" disabled={loading} className="btn-accent w-full justify-center">
                {loading ? "Saving…" : "Reveal My Score & Join WhatsApp →"}
              </button>
            </form>
            <p className="text-center text-xs mt-4" style={{ color: "var(--color-text-tertiary)" }}>
              No spam. We&apos;ll only send your results.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
