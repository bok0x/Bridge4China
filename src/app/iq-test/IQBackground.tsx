"use client";
import { useEffect, useRef } from "react";

export function IQBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const mx = e.clientX / window.innerWidth - 0.5;
      const my = e.clientY / window.innerHeight - 0.5;
      const orbs = containerRef.current.querySelectorAll<HTMLElement>("[data-orb]");
      orbs.forEach((orb, i) => {
        const depth = [0.55, 0.45, 1.0, 0.75][i] ?? 0.5;
        const sign = i % 2 === 0 ? 1 : -1;
        orb.style.transform = `translate(${sign * mx * 55 * depth}px, ${sign * my * 55 * depth}px)`;
      });
      const starsEl = containerRef.current.querySelector<HTMLElement>("[data-stars]");
      if (starsEl) starsEl.style.transform = `translate(${mx * 14}px, ${my * 14}px)`;
    };
    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <>
      <svg style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
        <defs>
          <filter id="water-lens" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.032" numOctaves={3} seed={4} result="warpNoise">
              <animate attributeName="baseFrequency" values="0.018 0.032;0.026 0.040;0.020 0.028;0.018 0.032" dur="14s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="warpNoise" scale={22} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className="iq-bg"
        style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", background: "#030806" }}
      >
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 65% 55% at 12% 22%, rgba(26,90,60,0.60) 0%, transparent 70%),
            radial-gradient(ellipse 50% 45% at 88% 78%, rgba(18,70,48,0.55) 0%, transparent 65%),
            radial-gradient(ellipse 38% 32% at 58% 12%, rgba(40,120,80,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 32% 38% at 18% 82%, rgba(15,55,38,0.50) 0%, transparent 55%)
          `
        }} />

        {[
          { style: { width:520,height:520,background:"radial-gradient(circle,rgba(72,197,156,0.50),transparent 70%)",top:-90,left:-70,filter:"blur(65px)",animation:"iqDrift1 18s ease-in-out infinite" } },
          { style: { width:440,height:440,background:"radial-gradient(circle,rgba(26,122,80,0.55),transparent 70%)",bottom:-70,right:-50,filter:"blur(65px)",animation:"iqDrift2 22s ease-in-out infinite" } },
          { style: { width:300,height:300,background:"radial-gradient(circle,rgba(72,197,156,0.32),transparent 70%)",top:"42%",left:"62%",filter:"blur(65px)",animation:"iqDrift3 15s ease-in-out infinite" } },
          { style: { width:200,height:200,background:"radial-gradient(circle,rgba(93,212,174,0.28),transparent 70%)",top:"22%",left:"28%",filter:"blur(65px)",animation:"iqDrift4 20s ease-in-out infinite" } },
        ].map((o, i) => (
          <div key={i} data-orb style={{ position: "absolute", borderRadius: "50%", willChange: "transform", ...o.style as React.CSSProperties }} />
        ))}

        {[
          { sz:28, bg:"radial-gradient(circle at 35% 30%,#ff9060,#cc2810)", shadow:"0 0 22px rgba(255,80,30,.9),0 0 50px rgba(255,50,10,.5)", anim:"iqBall1 11s ease-in-out infinite" },
          { sz:18, bg:"radial-gradient(circle at 35% 30%,#ffb050,#dd3a10)", shadow:"0 0 18px rgba(255,110,20,.9),0 0 38px rgba(255,70,10,.5)", anim:"iqBall2 14s ease-in-out infinite" },
          { sz:34, bg:"radial-gradient(circle at 35% 30%,#ff7850,#bb1818)", shadow:"0 0 28px rgba(255,50,30,.85),0 0 60px rgba(200,20,10,.4)", anim:"iqBall3 9s ease-in-out infinite" },
          { sz:14, bg:"radial-gradient(circle at 35% 30%,#ffd060,#e05008)", shadow:"0 0 14px rgba(255,160,30,.9),0 0 28px rgba(255,100,10,.5)", anim:"iqBall4 17s ease-in-out infinite" },
          { sz:22, bg:"radial-gradient(circle at 35% 30%,#40e0a0,#0a8050)",  shadow:"0 0 20px rgba(40,200,130,.8),0 0 45px rgba(20,160,100,.4)", anim:"iqBall5 13s ease-in-out infinite" },
        ].map((b, i) => (
          <div key={i} style={{ position:"absolute",borderRadius:"50%",width:b.sz,height:b.sz,background:b.bg,boxShadow:b.shadow,animation:b.anim,willChange:"transform" }} />
        ))}

        <div data-stars style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 180 }, (_, i) => {
            const size = (0.5 + Math.random() * 2.2).toFixed(1);
            const alpha = (0.2 + Math.random() * 0.55).toFixed(2);
            const dur = (1.5 + Math.random() * 3).toFixed(1);
            const delay = (Math.random() * 4).toFixed(1);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  borderRadius: "50%",
                  width: `${size}px`, height: `${size}px`,
                  left: `${(Math.random() * 100).toFixed(1)}%`,
                  top: `${(Math.random() * 100).toFixed(1)}%`,
                  background: "rgba(200,240,220,0.85)",
                  animation: `iqTwinkle ${dur}s ease-in-out -${delay}s infinite`,
                  ["--a" as string]: alpha,
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
