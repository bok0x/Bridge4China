"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Recommendation } from "./quizData";

interface QuizLeadFormProps {
  quizAnswers: Record<string, string>;
  recommendations: Recommendation[];
  onOTPSent: (email: string) => void;
}

export default function QuizLeadForm({
  quizAnswers,
  recommendations,
  onOTPSent,
}: QuizLeadFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          whatsapp,
          quizAnswers,
          recommendations,
          leadSource: "quiz",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      onOTPSent(email);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="lead-form-wrapper"
    >
      <div className="lead-form-card glass">
        {/* Glow orb */}
        <div className="lead-form-glow" aria-hidden="true" />

        {/* Header */}
        <div className="lead-form-header">
          <div className="lead-form-icon">✦</div>
          <h2 className="lead-form-title">Your Report Is Ready!</h2>
          <p className="lead-form-subtitle">
            Enter your details to receive your personalized Quantum Match Report.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="lead-form-body">
          <div className="lead-form-field">
            <label htmlFor="fullName" className="lead-form-label">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Your full name"
              className="lead-form-input"
              disabled={isLoading}
            />
          </div>

          <div className="lead-form-field">
            <label htmlFor="email" className="lead-form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="lead-form-input"
              disabled={isLoading}
            />
          </div>

          <div className="lead-form-field">
            <label htmlFor="whatsapp" className="lead-form-label">
              WhatsApp Number
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              placeholder="+1 234 567 8900"
              className="lead-form-input"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="lead-form-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-accent lead-form-submit"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="lead-form-spinner" />
                Processing...
              </>
            ) : (
              "Get My Report →"
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        .lead-form-wrapper {
          width: 100%;
          max-width: 520px;
          margin: 0 auto;
        }

        .lead-form-card {
          position: relative;
          padding: 2.75rem 2.5rem;
          overflow: hidden;
        }

        .lead-form-glow {
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(72, 197, 156, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .lead-form-header {
          position: relative;
          text-align: center;
          margin-bottom: 2rem;
        }

        .lead-form-icon {
          font-size: 2rem;
          color: var(--color-accent);
          margin-bottom: 0.75rem;
          display: block;
          filter: drop-shadow(0 0 8px var(--color-accent-glow));
        }

        .lead-form-title {
          font-family: "Montserrat", sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-text-primary);
          margin-bottom: 0.5rem;
        }

        .lead-form-subtitle {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        .lead-form-body {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .lead-form-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .lead-form-label {
          font-family: "Montserrat", sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--color-text-secondary);
        }

        .lead-form-input {
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 0.875rem;
          color: var(--color-text-primary);
          font-family: "Inter", sans-serif;
          font-size: 0.92rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }

        .lead-form-input::placeholder {
          color: var(--color-text-tertiary);
        }

        .lead-form-input:focus {
          border-color: var(--color-accent);
          background: rgba(72, 197, 156, 0.05);
          box-shadow: 0 0 0 3px rgba(72, 197, 156, 0.12);
        }

        .lead-form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .lead-form-error {
          font-size: 0.85rem;
          color: #f87171;
          text-align: center;
          padding: 0.5rem;
          background: rgba(248, 113, 113, 0.08);
          border: 1px solid rgba(248, 113, 113, 0.2);
          border-radius: 0.5rem;
        }

        .lead-form-submit {
          width: 100%;
          justify-content: center;
          padding: 0.85rem 1.5rem;
          font-size: 1rem;
          border-radius: 0.875rem;
          margin-top: 0.25rem;
        }

        .lead-form-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        :global(.lead-form-spinner) {
          animation: spin 0.8s linear infinite;
        }

        @media (max-width: 540px) {
          .lead-form-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </motion.div>
  );
}
