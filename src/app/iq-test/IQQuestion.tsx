"use client";
import { IQQuestion as IQQuestionType } from "./iqTestData";

const CELL_COLOR: Record<string, string> = {
  "#48C59C": "#48C59C",
  "#1f6b51": "#1f6b51",
  "#0a2a1e": "#0a2a1e",
};

interface Props {
  question: IQQuestionType;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

export function IQQuestion({ question, selectedIndex, onSelect }: Props) {
  const labels = ["A", "B", "C", "D"];

  const playSelect = () => {
    try {
      const ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      [[523, 0], [659, 60], [784, 120]].forEach(([freq, delay]) => {
        setTimeout(() => {
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.type = "sine"; o.frequency.value = freq;
          g.gain.setValueAtTime(0.12, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
          o.start(); o.stop(ac.currentTime + 0.12);
        }, delay);
      });
    } catch {}
  };

  const handleSelect = (i: number) => {
    if (selectedIndex !== null) return;
    playSelect();
    onSelect(i);
  };

  return (
    <div>
      <div style={{ fontSize:11,fontWeight:600,color:"rgba(232,245,240,0.38)",textTransform:"uppercase",letterSpacing:"1px",marginBottom:10 }}>
        {question.type === "matrix" ? "Matrix Reasoning"
          : question.type === "number_series" ? "Number Series"
          : question.type === "verbal" ? "Verbal Analogy"
          : "Spatial Rotation"}
      </div>
      <div style={{ fontSize:18,fontWeight:700,color:"#E8F5F0",lineHeight:1.4,marginBottom:20,letterSpacing:"-0.2px" }}>
        {question.prompt}
      </div>

      {question.matrixGrid && (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,54px)",gridTemplateRows:"repeat(3,54px)",gap:6,margin:"0 auto 20px",width:"fit-content" }}>
          {question.matrixGrid.map((cell, i) => (
            <div key={i} style={{
              width:54,height:54,borderRadius:12,
              display:"flex",alignItems:"center",justifyContent:"center",
              background: cell === "?" ? "rgba(72,197,156,0.05)" : CELL_COLOR[cell] ? `${CELL_COLOR[cell]}${cell === "#48C59C" ? "DD" : cell === "#1f6b51" ? "99" : "44"}` : "rgba(255,255,255,0.06)",
              border: cell === "?" ? "1.5px dashed rgba(72,197,156,0.55)" : cell === "#48C59C" ? "1px solid rgba(72,197,156,0.9)" : "1px solid rgba(255,255,255,0.12)",
              boxShadow: cell === "#48C59C" ? "inset 0 1px 0 rgba(255,255,255,.35),0 0 14px rgba(72,197,156,.4)" : undefined,
              fontSize:22,color:"rgba(72,197,156,0.8)",fontWeight:700,
              animation: cell === "?" ? "iqPulseQ 2s ease-in-out infinite" : undefined,
            }}>
              {cell === "?" ? "?" : null}
            </div>
          ))}
        </div>
      )}

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
        {question.options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              style={{
                background: isSelected ? "rgba(72,197,156,0.19)" : "rgba(255,255,255,0.06)",
                border: isSelected ? "1px solid #48C59C" : "1px solid rgba(255,255,255,0.16)",
                borderTop: isSelected ? "1px solid rgba(93,212,174,0.75)" : "1px solid rgba(255,255,255,0.28)",
                borderRadius:16,padding:"14px 16px",cursor:"pointer",
                display:"flex",alignItems:"center",gap:10,
                backdropFilter:"blur(18px)",WebkitBackdropFilter:"blur(18px)",
                boxShadow: isSelected
                  ? "inset 0 1.5px 0 rgba(255,255,255,.30),0 8px 28px rgba(72,197,156,.30),0 0 0 1px rgba(72,197,156,.28)"
                  : "inset 0 1.5px 0 rgba(255,255,255,.22),inset 0 -1px 0 rgba(0,0,0,.18)",
                transform: isSelected ? "translateY(-2px) scale(1.025)" : undefined,
                transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                width:"100%",textAlign:"left",
              }}
            >
              <div style={{
                width:28,height:28,borderRadius:9,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:11,fontWeight:700,transition:"all 0.2s",
                background: isSelected ? "#48C59C" : "rgba(255,255,255,0.08)",
                border: isSelected ? "1px solid #48C59C" : "1px solid rgba(255,255,255,0.15)",
                color: isSelected ? "#030806" : "rgba(232,245,240,0.58)",
                boxShadow:"inset 0 1px 0 rgba(255,255,255,0.22)",
              }}>
                {labels[i]}
              </div>
              <span style={{ fontSize:13,color:"#E8F5F0",fontWeight:500 }}>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
