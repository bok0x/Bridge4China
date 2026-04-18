"use client";
import Link from "next/link";
import { useState } from "react";

export function IQTestBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div style={{
      position:"fixed",top:0,left:0,right:0,zIndex:50,
      display:"flex",alignItems:"center",justifyContent:"center",
      padding:"8px 16px",
      background:"rgba(72,197,156,0.10)",
      backdropFilter:"blur(20px) saturate(180%)",
      WebkitBackdropFilter:"blur(20px) saturate(180%)",
      borderBottom:"1px solid rgba(72,197,156,0.25)",
    }}>
      <Link
        href="/iq-test"
        style={{
          fontSize:13,fontWeight:600,color:"#48C59C",
          textDecoration:"none",letterSpacing:"0.3px",
          display:"flex",alignItems:"center",gap:8,
        }}
      >
        <span>🧠</span>
        <span>TEST YOUR IQ — Free 15-min cognitive assessment</span>
        <span style={{ opacity:0.7 }}>→</span>
      </Link>
      <button
        onClick={() => setDismissed(true)}
        style={{
          position:"absolute",right:16,background:"none",border:"none",
          color:"rgba(232,245,240,0.5)",cursor:"pointer",fontSize:18,lineHeight:1,padding:4,
        }}
        aria-label="Dismiss"
      >×</button>
    </div>
  );
}
