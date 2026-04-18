"use client";

import { motion } from "framer-motion";
import { Search, Zap, FileText, Award, Mail, Plane } from "lucide-react";
import Link from "next/link";

const STEPS = [
  { n: 1, icon: Search, title: "Discover Your Match", desc: "Browse 500+ programs across 100+ top Chinese universities. Filter by field, language, scholarship eligibility, and budget.", color: "#48C59C" },
  { n: 2, icon: Zap, title: "Get Your Quantum Report", desc: "Take our 5-minute Quantum Matching Quiz and receive a personalized report with your top university matches — completely free.", color: "#5DD4AE" },
  { n: 3, icon: FileText, title: "Prepare Your Application", desc: "Our advisors guide you through every document: transcripts, study plan, recommendation letters, and more — step by step.", color: "#48C59C" },
  { n: 4, icon: Award, title: "Apply for CSC Scholarship", desc: "We help you apply for the Chinese Government Scholarship (CSC) — fully funded tuition, accommodation & monthly stipend up to $500.", color: "#F5C518" },
  { n: 5, icon: Mail, title: "Receive Your Admission Letter", desc: "Get accepted at a top-100 Chinese university. We maintain partnerships with 100+ universities to maximize your success rate.", color: "#48C59C" },
  { n: 6, icon: Plane, title: "Arrive & Thrive", desc: "We support you from visa application to your first day in China. Join our student community and hit the ground running.", color: "#5DD4AE" },
];

const TRUST = [
  { icon: "✓", label: "500+ Students Placed" },
  { icon: "✓", label: "98% Visa Success Rate" },
  { icon: "✓", label: "100+ Partner Universities" },
  { icon: "✓", label: "Free CSC Guidance" },
];

export function HowItWorks() {
  return (
    <section className="section container-app relative">
      {/* Atmospheric blob */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-3xl opacity-5 pointer-events-none"
        style={{ background: "var(--color-accent)" }}
      />

      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-14"
      >
        <div className="badge badge-accent inline-flex mb-4">How it works</div>
        <h2 className="text-4xl md:text-5xl font-heading font-black mb-4">
          How{" "}
          <span className="text-gradient">Bridge4China</span>{" "}
          Works
        </h2>
        {/* Accent underline */}
        <div
          className="mx-auto mb-5"
          style={{
            width: 64,
            height: 4,
            borderRadius: 9999,
            background: "var(--color-accent)",
          }}
        />
        <p
          className="text-lg max-w-xl mx-auto"
          style={{ color: "var(--color-text-secondary)" }}
        >
          From dream to degree — we guide you every step of the way.
        </p>
      </motion.div>

      {/* Steps grid — 2 columns desktop, 1 column mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.n}
              className="liquid-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "relative", padding: "28px 24px" }}
            >
              {/* Step number circle */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: 20,
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: step.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 900,
                  fontSize: 15,
                  color: step.color === "#F5C518" ? "#000" : "#000",
                  flexShrink: 0,
                }}
              >
                {step.n}
              </div>

              {/* Icon — top right area */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  right: 20,
                  width: 40,
                  height: 40,
                  borderRadius: "0.75rem",
                  background: `${step.color}18`,
                  border: `1px solid ${step.color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} style={{ color: step.color }} />
              </div>

              {/* Content — push below the top row */}
              <div style={{ marginTop: 52 }}>
                <h3
                  className="font-heading font-black text-lg mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {step.desc}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Trust badges row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap justify-center gap-3 mb-14"
      >
        {TRUST.map((t) => (
          <div
            key={t.label}
            className="glass"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 18px",
              borderRadius: 9999,
            }}
          >
            <span
              style={{
                color: "var(--color-accent)",
                fontWeight: 900,
                fontSize: 14,
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {t.icon}
            </span>
            <span
              style={{
                color: "var(--color-text-primary)",
                fontWeight: 600,
                fontSize: 13,
                fontFamily: "Montserrat, sans-serif",
              }}
            >
              {t.label}
            </span>
          </div>
        ))}
      </motion.div>

      {/* CTA section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <h3 className="text-2xl md:text-3xl font-heading font-black mb-6">
          Ready to Start Your Journey?
        </h3>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/quiz" className="btn-accent btn-liquid">
            Take the Quiz →
          </Link>
          <a
            href="https://wa.me/212628345297"
            className="btn-ghost btn-liquid"
            target="_blank"
            rel="noopener noreferrer"
          >
            Talk to an Advisor
          </a>
        </div>
      </motion.div>
    </section>
  );
}
