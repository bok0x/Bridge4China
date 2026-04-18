"use client";

import React from "react";

interface QuizShellProps {
  currentQuestion: number;
  totalQuestions: number;
  children: React.ReactNode;
}

export default function QuizShell({
  currentQuestion,
  totalQuestions,
  children,
}: QuizShellProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <div className="quiz-shell">
      {/* Starfield */}
      <div className="quiz-starfield" aria-hidden="true">
        {Array.from({ length: 80 }).map((_, i) => (
          <span key={i} className="quiz-star" style={getStarStyle(i)} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="quiz-progress-track">
        <div
          className="quiz-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter */}
      <div className="quiz-step-counter">
        <span className="quiz-step-label">Question</span>
        <span className="quiz-step-number">{currentQuestion + 1}</span>
        <span className="quiz-step-label">of {totalQuestions}</span>
      </div>

      {/* Question area */}
      <div className="quiz-content">{children}</div>

      <style jsx>{`
        .quiz-shell {
          position: fixed;
          inset: 0;
          background: #000000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 50;
        }

        /* Starfield */
        .quiz-starfield {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .quiz-star {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.85);
          animation: twinkle var(--duration, 3s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.3); }
        }

        /* Progress bar */
        .quiz-progress-track {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255, 255, 255, 0.08);
        }
        .quiz-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 12px var(--color-accent-glow);
        }

        /* Step counter */
        .quiz-step-counter {
          position: absolute;
          top: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: "Montserrat", sans-serif;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(232, 245, 240, 0.5);
        }
        .quiz-step-number {
          color: var(--color-accent);
          font-size: 0.88rem;
          font-weight: 800;
        }

        /* Content */
        .quiz-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 720px;
          padding: 0 1.5rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
}

function getStarStyle(index: number): React.CSSProperties {
  // Deterministic pseudo-random positions using index
  const x = ((index * 137.508 + 13) % 100).toFixed(2);
  const y = ((index * 93.701 + 7) % 100).toFixed(2);
  const size = (((index * 17 + 3) % 3) + 1).toFixed(1);
  const duration = (((index * 11 + 2) % 4) + 2).toFixed(1);
  const delay = (((index * 7 + 1) % 5)).toFixed(1);

  return {
    left: `${x}%`,
    top: `${y}%`,
    width: `${size}px`,
    height: `${size}px`,
    "--duration": `${duration}s`,
    "--delay": `${delay}s`,
  } as React.CSSProperties;
}
