// src/app/iq-test/IQTimer.tsx
"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  seconds: number;
  onExpire: () => void;
}

export function IQTimer({ seconds, onExpire }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(seconds);
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpireRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds]);

  const urgent = remaining <= 5;
  const pct = remaining / seconds;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* Arc progress indicator */}
      <svg width="36" height="36" viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth="3"
        />
        <circle
          cx="18" cy="18" r="15"
          fill="none"
          stroke={urgent ? "#f87171" : "#48C59C"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 15}`}
          strokeDashoffset={`${2 * Math.PI * 15 * (1 - pct)}`}
          transform="rotate(-90 18 18)"
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
        />
      </svg>

      {/* Badge */}
      <div style={{
        background: urgent ? "rgba(239,68,68,0.12)" : "rgba(72,197,156,0.12)",
        border: `1px solid ${urgent ? "rgba(239,68,68,0.4)" : "rgba(72,197,156,0.35)"}`,
        color: urgent ? "#f87171" : "#48C59C",
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 15,
        fontWeight: 700,
        fontVariantNumeric: "tabular-nums",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        animation: urgent ? "iqTimerPulse 0.7s ease-in-out infinite" : undefined,
        minWidth: 52,
        textAlign: "center",
      }}>
        {remaining}s
      </div>
    </div>
  );
}
