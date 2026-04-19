// src/app/iq-test/IQQuestion.tsx
"use client";
import { IQQuestionData, SymbolCode } from "./iqTestData";

// ── Symbol SVG renderer ───────────────────────────────────────────────────

function SymbolSVG({ code, size = 32 }: { code: string; size?: number }) {
  const s = size;
  const c = s / 2;
  const r = s * 0.38;
  const color = "#E8F5F0";
  const stroke = color;
  const sw = s * 0.055;

  const shapes: Record<string, React.ReactNode> = {
    circle_slash: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={c - r * 0.7} y1={c + r * 0.7} x2={c + r * 0.7} y2={c - r * 0.7} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    square_inner: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect x={c - r} y={c - r} width={r * 2} height={r * 2} fill="none" stroke={stroke} strokeWidth={sw} />
        <rect x={c - r * 0.5} y={c - r * 0.5} width={r} height={r} fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    triangle_line: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c},${c - r} ${c + r},${c + r} ${c - r},${c + r}`} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={c} y1={c - r} x2={c + r} y2={c + r} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    triangle_empty: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c},${c - r} ${c + r},${c + r} ${c - r},${c + r}`} fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    circle_cross: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={c} y1={c - r} x2={c} y2={c + r} stroke={stroke} strokeWidth={sw} />
        <line x1={c - r} y1={c} x2={c + r} y2={c} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    rect_line: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect x={c - r} y={c - r * 0.65} width={r * 2} height={r * 1.3} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={c - r} y1={c} x2={c + r} y2={c} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    circle_empty: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    square_cross: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect x={c - r} y={c - r} width={r * 2} height={r * 2} fill="none" stroke={stroke} strokeWidth={sw} />
        <line x1={c - r} y1={c - r} x2={c + r} y2={c + r} stroke={stroke} strokeWidth={sw} />
        <line x1={c + r} y1={c - r} x2={c - r} y2={c + r} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    triangle_right: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c - r * 0.7},${c - r} ${c + r},${c} ${c - r * 0.7},${c + r}`} fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    diamond_empty: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c},${c - r} ${c + r},${c} ${c},${c + r} ${c - r},${c}`} fill="none" stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    diamond_full: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c},${c - r} ${c + r},${c} ${c},${c + r} ${c - r},${c}`} fill={color} stroke={stroke} strokeWidth={sw} />
      </svg>
    ),
    circle_full: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <circle cx={c} cy={c} r={r} fill={color} />
      </svg>
    ),
    square_full: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <rect x={c - r} y={c - r} width={r * 2} height={r * 2} fill={color} />
      </svg>
    ),
    triangle_full: (
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <polygon points={`${c},${c - r} ${c + r},${c + r} ${c - r},${c + r}`} fill={color} />
      </svg>
    ),
  };

  return (shapes[code] as React.ReactElement) ?? (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <text x={c} y={c + 5} textAnchor="middle" fill={color} fontSize={s * 0.4}>?</text>
    </svg>
  );
}

// ── Rotation shape renderer ───────────────────────────────────────────────

function RotationShape({ shape, degrees, size = 70 }: { shape: string; degrees: number; size?: number }) {
  const paths: Record<string, string> = {
    L:     "M10,10 L10,60 L35,60 L35,45 L25,45 L25,10 Z",
    T:     "M10,10 L60,10 L60,25 L42,25 L42,60 L28,60 L28,25 L10,25 Z",
    F:     "M10,10 L60,10 L60,25 L28,25 L28,38 L55,38 L55,50 L28,50 L28,65 L10,65 Z",
    Z:     "M10,10 L60,10 L60,28 L30,28 L60,48 L60,65 L10,65 L10,48 L40,48 L10,28 Z",
    arrow: "M35,5 L65,35 L48,35 L48,65 L22,65 L22,35 L5,35 Z",
    S:     "M30,10 L60,10 L60,38 L10,38 L10,60 L40,60 L40,50 L20,50 L20,40 L60,40 L60,60 L10,60 L10,35 L55,35 L55,18 L20,18 L20,28 L40,28 L40,38",
    J:     "M30,10 L50,10 L50,50 L35,50 L35,60 L10,60 L10,45 L25,45 L25,10 Z",
    Y:     "M25,10 L35,35 L10,10 L20,20 L35,45 L35,65 L45,65 L45,45 L60,20 L50,10 L35,35 Z",
    E:     "M10,10 L60,10 L60,25 L25,25 L25,33 L55,33 L55,45 L25,45 L25,53 L60,53 L60,65 L10,65 Z",
  };
  const p = paths[shape] || paths["L"];
  return (
    <svg width={size} height={size} viewBox="0 0 70 70">
      <g transform={`rotate(${degrees} 35 35)`}>
        <path d={p} fill="rgba(72,197,156,0.15)" stroke="#48C59C" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// ── Sequence shape renderer ───────────────────────────────────────────────

function SeqShape({ shape, fill, size }: { shape: string; fill: string; size: number }) {
  const px = 16 + size * 10;
  const c = px / 2;
  const r = px * 0.38;
  const filled = fill === "full";
  const dashed = fill === "dashed";
  const fg = "#E8F5F0";
  const dashArr = dashed ? "4 3" : undefined;

  const shapeMap: Record<string, React.ReactNode> = {
    circle:   <circle cx={c} cy={c} r={r} fill={filled ? fg : "none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
    square:   <rect x={c - r} y={c - r} width={r * 2} height={r * 2} fill={filled ? fg : "none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
    triangle: <polygon points={`${c},${c - r} ${c + r},${c + r} ${c - r},${c + r}`} fill={filled ? fg : "none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
    diamond:  <polygon points={`${c},${c - r} ${c + r},${c} ${c},${c + r} ${c - r},${c}`} fill={filled ? fg : "none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
    star:     <polygon points={Array.from({length:10},(_,i)=>{const a=(i*36-90)*Math.PI/180;const rad=i%2===0?r:r*0.45;return `${c+rad*Math.cos(a)},${c+rad*Math.sin(a)}`}).join(" ")} fill={filled?fg:"none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
    pentagon: <polygon points={Array.from({length:5},(_,i)=>{const a=(i*72-90)*Math.PI/180;return `${c+r*Math.cos(a)},${c+r*Math.sin(a)}`}).join(" ")} fill={filled?fg:"none"} stroke={fg} strokeWidth="2" strokeDasharray={dashArr} />,
  };

  return (
    <svg width={px} height={px} viewBox={`0 0 ${px} ${px}`}>
      {shapeMap[shape]}
    </svg>
  );
}

// ── Mirror renderer ───────────────────────────────────────────────────────

function MirrorShape({ path, axis, isOption = false, size = 80 }: {
  path: string; axis: "vertical" | "horizontal"; isOption?: boolean; size?: number;
}) {
  const tf = axis === "vertical"
    ? `scale(-1,1) translate(-80,0)`
    : `scale(1,-1) translate(0,-80)`;

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <path
        d={path}
        fill="rgba(72,197,156,0.15)"
        stroke="#48C59C"
        strokeWidth="2"
        strokeLinejoin="round"
        transform={isOption ? tf : undefined}
      />
    </svg>
  );
}

// ── Visual Math renderer ──────────────────────────────────────────────────

const MATH_SHAPES: Record<string, React.ReactNode> = {
  circle:   <circle cx="16" cy="16" r="12" fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
  square:   <rect x="4" y="4" width="24" height="24" fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
  triangle: <polygon points="16,4 28,28 4,28" fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
  diamond:  <polygon points="16,2 30,16 16,30 2,16" fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
  star:     <polygon points="16,3 19,13 29,13 21,19 24,29 16,23 8,29 11,19 3,13 13,13" fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
  pentagon: <polygon points={Array.from({length:5},(_,i)=>{const a=(i*72-90)*Math.PI/180;return `${16+14*Math.cos(a)},${16+14*Math.sin(a)}`}).join(" ")} fill="rgba(72,197,156,0.2)" stroke="#48C59C" strokeWidth="2" />,
};

// ── Main component ────────────────────────────────────────────────────────

interface Props {
  question: IQQuestionData;
  selectedIndex: number | null;
  onSelect: (index: number) => void;
}

const TYPE_LABEL: Record<string, string> = {
  matrix:        "Matrix Reasoning",
  rotation:      "Shape Rotation",
  symbol_grid:   "Symbol Grid",
  sequence:      "Visual Sequence",
  mirror:        "Mirror Reflection",
  number_series: "Number Series",
  word_problem:  "Word Problem",
  visual_math:   "Visual Math",
};

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export function IQQuestion({ question, selectedIndex, onSelect }: Props) {
  const optionCount = (question.type === "number_series" || question.type === "word_problem")
    ? (question.textOptions?.length ?? 4)
    : 6;
  const cols = optionCount === 6 ? 3 : 2;

  function playSelect() {
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
    } catch { /**/ }
  }

  function handleClick(i: number) {
    if (selectedIndex !== null) return;
    playSelect();
    onSelect(i);
  }

  // ── Question visual area ─────────────────────────────────────────────

  function renderQuestionVisual() {
    const { type, matrixData, rotationData, symbolGridData, sequenceData, mirrorData, visualMathData } = question;

    if (type === "matrix" && matrixData) {
      return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 60px)", gap: 4, margin: "0 auto", width: "fit-content" }}>
          {matrixData.cells.map((code, i) => {
            const isMissing = i === 8;
            return (
              <div key={i} style={{
                width: 60, height: 60, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isMissing ? "rgba(72,197,156,0.05)" : "rgba(255,255,255,0.04)",
                border: isMissing ? "1.5px dashed rgba(72,197,156,0.6)" : "1px solid rgba(255,255,255,0.10)",
              }}>
                {isMissing
                  ? <span style={{ color: "#48C59C", fontWeight: 700, fontSize: 18 }}>?</span>
                  : <SymbolSVG code={code} size={34} />
                }
              </div>
            );
          })}
        </div>
      );
    }

    if (type === "rotation" && rotationData) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: "rgba(232,245,240,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>Base shape</div>
          <RotationShape shape={rotationData.shape} degrees={rotationData.baseDegrees} size={80} />
        </div>
      );
    }

    if (type === "symbol_grid" && symbolGridData) {
      const { size, cells } = symbolGridData;
      return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${size}, 52px)`, gap: 4, margin: "0 auto", width: "fit-content" }}>
          {cells.map((code, i) => (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: code === null ? "rgba(72,197,156,0.05)" : "rgba(255,255,255,0.04)",
              border: code === null ? "1.5px dashed rgba(72,197,156,0.6)" : "1px solid rgba(255,255,255,0.10)",
            }}>
              {code === null
                ? <span style={{ color: "#48C59C", fontWeight: 700, fontSize: 16 }}>?</span>
                : <SymbolSVG code={code} size={30} />
              }
            </div>
          ))}
        </div>
      );
    }

    if (type === "sequence" && sequenceData) {
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
          {sequenceData.items.map((item, i) => (
            <div key={i} style={{
              width: 54, height: 54, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: item === null ? "rgba(72,197,156,0.05)" : "rgba(255,255,255,0.04)",
              border: item === null ? "1.5px dashed rgba(72,197,156,0.6)" : "1px solid rgba(255,255,255,0.10)",
            }}>
              {item === null
                ? <span style={{ color: "#48C59C", fontWeight: 700, fontSize: 18 }}>?</span>
                : <SeqShape shape={item.shape} fill={item.fill} size={item.size} />
              }
            </div>
          ))}
        </div>
      );
    }

    if (type === "mirror" && mirrorData) {
      return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 11, color: "rgba(232,245,240,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>
            Find the {mirrorData.axis} mirror
          </div>
          <MirrorShape path={mirrorData.basePath} axis={mirrorData.axis} isOption={false} size={90} />
        </div>
      );
    }

    if (type === "visual_math" && visualMathData) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
          {visualMathData.rows.map((row, ri) => (
            <div key={ri} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {row.map((token, ti) => {
                if (["=", "+", "-", "×"].includes(token)) {
                  return <span key={ti} style={{ color: "rgba(232,245,240,0.5)", fontSize: 18, fontWeight: 600 }}>{token}</span>;
                }
                if (MATH_SHAPES[token]) {
                  return (
                    <svg key={ti} width="32" height="32" viewBox="0 0 32 32">
                      {MATH_SHAPES[token]}
                    </svg>
                  );
                }
                return (
                  <span key={ti} style={{
                    color: token === "?" ? "#48C59C" : "#E8F5F0",
                    fontSize: token === "?" ? 22 : 16,
                    fontWeight: 700, minWidth: 28, textAlign: "center",
                  }}>{token}</span>
                );
              })}
            </div>
          ))}
        </div>
      );
    }

    return null;
  }

  // ── Option renderer ───────────────────────────────────────────────────

  function renderOption(i: number) {
    const { type, textOptions, matrixData, rotationData, symbolGridData, sequenceData, mirrorData } = question;
    const isSelected = selectedIndex === i;

    let content: React.ReactNode;

    if ((type === "number_series" || type === "word_problem" || type === "visual_math") && textOptions) {
      content = <span style={{ fontSize: 13, color: "#E8F5F0", fontWeight: 500 }}>{textOptions[i]}</span>;
    } else if (type === "matrix" && matrixData) {
      content = <SymbolSVG code={matrixData.options[i]} size={28} />;
    } else if (type === "rotation" && rotationData) {
      content = <RotationShape shape={rotationData.shape} degrees={rotationData.optionDegrees[i]} size={44} />;
    } else if (type === "symbol_grid" && symbolGridData) {
      content = <SymbolSVG code={symbolGridData.options[i]} size={28} />;
    } else if (type === "sequence" && sequenceData && sequenceData.options[i]) {
      const opt = sequenceData.options[i];
      content = <SeqShape shape={opt.shape} fill={opt.fill} size={opt.size} />;
    } else if (type === "mirror" && mirrorData) {
      content = <MirrorShape path={mirrorData.optionPaths[i]} axis={mirrorData.axis} isOption={true} size={44} />;
    } else {
      content = <span style={{ fontSize: 13, color: "#E8F5F0" }}>?</span>;
    }

    return (
      <button
        key={i}
        onClick={() => handleClick(i)}
        style={{
          background: isSelected ? "rgba(72,197,156,0.19)" : "rgba(255,255,255,0.06)",
          border: isSelected ? "1px solid #48C59C" : "1px solid rgba(255,255,255,0.16)",
          borderTop: isSelected ? "1px solid rgba(93,212,174,0.75)" : "1px solid rgba(255,255,255,0.28)",
          borderRadius: 14, padding: "10px 8px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 8,
          backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)",
          boxShadow: isSelected
            ? "inset 0 1.5px 0 rgba(255,255,255,.30),0 6px 20px rgba(72,197,156,.28)"
            : "inset 0 1.5px 0 rgba(255,255,255,.22),inset 0 -1px 0 rgba(0,0,0,.18)",
          transform: isSelected ? "translateY(-2px) scale(1.02)" : undefined,
          transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          width: "100%",
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: 7, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 10, fontWeight: 700,
          background: isSelected ? "#48C59C" : "rgba(255,255,255,0.08)",
          border: isSelected ? "1px solid #48C59C" : "1px solid rgba(255,255,255,0.15)",
          color: isSelected ? "#030806" : "rgba(232,245,240,0.58)",
        }}>
          {OPTION_LABELS[i]}
        </div>
        {content}
      </button>
    );
  }

  return (
    <div>
      {/* Type label */}
      <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(232,245,240,0.38)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>
        {TYPE_LABEL[question.type] ?? question.type}
      </div>

      {/* Prompt text */}
      <div style={{ fontSize: 16, fontWeight: 700, color: "#E8F5F0", lineHeight: 1.45, marginBottom: 16, letterSpacing: "-0.2px" }}>
        {question.prompt}
      </div>

      {/* Visual area */}
      {renderQuestionVisual() !== null && (
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderTop: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 14, padding: 16, marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120,
        }}>
          {renderQuestionVisual()}
        </div>
      )}

      {/* Options grid */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8 }}>
        {Array.from({ length: optionCount }, (_, i) => renderOption(i))}
      </div>
    </div>
  );
}
