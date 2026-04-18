"use client";
import Link from "next/link";
import { IQScores, iqLabel } from "./iqTestData";

interface Props { scores: IQScores; }

export function IQResults({ scores }: Props) {
  const { label, analysis } = iqLabel(scores.iq);
  const axes = [
    { key:"fri" as const, label:"FRI", desc:"Fluid Reasoning" },
    { key:"qri" as const, label:"QRI", desc:"Quantitative" },
    { key:"vci" as const, label:"VCI", desc:"Verbal" },
    { key:"vsi" as const, label:"VSI", desc:"Spatial" },
    { key:"wmi" as const, label:"WMI", desc:"Working Memory" },
  ];

  const radarPath = () => {
    const cx = 120, cy = 120, r = 90;
    const vals = axes.map(a => scores[a.key] / 100);
    const points = vals.map((v, i) => {
      const angle = (i / vals.length) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + r * v * Math.cos(angle), y: cy + r * v * Math.sin(angle) };
    });
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + "Z";
  };

  const bellPath = () => {
    const w = 320, h = 80;
    const pts = Array.from({ length: 61 }, (_, i) => {
      const x = i / 60;
      const z = (x * 6) - 3;
      const y = Math.exp(-0.5 * z * z);
      return `${(x * w).toFixed(1)},${(h - y * (h - 4)).toFixed(1)}`;
    });
    return `M0,${h} L` + pts.join(" L") + ` L${w},${h} Z`;
  };

  const markerX = Math.min(320, Math.max(0, ((scores.iq - 55) / 90) * 320));

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20,padding:"0 20px",maxWidth:480,margin:"0 auto",width:"100%" }}>

      <div style={{ background:"rgba(255,255,255,0.07)",backdropFilter:"url(#water-lens) blur(32px) saturate(210%)",WebkitBackdropFilter:"blur(32px) saturate(210%)",border:"1px solid rgba(255,255,255,0.20)",borderTop:"1px solid rgba(255,255,255,0.42)",borderRadius:28,padding:28,textAlign:"center",boxShadow:"inset 0 2px 0 rgba(255,255,255,.38),0 30px 72px rgba(0,0,0,.55)" }}>
        <div style={{ fontSize:11,fontWeight:700,color:"#48C59C",letterSpacing:"1px",textTransform:"uppercase",marginBottom:8 }}>YOUR IQ SCORE</div>
        <div style={{ fontSize:72,fontWeight:900,color:"#48C59C",lineHeight:1,letterSpacing:"-2px" }}>{scores.iq}</div>
        <div style={{ fontSize:15,color:"rgba(232,245,240,0.7)",marginTop:6 }}>{scores.percentile}th percentile · {label}</div>
        <div style={{ fontSize:13,color:"rgba(232,245,240,0.5)",marginTop:12,lineHeight:1.6 }}>{analysis}</div>
      </div>

      <div style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.16)",borderTop:"1px solid rgba(255,255,255,0.32)",borderRadius:20,padding:"20px 20px 16px",backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",boxShadow:"inset 0 1.5px 0 rgba(255,255,255,.25)" }}>
        <div style={{ fontSize:11,fontWeight:700,color:"#48C59C",letterSpacing:"1px",textTransform:"uppercase",marginBottom:12 }}>POPULATION DISTRIBUTION</div>
        <svg viewBox="0 0 320 100" style={{ width:"100%",overflow:"visible" }}>
          <defs>
            <linearGradient id="bellGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(72,197,156,0.5)" />
              <stop offset="100%" stopColor="rgba(72,197,156,0.05)" />
            </linearGradient>
          </defs>
          <path d={bellPath()} fill="url(#bellGrad)" />
          {[70,85,100,115,130,145].map(v => {
            const x = ((v - 55) / 90) * 320;
            return (
              <g key={v}>
                <line x1={x} y1={10} x2={x} y2={80} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
                <text x={x} y={95} textAnchor="middle" fontSize={9} fill="rgba(232,245,240,0.35)">{v}</text>
              </g>
            );
          })}
          <line x1={markerX} y1={0} x2={markerX} y2={80} stroke="#48C59C" strokeWidth={2} />
          <circle cx={markerX} cy={0} r={4} fill="#48C59C" />
        </svg>
      </div>

      <div style={{ background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.16)",borderTop:"1px solid rgba(255,255,255,0.32)",borderRadius:20,padding:20,backdropFilter:"blur(32px)",WebkitBackdropFilter:"blur(32px)",boxShadow:"inset 0 1.5px 0 rgba(255,255,255,.25)" }}>
        <div style={{ fontSize:11,fontWeight:700,color:"#48C59C",letterSpacing:"1px",textTransform:"uppercase",marginBottom:16 }}>COGNITIVE PROFILE</div>
        <div style={{ display:"flex",alignItems:"center",gap:20 }}>
          <svg viewBox="0 0 240 240" style={{ width:140,flexShrink:0 }}>
            {[0.25,0.5,0.75,1].map(v => {
              const pts = Array.from({length:5},(_,i)=>{
                const a=(i/5)*Math.PI*2-Math.PI/2;
                return `${(120+90*v*Math.cos(a)).toFixed(1)},${(120+90*v*Math.sin(a)).toFixed(1)}`;
              });
              return <polygon key={v} points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
            })}
            {axes.map((_,i)=>{
              const a=(i/5)*Math.PI*2-Math.PI/2;
              return <line key={i} x1={120} y1={120} x2={(120+90*Math.cos(a)).toFixed(1)} y2={(120+90*Math.sin(a)).toFixed(1)} stroke="rgba(255,255,255,0.08)" strokeWidth={1} />;
            })}
            <path d={radarPath()} fill="rgba(72,197,156,0.25)" stroke="#48C59C" strokeWidth={1.5} />
            {axes.map((ax,i)=>{
              const a=(i/5)*Math.PI*2-Math.PI/2;
              const x=120+105*Math.cos(a), y=120+105*Math.sin(a);
              return <text key={i} x={x.toFixed(1)} y={y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontSize={10} fontWeight={700} fill="#48C59C">{ax.label}</text>;
            })}
          </svg>
          <div style={{ display:"flex",flexDirection:"column",gap:10,flex:1 }}>
            {axes.map(ax => (
              <div key={ax.key}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <span style={{ fontSize:11,color:"rgba(232,245,240,0.6)",fontWeight:500 }}>{ax.desc}</span>
                  <span style={{ fontSize:11,fontWeight:700,color:"#48C59C" }}>{scores[ax.key]}</span>
                </div>
                <div style={{ height:3,background:"rgba(255,255,255,0.07)",borderRadius:99,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${scores[ax.key]}%`,background:"linear-gradient(90deg,#48C59C,#5DD4AE)",borderRadius:99,boxShadow:"0 0 8px rgba(72,197,156,0.6)" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Link href="/discover" style={{
        display:"block",width:"100%",padding:"15px 0",borderRadius:16,textAlign:"center",
        background:"linear-gradient(135deg,#48C59C,#1a7a5a)",
        color:"#030806",fontWeight:800,fontSize:14,letterSpacing:"0.3px",
        textDecoration:"none",
        boxShadow:"0 4px 22px rgba(72,197,156,0.38),inset 0 1px 0 rgba(255,255,255,0.38)",
      }}>
        See Universities Matched to Students Like You →
      </Link>
    </div>
  );
}
