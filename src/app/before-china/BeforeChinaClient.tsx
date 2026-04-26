"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { ServiceLeadModal } from "@/components/ui/ServiceLeadModal";
import { FAQAccordion } from "@/components/ui/FAQAccordion";

// ── Checklist items ───────────────────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  "Valid passport (min. 6 months validity)",
  "Student visa (X1 for long-term study)",
  "Admission letter from university",
  "JW202 or JW201 form",
  "Academic transcripts (notarized)",
  "Health examination record",
  "Non-criminal background check",
  "Study plan / personal statement",
  "Sufficient funds proof (bank statement)",
  "Travel and health insurance",
  "Chinese SIM card plan (research options)",
  "WeChat and Alipay accounts setup",
];

const STORAGE_KEY = "before-china-checklist";

// ── What to Pack table ────────────────────────────────────────────────────────

const PACK_TABLE = [
  { category: "Documents", items: "Passport copies, degree certificates, photos" },
  { category: "Electronics", items: "Laptop, power adapters (China uses Type A/I)" },
  { category: "Medicine", items: "Personal medications, first-aid kit" },
  { category: "Clothing", items: "4-season appropriate if going north" },
  { category: "Money", items: "USD/EUR cash for first week, notify your bank" },
  { category: "Comfort", items: "Food from home, familiar items" },
];

// ── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How early should I arrive before my semester starts?",
    a: "Aim to arrive 1–2 weeks early. You need time for university registration, medical check, bank account, SIM card, and settling in.",
  },
  {
    q: "Do I need a VPN in China?",
    a: "Many popular international apps and websites are restricted in China. Research your options before departure.",
  },
  {
    q: "What is the JW202 form?",
    a: "The JW202 is a visa application form issued by your Chinese university, required to apply for your student visa at the Chinese embassy in your country.",
  },
  {
    q: "Can I bring my phone from home?",
    a: "Yes, as long as it supports the frequency bands used in China (most modern phones do). You'll need a local SIM or international plan.",
  },
  {
    q: "What should I do if I need medical care in China?",
    a: "University health centers handle most common issues. For serious cases, international-friendly hospitals in major cities have English-speaking staff.",
  },
  {
    q: "Is homesickness common?",
    a: "Very common, especially in the first few months. Joining student clubs, staying in touch with family via WeChat, and exploring your city helps enormously.",
  },
];

// ── CSC tips ─────────────────────────────────────────────────────────────────

const CSC_TIPS = [
  "Apply early — most deadlines are February to April",
  "Write a compelling study plan (1,500–2,000 words)",
  "Get strong recommendation letters from professors",
  "Research your supervisors before applying",
  "Apply to both university and CSC streams simultaneously",
];

// ── Component ────────────────────────────────────────────────────────────────

export function BeforeChinaClient() {
  const [checked, setChecked] = useState<boolean[]>(
    Array(CHECKLIST_ITEMS.length).fill(false)
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalService, setModalService] = useState<"interview_prep" | "csca">(
    "interview_prep"
  );

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: boolean[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length === CHECKLIST_ITEMS.length) {
          setChecked(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  function toggleItem(index: number) {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  }

  function openModal(service: "interview_prep" | "csca") {
    setModalService(service);
    setModalOpen(true);
  }

  const completedCount = checked.filter(Boolean).length;

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        className="section"
        style={{ paddingTop: "9rem", paddingBottom: "4rem" }}
      >
        <div className="container-app" style={{ textAlign: "center" }}>
          <div
            className="badge badge-accent"
            style={{ marginBottom: "1.25rem" }}
          >
            Student Preparation Guide
          </div>
          <h1
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              color: "var(--color-text-primary)",
              marginBottom: "1.25rem",
              lineHeight: 1.15,
            }}
          >
            Before Coming to China
          </h1>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "1.125rem",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            The complete preparation guide for international students heading to
            China.
          </p>
        </div>
      </section>

      {/* ── Video Section ───────────────────────────────────────────── */}
      <section className="section" style={{ paddingTop: "2rem" }}>
        <div className="container-app" style={{ maxWidth: "800px" }}>
          <h2
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 800,
              fontSize: "1.75rem",
              color: "var(--color-text-primary)",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Watch: What to Expect as a Student in China
          </h2>

          <div
            className="glass"
            style={{ overflow: "hidden", borderRadius: "1.25rem" }}
          >
            {/* 16:9 responsive wrapper */}
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
              }}
            >
              <iframe
                src="https://www.youtube.com/embed/zchQDcqfWaM"
                title="What to Expect as a Student in China"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
              />
            </div>
          </div>

          <p
            style={{
              textAlign: "center",
              color: "var(--color-text-tertiary)",
              fontSize: "0.85rem",
              marginTop: "0.75rem",
            }}
          >
            Video: A day in the life of an international student in China
          </p>
        </div>
      </section>

      {/* ── Pre-Departure Checklist ─────────────────────────────────── */}
      <section className="section">
        <div className="container-app" style={{ maxWidth: "700px" }}>
          <h2
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 800,
              fontSize: "1.75rem",
              color: "var(--color-text-primary)",
              marginBottom: "0.5rem",
            }}
          >
            Your Pre-Departure Checklist
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "0.9rem",
              marginBottom: "1.5rem",
            }}
          >
            {completedCount} of {CHECKLIST_ITEMS.length} completed
          </p>

          {/* Progress bar */}
          <div
            style={{
              height: "6px",
              background: "var(--glass-bg)",
              borderRadius: "9999px",
              overflow: "hidden",
              marginBottom: "1.75rem",
              border: "1px solid var(--glass-border-subtle)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${(completedCount / CHECKLIST_ITEMS.length) * 100}%`,
                background:
                  "linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)",
                borderRadius: "9999px",
                transition: "width 0.35s ease",
              }}
            />
          </div>

          <div className="glass" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {CHECKLIST_ITEMS.map((item, i) => (
              <button
                key={i}
                onClick={() => toggleItem(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.875rem",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.75rem",
                  transition: "background 0.18s",
                  width: "100%",
                  ...(checked[i]
                    ? { background: "var(--color-accent-muted)" }
                    : {}),
                }}
              >
                {/* Custom checkbox */}
                <span
                  style={{
                    flexShrink: 0,
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    border: checked[i]
                      ? "2px solid var(--color-accent)"
                      : "2px solid var(--glass-border)",
                    background: checked[i]
                      ? "var(--color-accent)"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.18s ease",
                  }}
                >
                  {checked[i] && <Check size={13} color="#fff" strokeWidth={3} />}
                </span>
                <span
                  style={{
                    color: checked[i]
                      ? "var(--color-text-secondary)"
                      : "var(--color-text-primary)",
                    fontSize: "0.9rem",
                    textDecoration: checked[i] ? "line-through" : "none",
                    transition: "color 0.18s",
                  }}
                >
                  {item}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── What to Pack ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-app" style={{ maxWidth: "760px" }}>
          <h2
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 800,
              fontSize: "1.75rem",
              color: "var(--color-text-primary)",
              marginBottom: "1.5rem",
            }}
          >
            What to Pack
          </h2>

          <div
            className="glass"
            style={{ overflow: "hidden" }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--color-accent-muted)",
                    borderBottom: "1px solid var(--glass-border-subtle)",
                  }}
                >
                  <th
                    style={{
                      padding: "0.875rem 1.25rem",
                      textAlign: "left",
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 700,
                      color: "var(--color-accent)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      width: "30%",
                    }}
                  >
                    Category
                  </th>
                  <th
                    style={{
                      padding: "0.875rem 1.25rem",
                      textAlign: "left",
                      fontFamily: "Montserrat, sans-serif",
                      fontWeight: 700,
                      color: "var(--color-accent)",
                      fontSize: "0.8rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Items
                  </th>
                </tr>
              </thead>
              <tbody>
                {PACK_TABLE.map((row, i) => (
                  <tr
                    key={i}
                    style={{
                      borderBottom:
                        i < PACK_TABLE.length - 1
                          ? "1px solid var(--glass-border-subtle)"
                          : "none",
                    }}
                  >
                    <td
                      style={{
                        padding: "0.875rem 1.25rem",
                        fontWeight: 600,
                        fontFamily: "Montserrat, sans-serif",
                        color: "var(--color-text-primary)",
                        fontSize: "0.875rem",
                        verticalAlign: "top",
                      }}
                    >
                      {row.category}
                    </td>
                    <td
                      style={{
                        padding: "0.875rem 1.25rem",
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.6,
                      }}
                    >
                      {row.items}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── CSC Scholarship Tips ─────────────────────────────────────── */}
      <section className="section">
        <div className="container-app" style={{ maxWidth: "700px" }}>
          <h2
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 800,
              fontSize: "1.75rem",
              color: "var(--color-text-primary)",
              marginBottom: "1.5rem",
            }}
          >
            CSC Scholarship Preparation Tips
          </h2>

          <div
            className="glass"
            style={{ padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {CSC_TIPS.map((tip, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                }}
              >
                {/* Accent number circle */}
                <span
                  style={{
                    flexShrink: 0,
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 800,
                    fontSize: "0.75rem",
                    marginTop: "0.1rem",
                  }}
                >
                  {i + 1}
                </span>
                <p
                  style={{
                    color: "var(--color-text-primary)",
                    fontSize: "0.925rem",
                    lineHeight: 1.6,
                  }}
                >
                  {tip}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
      <section
        className="section"
        style={{ background: "var(--color-bg-secondary)" }}
      >
        <div className="container-app" style={{ maxWidth: "700px" }}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span
              className="badge badge-accent"
              style={{ marginBottom: "1rem" }}
            >
              FAQ
            </span>
            <h2
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                color: "var(--color-text-primary)",
              }}
            >
              Frequently Asked Questions
            </h2>
          </div>
          <FAQAccordion items={FAQS} />
        </div>
      </section>

      {/* ── Free Interview Prep CTA ──────────────────────────────────── */}
      <section className="section">
        <div className="container-app" style={{ maxWidth: "700px" }}>
          <div
            className="glass"
            style={{
              padding: "2.5rem",
              textAlign: "center",
              border: "1px solid rgba(72,197,156,0.25)",
            }}
          >
            <div
              className="badge badge-accent"
              style={{ marginBottom: "1rem" }}
            >
              100% Free
            </div>
            <h2
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 800,
                fontSize: "1.65rem",
                color: "var(--color-text-primary)",
                marginBottom: "0.875rem",
              }}
            >
              Free University Interview Preparation
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "1rem",
                lineHeight: 1.7,
                marginBottom: "1.75rem",
                maxWidth: "480px",
                margin: "0 auto 1.75rem",
              }}
            >
              We help international students prepare for their university
              admission interviews — completely free.
            </p>
            <button
              className="btn-accent"
              onClick={() => openModal("interview_prep")}
              style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}
            >
              Get Free Interview Prep
            </button>
          </div>
        </div>
      </section>

      {/* ── CSCA Section ─────────────────────────────────────────────── */}
      <section className="section">
        <div className="container-app" style={{ maxWidth: "700px" }}>
          <div
            className="glass"
            style={{
              padding: "2.5rem",
            }}
          >
            <h2
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontWeight: 800,
                fontSize: "1.65rem",
                color: "var(--color-text-primary)",
                marginBottom: "0.875rem",
              }}
            >
              China Scholastic Competency Assessment (CSCA)
            </h2>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "1rem",
                lineHeight: 1.7,
                marginBottom: "1.25rem",
              }}
            >
              The CSCA evaluates your academic aptitude for Chinese university
              programs. Some universities require it for admission.
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
              }}
            >
              {[
                "Academic reasoning",
                "Language aptitude",
                "Critical thinking",
              ].map((item) => (
                <li
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    color: "var(--color-text-primary)",
                    fontSize: "0.925rem",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "var(--color-accent)",
                      flexShrink: 0,
                    }}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <button
              className="btn-accent"
              onClick={() => openModal("csca")}
              style={{ fontSize: "1rem", padding: "0.75rem 2rem" }}
            >
              Register for CSCA Assessment
            </button>
          </div>
        </div>
      </section>

      {/* ── Modal ───────────────────────────────────────────────────── */}
      <ServiceLeadModal
        serviceType={modalService}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
