"use client";

import { motion } from "framer-motion";
import { QuizQuestion as QuizQuestionType } from "./quizData";

interface QuizQuestionProps {
  question: QuizQuestionType;
  selectedAnswer: string | undefined;
  onAnswer: (questionId: string, value: string) => void;
  direction: number; // 1 = forward, -1 = backward
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export default function QuizQuestion({
  question,
  selectedAnswer,
  onAnswer,
  direction,
}: QuizQuestionProps) {
  return (
    <motion.div
      key={question.id}
      custom={direction}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
      className="quiz-question-wrapper"
    >
      {/* Category badge */}
      <div className="quiz-category-badge">
        <span className="badge badge-accent">{question.category}</span>
      </div>

      {/* Question card */}
      <div className="quiz-card glass">
        <h2 className="quiz-question-text">{question.question}</h2>

        <div className="quiz-options-grid">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.value;
            return (
              <button
                key={option.value}
                className={`quiz-option ${isSelected ? "quiz-option--selected" : ""}`}
                onClick={() => onAnswer(question.id, option.value)}
              >
                <span className="quiz-option-indicator" />
                <span className="quiz-option-label">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .quiz-question-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.25rem;
        }

        .quiz-category-badge {
          text-align: center;
        }

        .quiz-card {
          width: 100%;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .quiz-question-text {
          font-family: "Montserrat", sans-serif;
          font-size: clamp(1.15rem, 3vw, 1.5rem);
          font-weight: 700;
          color: var(--color-text-primary);
          text-align: center;
          line-height: 1.35;
          letter-spacing: -0.01em;
        }

        .quiz-options-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
        }

        .quiz-option {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.875rem 1.25rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          color: var(--color-text-secondary);
          font-family: "Inter", sans-serif;
          font-size: 0.9rem;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .quiz-option:hover {
          background: var(--color-accent-muted);
          border-color: rgba(72, 197, 156, 0.4);
          color: var(--color-text-primary);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(72, 197, 156, 0.15);
        }

        .quiz-option--selected {
          background: var(--color-accent-muted);
          border-color: var(--color-accent);
          color: var(--color-accent);
          box-shadow: 0 0 0 1px var(--color-accent), 0 6px 24px rgba(72, 197, 156, 0.25);
          transform: translateY(-2px);
        }

        .quiz-option-indicator {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          transition: all 0.2s ease;
        }

        .quiz-option--selected .quiz-option-indicator {
          border-color: var(--color-accent);
          background: var(--color-accent);
          box-shadow: 0 0 8px var(--color-accent-glow);
        }

        .quiz-option:hover .quiz-option-indicator {
          border-color: var(--color-accent);
        }

        .quiz-option-label {
          flex: 1;
          line-height: 1.3;
        }

        @media (max-width: 600px) {
          .quiz-card {
            padding: 1.75rem 1.25rem;
          }
          .quiz-options-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </motion.div>
  );
}
