"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

import QuizShell from "./QuizShell";
import QuizQuestion from "./QuizQuestion";
import QuizLeadForm from "./QuizLeadForm";
import QuizResult from "./QuizResult";
import { QUIZ_QUESTIONS, getRecommendations, Recommendation } from "./quizData";

type Phase = "quiz" | "lead_form" | "result";

export default function QuizClient() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>("quiz");
  const [direction, setDirection] = useState(1);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isMuted, setIsMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize ambient audio
  useEffect(() => {
    try {
      const audio = new Audio("/sounds/quiz-ambient.mp3");
      audio.loop = true;
      audio.volume = 0.25;
      audioRef.current = audio;

      // Try to play — browsers may block autoplay without user gesture
      audio.play().catch(() => {
        // Silently fail if autoplay is blocked
      });
    } catch {
      // Silently fail if audio cannot load
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = 0.25;
      audioRef.current.play().catch(() => {});
      setIsMuted(false);
    } else {
      audioRef.current.pause();
      setIsMuted(true);
    }
  }, [isMuted]);

  function handleBack() {
    if (currentQuestion > 0) {
      setCurrentQuestion((q) => q - 1);
      setDirection(-1); // slide right (reverse animation)
    }
  }

  function handleAnswer(questionId: string, value: string) {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Auto-advance after a short delay to let the selected state render
    setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setDirection(1);
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // Last question answered — compute recommendations and show lead form
        const recs = getRecommendations(newAnswers);
        setRecommendations(recs);
        setPhase("lead_form");
      }
    }, 350);
  }

  function handleLeadFormSuccess() {
    window.open("https://chat.whatsapp.com/CLglLgiCl0BCCv7qhquEW0", "_blank", "noopener,noreferrer");
    setPhase("result");
  }

  const question = QUIZ_QUESTIONS[currentQuestion];

  // Lead form phase — render without quiz shell chrome
  if (phase === "lead_form" || phase === "result") {
    return (
      <div className="quiz-full-screen">
        {/* Starfield background */}
        <div className="quiz-stars-bg" aria-hidden="true">
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={i} className="quiz-star-dot" style={getStarStyle(i)} />
          ))}
        </div>

        <div className="quiz-overlay-content">
          {phase === "lead_form" ? (
            <QuizLeadForm
              quizAnswers={answers}
              recommendations={recommendations}
              onSuccess={handleLeadFormSuccess}
            />
          ) : (
            <QuizResult recommendations={recommendations} />
          )}
        </div>

        {/* Mute button */}
        <MuteButton isMuted={isMuted} onToggle={toggleMute} />

        <style jsx>{`
          .quiz-full-screen {
            position: fixed;
            inset: 0;
            background: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow-y: auto;
            z-index: 50;
          }

          .quiz-stars-bg {
            position: fixed;
            inset: 0;
            pointer-events: none;
            overflow: hidden;
          }

          .quiz-star-dot {
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.75);
            animation: twinkle2 var(--duration, 3s) ease-in-out infinite;
            animation-delay: var(--delay, 0s);
          }

          @keyframes twinkle2 {
            0%, 100% { opacity: 0.1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.4); }
          }

          .quiz-overlay-content {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 960px;
            padding: 5rem 1.5rem 3rem;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
      </div>
    );
  }

  // Quiz phase
  return (
    <QuizShell
      currentQuestion={currentQuestion}
      totalQuestions={QUIZ_QUESTIONS.length}
      onBack={handleBack}
      canGoBack={currentQuestion > 0}
      isMuted={isMuted}
      onToggleMute={toggleMute}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <QuizQuestion
          key={question.id}
          question={question}
          selectedAnswer={answers[question.id]}
          onAnswer={handleAnswer}
          direction={direction}
        />
      </AnimatePresence>

      {/* Navigation hint */}
      {answers[question.id] && (
        <p className="quiz-nav-hint">
          Selecting next question...
        </p>
      )}

      {/* Mute button */}
      <MuteButton isMuted={isMuted} onToggle={toggleMute} />

      <style jsx>{`
        .quiz-nav-hint {
          margin-top: 1rem;
          font-size: 0.78rem;
          color: var(--color-text-tertiary);
          text-align: center;
          font-style: italic;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </QuizShell>
  );
}

function MuteButton({ isMuted, onToggle }: { isMuted: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isMuted ? "Unmute ambient sound" : "Mute ambient sound"}
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 200,
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "1px solid rgba(255,255,255,0.15)",
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(10px)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(232, 245, 240, 0.55)",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(72,197,156,0.15)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(72,197,156,0.4)";
        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-accent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
        (e.currentTarget as HTMLButtonElement).style.color = "rgba(232, 245, 240, 0.55)";
      }}
    >
      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
    </button>
  );
}

function getStarStyle(index: number): React.CSSProperties {
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
