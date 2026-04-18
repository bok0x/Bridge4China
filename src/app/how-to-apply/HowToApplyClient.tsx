"use client";

import { useState } from "react";
import {
  Search,
  ClipboardCheck,
  FileText,
  Award,
  Send,
  Mail,
  Globe,
  MapPin,
  ChevronDown,
  MessageCircle,
} from "lucide-react";

// ── Step data ────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: 1,
    icon: Search,
    title: "Research Your Options",
    description:
      "Use Bridge4China to filter programs by field, degree level, language, and city. Compare universities side-by-side to find the perfect fit for your goals and budget.",
  },
  {
    number: 2,
    icon: ClipboardCheck,
    title: "Check Eligibility",
    description:
      "Review GPA requirements, language requirements, age limits, and scholarship eligibility for your chosen programs. Each university sets its own criteria — knowing them early saves time.",
  },
  {
    number: 3,
    icon: FileText,
    title: "Prepare Your Documents",
    description:
      "Gather: passport, academic transcripts, highest degree certificate, passport photo, study plan, and recommendation letters if required. Having documents ready before deadlines is critical.",
  },
  {
    number: 4,
    icon: Award,
    title: "Apply for Scholarships",
    description:
      "Consider CSC (Chinese Government Scholarship), provincial scholarships, or university-specific scholarships. Deadlines typically fall between February and April — plan ahead.",
  },
  {
    number: 5,
    icon: Send,
    title: "Submit Your Application",
    description:
      "Apply directly through the university portal or through Bridge4China's application system. Track your application status in your dashboard at any time.",
  },
  {
    number: 6,
    icon: Mail,
    title: "Receive Your Admission Letter",
    description:
      "Once accepted, you'll receive a JW202 form and an official admission letter from the university. Keep both documents — you'll need them for your visa application.",
  },
  {
    number: 7,
    icon: Globe,
    title: "Apply for Your Student Visa (X1/X2)",
    description:
      "Visit your country's Chinese embassy with your admission letter, JW202 form, and supporting documents. The X1 visa is for stays over 180 days; X2 for shorter programs.",
  },
  {
    number: 8,
    icon: MapPin,
    title: "Arrive in China",
    description:
      "Register at your university within the deadline after arrival. Complete your medical exam at a designated hospital, then set up your bank account and phone SIM to settle in.",
  },
];

// ── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    question: "How long does the application process take?",
    answer:
      "Typically 2–4 months from research to receiving your admission letter. Scholarship applications add time, so starting 5–6 months before your intended intake is strongly recommended.",
  },
  {
    question: "Do I need to speak Chinese?",
    answer:
      "Not necessarily. Many programs are taught entirely in English, especially at the master's and doctoral level. You can filter by instruction language directly on Bridge4China to find English-taught programs.",
  },
  {
    question: "What GPA do I need?",
    answer:
      "Requirements vary by university and program. Most universities require a GPA equivalent of 2.5–3.5 out of 4.0. Scholarship programs are more competitive and typically require 3.0 or above.",
  },
  {
    question: "Can I apply for multiple universities at once?",
    answer:
      "Yes, and we recommend it. Applying to 3–5 programs gives you options and improves your chances. Bridge4China helps you manage multiple applications from a single dashboard.",
  },
  {
    question: "Is the CSC scholarship hard to get?",
    answer:
      "It's competitive but absolutely achievable with the right preparation. A strong study plan, good academic record, and a clear research proposal make a big difference. Our advisors help you build the strongest application possible.",
  },
];

// ── Main page component ───────────────────────────────────────────────────────

export function HowToApplyClient() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) =>
    setOpenIndex((prev) => (prev === index ? null : index));

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-bg-primary)" }}
    >
      {/* ── Section 1: Hero ─────────────────────────────────────────────────── */}
      <section
        className="pt-28 pb-16"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <div className="container-app max-w-3xl text-center">
          <span className="badge badge-accent mb-5 inline-flex">
            Free Step-by-Step Guide
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-5 leading-tight">
            How to Apply to a{" "}
            <span className="text-gradient">University in China</span>
          </h1>
          <p
            className="text-lg md:text-xl leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            From choosing your program to landing in China — here&apos;s
            everything you need to know.
          </p>
        </div>
      </section>

      {/* ── Section 2: Steps ────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-app max-w-3xl">
          <div className="space-y-6">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="flex gap-5 md:gap-7">
                  {/* Left: number + connecting line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg font-heading z-10"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)",
                        color: "#fff",
                        boxShadow: "0 4px 20px var(--color-accent-glow)",
                      }}
                    >
                      {step.number}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div
                        className="w-px flex-1 mt-2"
                        style={{
                          background:
                            "linear-gradient(to bottom, var(--color-accent-muted), transparent)",
                          minHeight: "2rem",
                        }}
                      />
                    )}
                  </div>

                  {/* Right: card content */}
                  <div
                    className="glass glass-hover flex-1 p-6 mb-2"
                    style={{ marginBottom: idx < STEPS.length - 1 ? "0" : "0" }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "var(--color-accent-muted)" }}
                      >
                        <Icon
                          size={18}
                          style={{ color: "var(--color-accent)" }}
                        />
                      </div>
                      <div>
                        <h3
                          className="font-heading font-bold text-lg mb-2"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {step.title}
                        </h3>
                        <p
                          className="text-sm leading-relaxed"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 3: FAQ ──────────────────────────────────────────────────── */}
      <section
        className="section"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <div className="container-app max-w-3xl">
          <div className="text-center mb-12">
            <span className="badge badge-accent mb-4 inline-flex">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-black">
              Common Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="glass overflow-hidden">
                  <button
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left transition-colors duration-200"
                    style={{
                      background: isOpen
                        ? "var(--color-accent-muted)"
                        : "transparent",
                    }}
                    aria-expanded={isOpen}
                  >
                    <span
                      className="font-heading font-semibold text-sm md:text-base"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={18}
                      className="flex-shrink-0 transition-transform duration-300"
                      style={{
                        color: "var(--color-accent)",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: isOpen ? "300px" : "0px",
                    }}
                  >
                    <p
                      className="px-5 pb-5 text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Section 4: Final CTA ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-app max-w-2xl">
          <div className="glass-elevated p-8 md:p-12 text-center">
            {/* Decorative accent glow */}
            <div
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: "var(--color-accent-muted)" }}
            >
              <MessageCircle
                size={30}
                style={{ color: "var(--color-accent)" }}
              />
            </div>

            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Ready to Start Your{" "}
              <span className="text-gradient">Application?</span>
            </h2>

            <p
              className="text-lg mb-8 max-w-md mx-auto"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Our advisors are ready to guide you — for free.
            </p>

            <a
              href="https://wa.me/message/TOBEADDED"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent text-base px-8 py-4"
              style={{ fontSize: "1rem" }}
            >
              <MessageCircle size={20} />
              Chat With Us on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
