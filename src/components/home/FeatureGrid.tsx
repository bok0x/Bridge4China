"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Search, FileText, Award } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  {
    icon: Search,
    title: "Discover Universities",
    description:
      "Filter by field, language, location, and tuition. Find your perfect match from 200+ programs.",
    href: "/discover",
    color: "var(--color-accent)",
  },
  {
    icon: Award,
    title: "Find Scholarships",
    description:
      "Match with CSC, provincial, and university scholarships that cover full tuition and living costs.",
    href: "/scholarships",
    color: "#f59e0b",
  },
  {
    icon: FileText,
    title: "Apply with Guidance",
    description:
      "Step-by-step application assistant. Know exactly what documents you need and when to submit.",
    href: "/apply",
    color: "#8b5cf6",
  },
];

/* ── Corner starting offsets [x, y] in px ───────────────────────
   Cards fly in from the four corners of the viewport toward their
   grid slots. Animation is purely scroll-driven — pause mid-scroll
   and the cards freeze exactly mid-flight.
*/
const CORNERS: [number, number][] = [
  [-340, -220], // card 0 — from top-left
  [ 340, -220], // card 1 — from top-right
  [-340,  220], // card 2 — from bottom-left
  [ 340,  220], // card 3 — from bottom-right
];

/* ── Single animated feature card ───────────────────────────── */
function FeatureCard({
  f,
  index,
  progress,
}: {
  f: (typeof features)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const [cx, cy] = CORNERS[index];

  /* Slight stagger: each card starts a few scroll-percent after prev */
  const lag = index * 0.03;
  const s0  = lag;
  const s1  = 0.72 + lag;

  const x       = useTransform(progress, [s0, s1], [cx, 0]);
  const y       = useTransform(progress, [s0, s1], [cy, 0]);
  const opacity = useTransform(progress, [s0, Math.min(s0 + 0.22, s1)], [0, 1]);
  const scale   = useTransform(progress, [s0, s1], [0.72, 1]);
  /* Slight counter-rotation that unwinds as the card lands */
  const rotate  = useTransform(progress, [s0, s1], [cx > 0 ? 6 : -6, 0]);

  return (
    <motion.a
      href={f.href}
      style={{ x, y, opacity, scale, rotate, display: "block" }}
    >
      <GlassCard hover className="h-full">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: `${f.color}20` }}
        >
          <f.icon size={22} style={{ color: f.color }} />
        </div>
        <h3 className="font-heading font-bold text-base mb-2">{f.title}</h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {f.description}
        </p>
      </GlassCard>
    </motion.a>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export function FeatureGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  /* Section scroll:
     0 → section top enters at 88% of viewport height
     1 → section top reaches 20% of viewport height   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 88%", "start 20%"],
  });

  /* Heading fades in before cards arrive */
  const headingOpacity = useTransform(scrollYProgress, [0, 0.22], [0, 1]);
  const headingY       = useTransform(scrollYProgress, [0, 0.22], [28, 0]);

  return (
    <section ref={sectionRef} className="section container-app">
      {/* Heading */}
      <motion.div
        style={{ opacity: headingOpacity, y: headingY }}
        className="text-center mb-14"
      >
        <div className="badge badge-accent inline-flex mb-4">Everything you need</div>
        <h2 className="text-4xl md:text-5xl font-heading font-black mb-4">
          Built for international students
        </h2>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "var(--color-text-secondary)" }}>
          One platform to research, compare, and apply — no more jumping between
          dozens of university websites.
        </p>
      </motion.div>

      {/* Cards — fly in from corners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((f, i) => (
          <FeatureCard key={f.title} f={f} index={i} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
