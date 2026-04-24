"use client";
import { useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  QUESTION_BANK,
  getVersionQuestions,
  getTimerSeconds,
  scoreSession,
  pickVersion,
  IQQuestionData,
  SessionAnswer,
  IQScores,
} from "./iqTestData";
import { IQBackground } from "./IQBackground";
import { IQTestShell } from "./IQTestShell";
import { IQQuestion as IQQuestionComp } from "./IQQuestion";
import { IQTimer } from "./IQTimer";
import { IQLeadGate } from "./IQLeadGate";
import { IQResults } from "./IQResults";

type Phase = "test" | "form" | "results";

const CATEGORY_LABELS: Record<string, string> = {
  matrix:        "Matrix Reasoning",
  rotation:      "Shape Rotation",
  symbol_grid:   "Symbol Grid",
  sequence:      "Visual Sequence",
  mirror:        "Mirror Reflection",
  number_series: "Number Series",
  word_problem:  "Word Problem",
  visual_math:   "Visual Math",
};

export function IQTestClient() {
  const versionRef   = useRef<number>(pickVersion());
  const [questions]  = useState<IQQuestionData[]>(() =>
    getVersionQuestions(QUESTION_BANK, versionRef.current)
  );
  const [phase, setPhase]             = useState<Phase>("test");
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [answers, setAnswers]         = useState<SessionAnswer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scores, setScores]           = useState<IQScores | null>(null);
  const testStartMs                   = useRef<number>(Date.now());
  const questionStartMs               = useRef<number>(Date.now());
  const [timerKey, setTimerKey]       = useState(0); // remounts IQTimer on question change

  const advance = useCallback((selectedIdx: number | null) => {
    const timeMs = Date.now() - questionStartMs.current;
    const q = questions[currentIdx];

    const answer: SessionAnswer = {
      questionId: q.id,
      selectedIndex: selectedIdx ?? -1, // -1 = timed out
      timeMs,
    };

    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setSelectedIndex(null);

    const isLast = currentIdx + 1 >= questions.length;

    if (isLast) {
      const computed = scoreSession(questions, newAnswers);
      setScores(computed);
      setPhase("form");
    } else {
      setTimeout(() => {
        setCurrentIdx(i => i + 1);
        questionStartMs.current = Date.now();
        setTimerKey(k => k + 1);
      }, selectedIdx !== null ? 350 : 0);
    }
  }, [answers, currentIdx, questions]);

  function playSelect() {
    try {
      const ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      [[400, 0, "triangle"], [600, 80, "sine"], [800, 160, "sine"]].forEach(([f, d, t]) => {
        setTimeout(() => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.type = t as OscillatorType; o.frequency.value = f as number;
          g.gain.setValueAtTime(0.10, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.18);
          o.start(); o.stop(ac.currentTime + 0.18);
        }, d as number);
      });
    } catch { /**/ }
  }

  const handleSelect = useCallback((index: number) => {
    if (selectedIndex !== null) return;
    playSelect();
    setSelectedIndex(index);
    setTimeout(() => advance(index), 350);
  }, [selectedIndex, advance]);

  const handleTimeout = useCallback(() => {
    advance(null);
  }, [advance]);

  const currentQ = questions[currentIdx];
  const timerSeconds = getTimerSeconds(currentIdx + 1);
  const totalTimeMs = Date.now() - testStartMs.current;

  if (phase === "form" && scores) {
    return (
      <IQLeadGate
        scores={scores}
        versionNumber={versionRef.current}
        totalTimeMs={totalTimeMs}
        onUnlocked={() => setPhase("results")}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0 40px", position: "relative" }}>
      <IQBackground />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 500, padding: "0 20px" }}>
        {phase === "test" && currentQ && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQ.id}
              initial={{ x: 60, opacity: 0, rotateY: -8 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              exit={{ x: -60, opacity: 0, rotateY: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
            >
              <IQTestShell
                current={currentIdx + 1}
                total={questions.length}
                category={CATEGORY_LABELS[currentQ.type] ?? currentQ.type}
                timerSlot={
                  <IQTimer
                    key={timerKey}
                    seconds={timerSeconds}
                    onExpire={handleTimeout}
                  />
                }
              >
                <IQQuestionComp
                  question={currentQ}
                  selectedIndex={selectedIndex}
                  onSelect={handleSelect}
                />
              </IQTestShell>
            </motion.div>
          </AnimatePresence>
        )}

        {phase === "results" && scores && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <IQResults scores={scores} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
