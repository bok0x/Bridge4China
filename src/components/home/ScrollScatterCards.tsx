"use client";

import { motion, useTransform, MotionValue } from "framer-motion";
import { MapPin, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

/* ── Data ──────────────────────────────────────────────────────────────── */
const UNIS = [
  { name: "Peking University",   city: "Beijing",  field: "Computer Science", match: 98 },
  { name: "Fudan University",    city: "Shanghai", field: "Business",         match: 94 },
  { name: "Tsinghua University", city: "Beijing",  field: "Engineering",      match: 91 },
  { name: "Zhejiang University", city: "Hangzhou", field: "Medicine",         match: 88 },
];

/* ── Layout constants ──────────────────────────────────────────────────── */
const CARD_H  = 74;
const GAP     = 12;
const STRIDE  = CARD_H + GAP;        // 86
const PAD_TOP = 28;
const CONTAINER_H = PAD_TOP + UNIS.length * CARD_H + (UNIS.length - 1) * GAP + PAD_TOP;

// Y position of the center of the final list (all cards start here — stacked)
const STACK_Y = PAD_TOP + ((UNIS.length - 1) / 2) * STRIDE;

// Each card's final absolute Y inside the container
const FINAL_Y = UNIS.map((_, i) => PAD_TOP + i * STRIDE);

/* ── Deck visual (rotation + horizontal spread + opacity) ──────────────── */
const STACK_ROT     = [-11, -4,  3,  9];
const STACK_X       = [  7,  2, -2, -7];
const STACK_OPACITY = [  1, 0.70, 0.48, 0.30];

/* ── Single animated card ──────────────────────────────────────────────── */
function ScatterCard({
  uni,
  index,
  progress,
}: {
  uni: (typeof UNIS)[0];
  index: number;
  progress: MotionValue<number>;
}) {
  const router = useRouter();

  // Stagger: each card starts separating slightly later than the previous
  const lag = index * 0.05;
  const s0  = lag;
  const s1  = 0.50 + lag;

  const y       = useTransform(progress, [s0, s1], [STACK_Y,             FINAL_Y[index]]);
  const x       = useTransform(progress, [s0, s1], [STACK_X[index],      0]);
  const rotate  = useTransform(progress, [s0, s1], [STACK_ROT[index],    0]);
  const scale   = useTransform(progress, [s0, s1], [0.88,                1]);
  const opacity = useTransform(progress, [s0, s1], [STACK_OPACITY[index], 1]);

  return (
    <motion.div
      style={{
        y, x, rotate, scale, opacity,
        position: "absolute",
        top:    0,
        left:   0,
        right:  0,
        zIndex: UNIS.length - index,   // top card sits above the rest
        cursor: "pointer",
      }}
      className="glass glass-hover rounded-2xl p-4 flex items-center gap-4"
      onClick={() => router.push("/discover")}
    >
      {/* Avatar */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 font-heading font-black text-xl"
        style={{ background: "var(--color-accent-muted)", color: "var(--color-accent)" }}
      >
        {uni.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm truncate">{uni.name}</p>
        <div
          className="flex items-center gap-1.5 text-xs mt-0.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <MapPin size={11} />
          {uni.city}
          <span className="opacity-40">·</span>
          <BookOpen size={11} />
          {uni.field}
        </div>
      </div>

      {/* Match score */}
      <div className="flex-shrink-0 text-right">
        <div
          className="font-heading font-black text-xl leading-none"
          style={{ color: "var(--color-accent)" }}
        >
          {uni.match}%
        </div>
        <div className="text-xs mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
          Match
        </div>
      </div>
    </motion.div>
  );
}

/* ── Container exported to Hero ────────────────────────────────────────── */
export function ScrollScatterCards({ progress }: { progress: MotionValue<number> }) {
  // Hint text fades away once the cards start separating
  const hintOpacity = useTransform(progress, [0, 0.18], [1, 0]);

  return (
    <div style={{ position: "relative", height: CONTAINER_H }}>
      {/* "Scroll to reveal" hint — only visible at the top of the page */}
      <motion.p
        style={{
          opacity: hintOpacity,
          position: "absolute",
          top: 4,
          left: 0,
          right: 0,
          zIndex: UNIS.length + 1,
          textAlign: "center",
          color: "var(--color-text-tertiary)",
          fontSize: "0.6rem",
          letterSpacing: "0.18em",
          fontWeight: 700,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        SCROLL TO REVEAL ↓
      </motion.p>

      {UNIS.map((uni, i) => (
        <ScatterCard key={uni.name} uni={uni} index={i} progress={progress} />
      ))}
    </div>
  );
}
