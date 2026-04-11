"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Search, GitCompare, FileCheck } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Discover",
    description:
      "Search 12,000+ programs from 1,300+ universities. Filter by field, language, city, and scholarship availability.",
    color: "var(--color-accent)",
  },
  {
    step: "02",
    icon: GitCompare,
    title: "Compare",
    description:
      "Add up to 3 programs side-by-side. Compare tuition, ranking, living costs, and documents required.",
    color: "var(--color-accent)",
  },
  {
    step: "03",
    icon: FileCheck,
    title: "Apply",
    description:
      "Get a personalised document checklist and step-by-step guidance — or talk to an advisor on WhatsApp.",
    color: "var(--color-accent-deep)",
  },
];

/* ── Animated SVG wire between steps ───────────────────────────
   The line draws from left to right using Framer's pathLength.
   A glowing dot rides just ahead of the drawn portion.
*/
function AnimatedConnector({ progress }: { progress: MotionValue<number> }) {
  /* Line draws from 0 → 1 (fully visible) during first 72% of section scroll */
  const lineLength = useTransform(progress, [0.04, 0.72], [0, 1]);
  const lineOpacity = useTransform(progress, [0, 0.08], [0, 1]);

  /* Travelling glow dot — x goes 0% → 100% of connector width */
  const dotX       = useTransform(progress, [0.04, 0.72], ["0%", "100%"]);
  const dotOpacity = useTransform(progress, [0.04, 0.10, 0.68, 0.74], [0, 1, 1, 0]);

  return (
    <div
      className="hidden md:block absolute top-14 left-[calc(33%+2rem)] right-[calc(33%+2rem)]"
      style={{ height: "2px", overflow: "visible" }}
    >
      {/* SVG line with pathLength animation */}
      <svg
        width="100%"
        height="2"
        viewBox="0 0 100 2"
        preserveAspectRatio="none"
        style={{ overflow: "visible" }}
      >
        <defs>
          <filter id="wire-glow" x="-20%" y="-400%" width="140%" height="900%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint track */}
        <line
          x1="0" y1="1" x2="100" y2="1"
          stroke="var(--color-accent)"
          strokeWidth="0.5"
          opacity="0.18"
          strokeDasharray="3 3"
        />

        {/* Animated glowing line */}
        <motion.line
          x1="0" y1="1" x2="100" y2="1"
          stroke="var(--color-accent)"
          strokeLinecap="round"
          filter="url(#wire-glow)"
          style={{
            pathLength: lineLength,
            opacity: lineOpacity,
            strokeWidth: 1.5,
          }}
        />
      </svg>

      {/* Glowing travelling dot */}
      <motion.div
        style={{
          left: dotX,
          opacity: dotOpacity,
          position: "absolute",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "var(--color-accent)",
          boxShadow: "0 0 10px 4px var(--color-accent)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ── Step card with 3D entrance + glow pulse ───────────────────
   • existing: icon block rotates from tilted-back to flat on its own scroll
   • new: coloured halo behind the icon ignites when the wire reaches this step
*/
function StepCard({
  s,
  i,
  glowProgress,
}: {
  s: (typeof steps)[number];
  i: number;
  glowProgress: MotionValue<number>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  /* ─ Existing 3D entrance driven by the card's own scroll position ─ */
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 95%", "start 40%"],
  });
  const rotateX   = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const translateY = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const scale3d   = useTransform(scrollYProgress, [0, 1], [0.88, 1]);
  const opacity3d = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  /* ─ Glow halo — driven by section-level scrollYProgress ─ */
  const glowOpacity = useTransform(glowProgress, [0.75, 1], [0, 1]);
  const glowScale   = useTransform(glowProgress, [0.75, 1], [0.4, 1]);

  return (
    <div ref={cardRef} className="relative flex flex-col items-center text-center">
      {/* Perspective wrapper for 3-D tilt */}
      <div style={{ perspective: "700px", perspectiveOrigin: "50% 80%" }}>
        <motion.div
          style={{ rotateX, y: translateY, scale: scale3d, opacity: opacity3d }}
          className="w-28 h-28 rounded-3xl flex items-center justify-center mb-6 relative"
        >
          {/* Glow halo — ignites when wire reaches this step */}
          <motion.div
            aria-hidden
            style={{
              opacity: glowOpacity,
              scale: glowScale,
              position: "absolute",
              inset: -8,
              borderRadius: "1.5rem",
              background: `${s.color}18`,
              boxShadow: `0 0 48px 8px ${s.color}44`,
              pointerEvents: "none",
            }}
          />

          {/* Icon box */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              background: `${s.color}12`,
              border: `1px solid ${s.color}30`,
              boxShadow: `0 0 40px ${s.color}22, inset 0 1px 0 rgba(255,255,255,0.10)`,
            }}
          />
          <s.icon size={36} style={{ color: s.color, position: "relative" }} />

          {/* Step number badge */}
          <span
            className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-black text-white"
            style={{ background: s.color }}
          >
            {i + 1}
          </span>
        </motion.div>
      </div>

      {/* Text — standard fade-in-up */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.55, delay: i * 0.12 + 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3 className="font-heading font-black text-xl mb-3">{s.title}</h3>
        <p
          className="text-sm leading-relaxed max-w-xs"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {s.description}
        </p>
      </motion.div>
    </div>
  );
}

/* ── Section ─────────────────────────────────────────────────── */
export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  /* Section-level scroll progress:
     0 → section top enters at 85% of viewport height
     1 → section top reaches 10% of viewport height            */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "start 10%"],
  });

  /* Each step's glow fires when the wire reaches it:
     step 0 → [0.00, 0.20]
     step 1 → [0.30, 0.52]
     step 2 → [0.62, 0.84]                                     */
  const glowProgress = [
    useTransform(scrollYProgress, [0.00, 0.20], [0, 1]),
    useTransform(scrollYProgress, [0.30, 0.52], [0, 1]),
    useTransform(scrollYProgress, [0.62, 0.84], [0, 1]),
  ];

  /* Heading scroll-in */
  const headingOpacity = useTransform(scrollYProgress, [0, 0.18], [0, 1]);
  const headingY       = useTransform(scrollYProgress, [0, 0.18], [28, 0]);

  return (
    <section ref={sectionRef} className="section container-app relative">
      {/* Atmospheric blob */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ background: "var(--color-accent)" }}
      />

      {/* Heading */}
      <motion.div
        style={{ opacity: headingOpacity, y: headingY }}
        className="text-center mb-14"
      >
        <div className="badge badge-accent inline-flex mb-4">How it works</div>
        <h2 className="text-4xl md:text-5xl font-heading font-black mb-4">
          Three steps to your{" "}
          <span className="text-gradient">dream program</span>
        </h2>
        <p
          className="text-lg max-w-xl mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          No more hours lost on scattered university websites. ChinaUniMatch gets
          you from search to application in minutes.
        </p>
      </motion.div>

      {/* Steps grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        {/* Animated wire connector */}
        <AnimatedConnector progress={scrollYProgress} />

        {steps.map((s, i) => (
          <StepCard
            key={s.step}
            s={s}
            i={i}
            glowProgress={glowProgress[i]}
          />
        ))}
      </div>
    </section>
  );
}
