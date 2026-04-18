"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import {
  buildSession, IQQuestion, SessionAnswer, IQScores
} from "./iqTestData";
import { IQBackground } from "./IQBackground";
import { IQTestShell } from "./IQTestShell";
import { IQQuestion as IQQuestionComp } from "./IQQuestion";
import { IQLockScreen } from "./IQLockScreen";
import { IQResults } from "./IQResults";

type Phase = "test" | "lock" | "results";

const CATEGORY_LABELS: Record<string, string> = {
  matrix: "Fluid Reasoning",
  number_series: "Quantitative Reasoning",
  verbal: "Verbal Comprehension",
  spatial: "Visual-Spatial",
};

function getSessionId(): string {
  const key = "iq_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); sessionStorage.setItem(key, id); }
  return id;
}

export function IQTestClient() {
  const searchParams = useSearchParams();
  const unlockSession = searchParams.get("unlock");

  const [phase, setPhase] = useState<Phase>("test");
  const [questions] = useState<IQQuestion[]>(() => buildSession());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<SessionAnswer[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [scores, setScores] = useState<IQScores | null>(null);
  const [direction] = useState<1 | -1>(1);
  const questionStartRef = useRef<number>(Date.now());
  const sessionId = useRef(getSessionId());

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!unlockSession) return;
    const saved = localStorage.getItem(`iq_answers_${unlockSession}`);
    if (!saved) return;
    const savedAnswers: SessionAnswer[] = JSON.parse(saved);
    fetch("/api/iq-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: unlockSession, answers: savedAnswers }),
    })
      .then(r => r.json())
      .then(data => { setScores(data.scores); setPhase("results"); });
  }, [unlockSession]);

  const playNext = () => {
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
    } catch {}
  };

  const handleSelect = useCallback((index: number) => {
    setSelectedIndex(index);
    const timeMs = Date.now() - questionStartRef.current;
    const answer: SessionAnswer = {
      questionId: questions[currentIdx].id,
      selectedIndex: index,
      timeMs,
    };

    setTimeout(() => {
      const newAnswers = [...answers, answer];
      setAnswers(newAnswers);
      setSelectedIndex(null);
      questionStartRef.current = Date.now();

      if (currentIdx + 1 >= questions.length) {
        localStorage.setItem(`iq_answers_${sessionId.current}`, JSON.stringify(newAnswers));
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (user) {
            fetch("/api/iq-results", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: sessionId.current, answers: newAnswers }),
            })
              .then(r => r.json())
              .then(data => { setScores(data.scores); setPhase("results"); });
          } else {
            setPhase("lock");
          }
        });
      } else {
        setCurrentIdx(i => i + 1);
      }
    }, 350);
  }, [answers, currentIdx, questions, supabase]);

  const currentQ = questions[currentIdx];

  return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"80px 0 40px",position:"relative" }}>
      <IQBackground />

      <div style={{ position:"relative",zIndex:10,width:"100%",maxWidth:480,padding:"0 20px" }}>
        {phase === "test" && currentQ && (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentQ.id}
              custom={direction}
              initial={{ x: direction * 72, opacity: 0, rotateY: direction * -9 }}
              animate={{ x: 0, opacity: 1, rotateY: 0 }}
              exit={{ x: direction * -72, opacity: 0, rotateY: direction * 9 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              onAnimationStart={() => playNext()}
            >
              <IQTestShell
                current={currentIdx + 1}
                total={questions.length}
                category={CATEGORY_LABELS[currentQ.type]}
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

        {phase === "lock" && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
            <IQLockScreen sessionId={sessionId.current} />
          </motion.div>
        )}

        {phase === "results" && scores && (
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}>
            <IQResults scores={scores} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
