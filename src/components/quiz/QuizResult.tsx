"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Recommendation } from "./quizData";

interface QuizResultProps {
  recommendations: Recommendation[];
}

const WHATSAPP_GROUP = "https://chat.whatsapp.com/CLglLgiCl0BCCv7qhquEW0";

export default function QuizResult({ recommendations }: QuizResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      style={{ width: "100%", maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", gap: "2.5rem", paddingBottom: "3rem" }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
        <div className="badge badge-accent">✦ Quantum Match Complete</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, color: "var(--color-text-primary)", lineHeight: 1.2, margin: 0 }}>
          Your Quantum Match Report
        </h1>
        <div style={{ width: 80, height: 3, background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-hover))", borderRadius: 9999, boxShadow: "0 0 12px var(--color-accent-glow)" }} />
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", maxWidth: 440, lineHeight: 1.6, margin: 0 }}>
          Based on your answers, here are your top university matches:
        </p>
      </div>

      {/* Cards — vertical list, left-aligned */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.12, ease: [0.4, 0, 0.2, 1] }}
            className="glass"
            style={{
              position: "relative",
              padding: "1.75rem 2rem",
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              borderColor: i === 0 ? "rgba(72,197,156,0.45)" : undefined,
              boxShadow: i === 0 ? "var(--glass-shadow), 0 0 0 1px rgba(72,197,156,0.2), 0 0 32px rgba(72,197,156,0.08)" : undefined,
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; }}
          >
            {i === 0 && (
              <div style={{
                position: "absolute", top: "-0.65rem", left: "1.75rem",
                padding: "0.2rem 0.875rem",
                background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-hover))",
                color: "#fff", fontFamily: "var(--font-heading)", fontSize: "0.68rem",
                fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase",
                borderRadius: 9999, whiteSpace: "nowrap",
              }}>
                Best Match
              </div>
            )}

            {/* Match % circle */}
            <div style={{
              flexShrink: 0, width: 80, height: 80, borderRadius: "50%",
              background: "rgba(72,197,156,0.1)", border: "2px solid rgba(72,197,156,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexDirection: "column",
            }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: 900, color: "var(--color-accent)", lineHeight: 1 }}>
                {rec.match}
              </span>
              <span style={{ fontSize: "0.65rem", color: "var(--color-text-tertiary)", fontWeight: 600 }}>%</span>
            </div>

            {/* Info — left aligned */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text-primary)", margin: "0 0 0.3rem", lineHeight: 1.3 }}>
                {rec.university}
              </h3>
              <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", margin: "0 0 0.4rem" }}>
                {rec.major}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--color-text-tertiary)" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent)", flexShrink: 0, display: "inline-block" }} />
                {rec.city}, China
              </div>
            </div>

            {/* CTA */}
            <Link href="/discover" className="btn-ghost" style={{ flexShrink: 0, fontSize: "0.85rem", padding: "0.55rem 1.1rem", whiteSpace: "nowrap" }}>
              Explore →
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.875rem", textAlign: "center" }}
      >
        <p style={{ fontSize: "0.95rem", color: "var(--color-text-secondary)", margin: 0 }}>
          Want help applying to these universities?
        </p>
        <a href={WHATSAPP_GROUP} target="_blank" rel="noopener noreferrer" className="btn-accent" style={{ padding: "0.8rem 2rem", fontSize: "0.95rem" }}>
          Join our WhatsApp Community →
        </a>
      </motion.div>
    </motion.div>
  );
}
