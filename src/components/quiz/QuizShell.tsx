"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface QuizShellProps {
  currentQuestion: number;
  totalQuestions: number;
  onBack: () => void;
  canGoBack: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  children: React.ReactNode;
}

function DotsProgress({ current, total }: { current: number; total: number }) {
  const isFast = current < 5; // Q1-5 animate fast

  return (
    <>
      {/* Desktop: dots + line */}
      <div className="hidden md:flex items-center gap-0 w-full max-w-2xl mx-auto">
        {Array.from({ length: total }).map((_, i) => {
          const isPast = i < current;
          const isCurrent = i === current;
          const lineTransition = isFast ? "150ms" : "600ms";

          return (
            <div key={i} className="flex items-center" style={{ flex: i < total - 1 ? "1" : "none" }}>
              {/* Dot */}
              <div
                style={{
                  width: isCurrent ? 14 : 10,
                  height: isCurrent ? 14 : 10,
                  borderRadius: "50%",
                  background:
                    isPast || isCurrent
                      ? "var(--color-accent)"
                      : "rgba(255,255,255,0.15)",
                  boxShadow: isCurrent
                    ? "0 0 10px var(--color-accent-glow)"
                    : "none",
                  flexShrink: 0,
                  transition: `all ${lineTransition} ease`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {isPast && (
                  <span style={{ fontSize: 7, color: "#000", fontWeight: 800 }}>
                    ✓
                  </span>
                )}
              </div>
              {/* Connecting line segment (not after last dot) */}
              {i < total - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 2,
                    background: "rgba(255,255,255,0.10)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "var(--color-accent)",
                      transformOrigin: "left",
                      transition: `transform ${lineTransition} ease`,
                      transform: `scaleX(${isPast ? 1 : 0})`,
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: simple bar */}
      <div className="md:hidden w-full">
        <div
          style={{
            height: 3,
            background: "rgba(255,255,255,0.10)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((current + 1) / total) * 100}%`,
              background: "var(--color-accent)",
              transition: `width ${isFast ? "150ms" : "600ms"} ease`,
              borderRadius: 2,
            }}
          />
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--color-text-tertiary)",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          Q {current + 1} / {total}
        </p>
      </div>
    </>
  );
}

export default function QuizShell({
  currentQuestion,
  totalQuestions,
  onBack,
  canGoBack,
  children,
}: QuizShellProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="quiz-shell">
      {/* Nebula clouds (bottom layer, z-index 0) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {/* Purple nebula */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 400,
            top: "-10%",
            left: "-15%",
            background:
              "radial-gradient(ellipse, rgba(120,40,180,0.18) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Teal nebula */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 350,
            bottom: "-5%",
            right: "-10%",
            background:
              "radial-gradient(ellipse, rgba(72,197,156,0.12) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
        {/* Dark blue nebula */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 300,
            top: "40%",
            left: "30%",
            background:
              "radial-gradient(ellipse, rgba(30,60,140,0.15) 0%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
      </div>

      {/* Starfield */}
      <div className="quiz-starfield" aria-hidden="true">
        {Array.from({ length: 120 }).map((_, i) => (
          <span key={i} className="quiz-star" style={getStarStyle(i)} />
        ))}
      </div>

      {/* Celestial bodies */}
      {!shouldReduceMotion && (
        <>
          {/* Sun — warm orange, top-right area, slow drift */}
          <motion.div
            style={{
              position: "absolute",
              top: "8%",
              right: "12%",
              width: 90,
              height: 90,
              borderRadius: "50%",
              zIndex: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle, #FFF176 0%, #FFB74D 40%, #FF6F00 70%, transparent 100%)",
              boxShadow:
                "0 0 60px 20px rgba(255,183,76,0.35), 0 0 120px 40px rgba(255,111,0,0.15)",
              filter: "blur(1px)",
            }}
            animate={
              shouldReduceMotion ? {} : { x: [0, 15, -8, 0], y: [0, -10, 8, 0] }
            }
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Moon — silver/white, top-left, orbit-like slow loop */}
          <motion.div
            style={{
              position: "absolute",
              top: "15%",
              left: "8%",
              width: 48,
              height: 48,
              borderRadius: "50%",
              zIndex: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at 35% 35%, #E8E8E8 0%, #B0BEC5 50%, #78909C 100%)",
              boxShadow: "0 0 20px 6px rgba(200,200,220,0.20)",
            }}
            animate={
              shouldReduceMotion
                ? {}
                : { x: [0, 40, 80, 40, 0], y: [0, -20, 0, 20, 0] }
            }
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Earth — blue/green sphere, lower-left */}
          <motion.div
            style={{
              position: "absolute",
              bottom: "12%",
              left: "5%",
              width: 64,
              height: 64,
              borderRadius: "50%",
              zIndex: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at 40% 35%, #4FC3F7 0%, #29B6F6 20%, #1565C0 45%, #2E7D32 60%, #1B5E20 75%, #0D2137 100%)",
              boxShadow: "0 0 25px 8px rgba(79,195,247,0.20)",
              filter: "blur(0.5px)",
            }}
            animate={
              shouldReduceMotion
                ? {}
                : { x: [0, -12, 0, 12, 0], y: [0, 8, 16, 8, 0] }
            }
            transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Distant planet — purple, bottom-right corner, barely visible */}
          <motion.div
            style={{
              position: "absolute",
              bottom: "5%",
              right: "3%",
              width: 36,
              height: 36,
              borderRadius: "50%",
              zIndex: 0,
              pointerEvents: "none",
              opacity: 0.45,
              background:
                "radial-gradient(circle at 38% 32%, #CE93D8 0%, #7B1FA2 55%, #4A0072 100%)",
              boxShadow: "0 0 16px 4px rgba(206,147,216,0.15)",
            }}
            animate={shouldReduceMotion ? {} : { y: [0, -8, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Back button */}
      {canGoBack && (
        <button
          onClick={onBack}
          style={{
            position: "absolute",
            top: 20,
            left: 20,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            padding: "6px 12px",
            color: "var(--color-text-secondary)",
            fontSize: 13,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            zIndex: 10,
          }}
        >
          ← Back
        </button>
      )}

      {/* Progress dots */}
      <div className="quiz-progress-dots">
        <DotsProgress current={currentQuestion} total={totalQuestions} />
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
          z-index: 0;
        }
        .quiz-star {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.85);
          animation: twinkle var(--duration, 3s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }

        /* Progress dots wrapper */
        .quiz-progress-dots {
          position: absolute;
          top: 1.25rem;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 3rem);
          max-width: 680px;
          z-index: 10;
          padding: 0 0.5rem;
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
          margin-top: 3rem;
        }
      `}</style>

      <style>{`
        @keyframes twinkle { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.9;transform:scale(1.3)} }
        @keyframes twinkle2 { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
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
