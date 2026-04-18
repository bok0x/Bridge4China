"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface ServiceLeadModalProps {
  serviceType: "interview_prep" | "csca";
  isOpen: boolean;
  onClose: () => void;
}

const CONTENT = {
  interview_prep: {
    title: "Free University Interview Preparation",
    subtitle:
      "Get free expert coaching to ace your university interview in China.",
    submitLabel: "Get Free Coaching →",
  },
  csca: {
    title: "CSCA Assessment Registration",
    subtitle:
      "Register for the China Scholastic Competency Assessment.",
    submitLabel: "Register Now →",
  },
} as const;

export function ServiceLeadModal({
  serviceType,
  isOpen,
  onClose,
}: ServiceLeadModalProps) {
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = CONTENT[serviceType];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/interview-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, whatsapp, email, serviceType }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset after animation fades
    setTimeout(() => {
      setSuccess(false);
      setError(null);
      setFullName("");
      setWhatsapp("");
      setEmail("");
    }, 300);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
          onClick={handleClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.93 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="glass w-full max-w-md relative"
            style={{ padding: "2rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close"
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid var(--glass-border-subtle)",
                borderRadius: "0.5rem",
                cursor: "pointer",
                padding: "0.25rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-secondary)",
                transition: "background 0.2s",
              }}
            >
              <X size={18} />
            </button>

            {success ? (
              /* ── Success state ── */
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <p
                  style={{
                    fontSize: "2.5rem",
                    marginBottom: "0.75rem",
                    lineHeight: 1,
                  }}
                >
                  ✅
                </p>
                <p
                  style={{
                    color: "var(--color-text-primary)",
                    fontFamily: "Montserrat, sans-serif",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  You&apos;re all set!
                </p>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  We&apos;ll contact you on WhatsApp within 24 hours!
                </p>
                <button className="btn-accent" onClick={handleClose}>
                  Close
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <h2
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "1.25rem",
                    fontWeight: 800,
                    color: "var(--color-text-primary)",
                    marginBottom: "0.5rem",
                    paddingRight: "2rem",
                  }}
                >
                  {content.title}
                </h2>
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.875rem",
                    marginBottom: "1.5rem",
                    lineHeight: 1.6,
                  }}
                >
                  {content.subtitle}
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        marginBottom: "0.35rem",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      Full Name
                    </label>
                    <input
                      className="input-glass"
                      type="text"
                      placeholder="Your full name"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        marginBottom: "0.35rem",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      WhatsApp Phone Number
                    </label>
                    <input
                      className="input-glass"
                      type="tel"
                      placeholder="+1 234 567 8900"
                      required
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        marginBottom: "0.35rem",
                        fontFamily: "Montserrat, sans-serif",
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      className="input-glass"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {error && (
                    <p
                      style={{
                        color: "#f87171",
                        fontSize: "0.85rem",
                        background: "rgba(248,113,113,0.08)",
                        border: "1px solid rgba(248,113,113,0.2)",
                        borderRadius: "0.5rem",
                        padding: "0.5rem 0.75rem",
                      }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn-accent"
                    disabled={loading}
                    style={{ marginTop: "0.25rem", justifyContent: "center", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? "Submitting…" : content.submitLabel}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
