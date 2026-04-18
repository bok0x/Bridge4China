"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Recommendation } from "./quizData";

interface QuizResultProps {
  recommendations: Recommendation[];
}

export default function QuizResult({ recommendations }: QuizResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="result-wrapper"
    >
      {/* Header */}
      <div className="result-header">
        <div className="result-badge badge badge-accent">
          ✦ Quantum Match Complete
        </div>
        <h1 className="result-title">Your Quantum Match Report</h1>
        <div className="result-title-underline" aria-hidden="true" />
        <p className="result-subtitle">
          Based on your answers, here are your top university matches:
        </p>
      </div>

      {/* Match cards */}
      <div className="result-cards">
        {recommendations.map((rec, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 + i * 0.1, ease: [0.4, 0, 0.2, 1] }}
            className={`result-card glass ${i === 0 ? "result-card--top" : ""}`}
          >
            {i === 0 && (
              <div className="result-card-best-badge">Best Match</div>
            )}

            <div className="result-card-match-pct">
              {rec.match}%
            </div>

            <div className="result-card-info">
              <h3 className="result-card-university">{rec.university}</h3>
              <p className="result-card-major">{rec.major}</p>
              <div className="result-card-location">
                <span className="result-card-location-dot" />
                {rec.city}, China
              </div>
            </div>

            <Link href="/discover" className="btn-ghost result-card-btn">
              Explore Program →
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="result-cta"
      >
        <p className="result-cta-text">Want help applying?</p>
        <a
          href="https://wa.me/212628345297"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-accent result-cta-btn"
        >
          <span>Chat with us on WhatsApp</span>
        </a>
      </motion.div>

      <style jsx>{`
        .result-wrapper {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
          padding-bottom: 3rem;
        }

        /* Header */
        .result-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .result-badge {
          margin-bottom: 0.25rem;
        }

        .result-title {
          font-family: "Montserrat", sans-serif;
          font-size: clamp(1.6rem, 4vw, 2.4rem);
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1.2;
        }

        .result-title-underline {
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
          border-radius: 9999px;
          box-shadow: 0 0 12px var(--color-accent-glow);
        }

        .result-subtitle {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
          max-width: 440px;
          line-height: 1.6;
        }

        /* Cards */
        .result-cards {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }

        .result-card {
          position: relative;
          padding: 2rem 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          text-align: center;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .result-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--glass-shadow-lg);
        }

        .result-card--top {
          border-color: rgba(72, 197, 156, 0.45);
          box-shadow: var(--glass-shadow), 0 0 0 1px rgba(72, 197, 156, 0.25), 0 0 32px rgba(72, 197, 156, 0.1);
        }

        .result-card-best-badge {
          position: absolute;
          top: -0.6rem;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.2rem 0.875rem;
          background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
          color: #fff;
          font-family: "Montserrat", sans-serif;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          border-radius: 9999px;
          white-space: nowrap;
        }

        .result-card-match-pct {
          font-family: "Montserrat", sans-serif;
          font-size: 3rem;
          font-weight: 900;
          color: var(--color-accent);
          line-height: 1;
          text-shadow: 0 0 24px rgba(72, 197, 156, 0.5);
        }

        .result-card-info {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          flex: 1;
        }

        .result-card-university {
          font-family: "Montserrat", sans-serif;
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.3;
        }

        .result-card-major {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .result-card-location {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          color: var(--color-text-tertiary);
          justify-content: center;
          margin-top: 0.15rem;
        }

        .result-card-location-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-accent);
          flex-shrink: 0;
        }

        .result-card-btn {
          width: 100%;
          justify-content: center;
          font-size: 0.85rem;
          padding: 0.6rem 1rem;
        }

        /* Bottom CTA */
        .result-cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.875rem;
          text-align: center;
        }

        .result-cta-text {
          font-size: 0.95rem;
          color: var(--color-text-secondary);
        }

        .result-cta-btn {
          padding: 0.8rem 2rem;
          font-size: 0.95rem;
        }

        @media (max-width: 600px) {
          .result-cards {
            grid-template-columns: 1fr;
          }
          .result-wrapper {
            gap: 2rem;
          }
        }
      `}</style>
    </motion.div>
  );
}
