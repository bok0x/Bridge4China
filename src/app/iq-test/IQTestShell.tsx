"use client";
import { useEffect, useRef } from "react";

interface IQTestShellProps {
  current: number;
  total: number;
  category: string;
  children: React.ReactNode;
}

export function IQTestShell({ current, total, category, children }: IQTestShellProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const handleMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      card.style.transform = `perspective(1100px) rotateX(${dy * 9}deg) rotateY(${-dx * 9}deg)`;
      card.style.boxShadow = `
        inset 0 2px 0 rgba(255,255,255,.38),
        inset 0 1px 24px rgba(255,255,255,.04),
        inset 0 -2px 10px rgba(0,0,0,.28),
        ${dx * 26}px ${dy * 26 + 30}px 72px rgba(0,0,0,.58),
        ${dx * 8}px ${dy * 8 + 8}px 26px rgba(0,0,0,.32),
        ${dx * 5}px ${dy * 5 + 4}px 50px rgba(72,197,156,.09)
      `;
    };
    const handleLeave = () => {
      card.style.transform = "perspective(1100px) rotateX(0) rotateY(0)";
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    card.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const pct = Math.round((current / total) * 100);

  return (
    <div ref={cardRef} style={{
      background: "rgba(255,255,255,0.07)",
      backdropFilter: "url(#water-lens) blur(32px) saturate(210%) brightness(1.08)",
      WebkitBackdropFilter: "blur(32px) saturate(210%) brightness(1.08)",
      border: "1px solid rgba(255,255,255,0.20)",
      borderTop: "1px solid rgba(255,255,255,0.42)",
      borderRadius: 28,
      padding: 28,
      position: "relative",
      overflow: "hidden",
      boxShadow: "inset 0 2px 0 rgba(255,255,255,.38),inset 0 -2px 10px rgba(0,0,0,.28),0 30px 72px rgba(0,0,0,.55)",
      transition: "box-shadow 0.08s ease",
    }}>
      <div style={{ position:"absolute",top:0,left:"8%",right:"8%",height:1,background:"linear-gradient(90deg,transparent,rgba(255,255,255,.65) 35%,rgba(255,255,255,.95) 50%,rgba(255,255,255,.65) 65%,transparent)",zIndex:4,pointerEvents:"none" }} />
      <div style={{ position:"absolute",inset:0,borderRadius:28,background:"linear-gradient(148deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.04) 28%,transparent 52%,rgba(72,197,156,.04) 78%,rgba(0,0,0,.07) 100%)",zIndex:1,pointerEvents:"none" }} />
      <div style={{ position:"absolute",inset:0,borderRadius:28,background:"linear-gradient(115deg,transparent 30%,rgba(255,255,255,.08) 50%,transparent 70%)",animation:"iqShimmer 7s ease-in-out infinite",zIndex:2,pointerEvents:"none" }} />

      <div style={{ position: "relative", zIndex: 5 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
          <span style={{ fontSize:11,fontWeight:700,color:"#48C59C",letterSpacing:"1px",textTransform:"uppercase" }}>{category}</span>
          <span style={{ fontSize:11,color:"rgba(232,245,240,0.40)",fontWeight:500 }}>{current} / {total}</span>
        </div>
        <div style={{ width:"100%",height:3,background:"rgba(255,255,255,0.07)",borderRadius:99,overflow:"hidden",marginBottom:20 }}>
          <div style={{ height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#48C59C,#5DD4AE)",borderRadius:99,boxShadow:"0 0 10px rgba(72,197,156,0.7)",transition:"width 0.6s cubic-bezier(0.4,0,0.2,1)" }} />
        </div>
        {children}
      </div>
    </div>
  );
}
