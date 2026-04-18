"use client"
import Link from "next/link"
import { MapPin } from "lucide-react"

export function BeforeChinaBanner() {
  return (
    <div
      className="hidden xl:flex flex-col"
      style={{ position: "fixed", left: 16, top: "50%", transform: "translateY(-50%)", zIndex: 40, width: 180 }}
    >
      <Link
        href="/before-china"
        className="liquid-card"
        style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 8, textDecoration: "none" }}
      >
        {/* Pulsing dot */}
        <div style={{ position: "absolute", top: 10, right: 10 }}>
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-accent)",
              animation: "pulse 2s infinite",
            }}
          />
        </div>

        <MapPin size={22} style={{ color: "var(--color-accent)" }} />

        <p style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-primary)", fontFamily: "Montserrat, sans-serif", lineHeight: 1.3, margin: 0 }}>
          Before Coming<br />to China
        </p>

        <p style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4, margin: 0 }}>
          Checklist, visa tips &amp; what to pack
        </p>

        <span
          className="btn-accent btn-liquid"
          style={{ fontSize: 11, padding: "6px 10px", textAlign: "center", display: "block" }}
        >
          Prepare Now →
        </span>
      </Link>
    </div>
  )
}
