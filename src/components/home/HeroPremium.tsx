"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

/* ── Animation variants ──────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/* ── Orb definitions ─────────────────────────────────────────── */
const orbs = [
  {
    // Large orb — top-left
    size: 680,
    x: [-10, 6, -4, -10],
    y: [-8, 10, -2, -8],
    duration: 14,
    color: "var(--color-accent)",
    opacity: 0.17,
    top: "-15%",
    left: "-12%",
  },
  {
    // Medium orb — bottom-right
    size: 520,
    x: [8, -6, 4, 8],
    y: [6, -10, 2, 6],
    duration: 11,
    color: "var(--color-accent-deep)",
    opacity: 0.20,
    bottom: "-10%",
    right: "-8%",
  },
  {
    // Small orb — center-top
    size: 360,
    x: [-4, 8, -2, -4],
    y: [4, -6, 8, 4],
    duration: 9,
    color: "var(--color-accent)",
    opacity: 0.10,
    top: "10%",
    left: "45%",
  },
  {
    // Accent orb — bottom-left
    size: 280,
    x: [6, -4, 2, 6],
    y: [-4, 8, -2, -4],
    duration: 13,
    color: "var(--color-accent-deep)",
    opacity: 0.15,
    bottom: "15%",
    left: "8%",
  },
];

/* ── Stats data ──────────────────────────────────────────────── */
const stats = [
  { value: "500+", label: "Programs" },
  { value: "100+", label: "Universities" },
  { value: "80+", label: "Countries" },
];

/* ── Component ───────────────────────────────────────────────── */
export function HeroPremium() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "var(--color-bg-base)" }}
    >
      {/* ── Animated gradient orbs ────────────────────────────── */}
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            width: orb.size,
            height: orb.size,
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            opacity: orb.opacity,
            filter: "blur(60px)",
            top: "top" in orb ? orb.top : undefined,
            bottom: "bottom" in orb ? orb.bottom : undefined,
            left: "left" in orb ? orb.left : undefined,
            right: "right" in orb ? orb.right : undefined,
          }}
          animate={{
            x: orb.x,
            y: orb.y,
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* ── Subtle dot-grid texture overlay ──────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(72,197,156,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="container-app relative z-10 flex flex-col items-center text-center gap-8 py-24">
        <motion.div
          className="flex flex-col items-center gap-6 w-full"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={badgeVariants}>
            <span
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold font-heading"
              style={{
                background: "var(--color-accent-muted)",
                border: "1px solid rgba(72, 197, 156, 0.30)",
                color: "var(--color-accent)",
                backdropFilter: "blur(12px)",
              }}
            >
              🎓 #1 Platform for Studying in China
            </span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-1">
            <h1
              className="font-heading font-black tracking-tight leading-none"
              style={{
                fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
                color: "var(--color-text-primary)",
                letterSpacing: "-0.03em",
              }}
            >
              Your Future in China
            </h1>
            <h1
              className="font-heading font-black tracking-tight leading-none"
              style={{
                fontSize: "clamp(2.8rem, 8vw, 5.5rem)",
                letterSpacing: "-0.03em",
              }}
            >
              <span style={{ color: "var(--color-text-primary)" }}>Starts </span>
              <span style={{ color: "var(--color-accent)" }}>Here</span>
            </h1>
          </motion.div>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl text-base md:text-lg leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Match with the perfect university and scholarship in minutes. 500+
            programs, 100+ universities, trusted by students from 80+ countries.
          </motion.p>

          {/* Trust stats bar */}
          <motion.div
            variants={itemVariants}
            className="flex items-center divide-x"
            style={{
              background: "var(--glass-bg)",
              backdropFilter: "blur(25px) saturate(200%)",
              WebkitBackdropFilter: "blur(25px) saturate(200%)",
              border: "1px solid var(--glass-border)",
              boxShadow: "var(--glass-shadow), var(--glass-inner-glow)",
              borderRadius: "1.25rem",
            }}
          >
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center px-6 py-4 gap-0.5"
                style={{
                  borderRight: "1px solid var(--glass-border)",
                }}
              >
                <span
                  className="font-heading font-black text-2xl md:text-3xl leading-none"
                  style={{ color: "var(--color-accent)" }}
                >
                  {stat.value}
                </span>
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-3 mt-2"
          >
            <Link href="/quiz" className="btn-accent px-7 py-3.5 text-base">
              Help Me Find My Major
            </Link>
            <Link href="/how-to-apply" className="btn-ghost px-7 py-3.5 text-base">
              I Need Help Applying
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────────── */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        aria-hidden="true"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown
            size={22}
            style={{ color: "var(--color-text-tertiary)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
