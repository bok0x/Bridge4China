"use client";
import Link from "next/link";

interface Props {
  sessionId: string;
}

export function IQLockScreen({ sessionId }: Props) {
  const redirect = `/iq-test?unlock=${sessionId}`;
  return (
    <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:16,padding:"0 20px" }}>
      <div style={{ position:"relative",width:"100%",maxWidth:480 }}>
        <div style={{
          background:"rgba(255,255,255,0.06)",
          border:"1px solid rgba(255,255,255,0.18)",
          borderTop:"1px solid rgba(255,255,255,0.36)",
          borderRadius:22,padding:24,
          backdropFilter:"blur(32px) saturate(200%)",
          WebkitBackdropFilter:"blur(32px) saturate(200%)",
          filter:"blur(8px)",opacity:0.5,
          boxShadow:"inset 0 1.5px 0 rgba(255,255,255,.28)",
          userSelect:"none",pointerEvents:"none",
        }}>
          <div style={{ fontSize:48,fontWeight:900,color:"#48C59C",textAlign:"center" }}>IQ 127</div>
          <div style={{ fontSize:16,color:"#E8F5F0",textAlign:"center",marginTop:4 }}>98th Percentile · Superior Range</div>
          <div style={{ height:2,background:"rgba(72,197,156,0.3)",borderRadius:99,margin:"16px 0" }} />
          <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,textAlign:"center" }}>
            {["FRI","QRI","VCI","VSI","WMI"].map(l => (
              <div key={l}>
                <div style={{ fontSize:20,fontWeight:700,color:"#48C59C" }}>—</div>
                <div style={{ fontSize:10,color:"rgba(232,245,240,0.5)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,background:"rgba(3,8,6,0.45)",borderRadius:22,backdropFilter:"blur(3px)" }}>
          <div style={{ fontSize:32 }}>🔒</div>
          <div style={{ fontSize:15,fontWeight:700,color:"#E8F5F0" }}>Your results are ready</div>
          <div style={{ fontSize:12,color:"rgba(232,245,240,0.5)" }}>Create a free account to unlock your full IQ report</div>
        </div>
      </div>

      <div style={{ display:"flex",gap:12,width:"100%",maxWidth:480 }}>
        <Link
          href={`/signup?next=${encodeURIComponent(redirect)}`}
          style={{
            flex:1,padding:"14px 0",borderRadius:14,textAlign:"center",
            background:"linear-gradient(135deg,#48C59C,#1a7a5a)",
            color:"#030806",fontWeight:800,fontSize:14,letterSpacing:"0.3px",
            textDecoration:"none",
            boxShadow:"0 4px 22px rgba(72,197,156,0.38),inset 0 1px 0 rgba(255,255,255,0.38)",
          }}
        >
          Create Free Account
        </Link>
        <Link
          href={`/login?next=${encodeURIComponent(redirect)}`}
          style={{
            flex:1,padding:"14px 0",borderRadius:14,textAlign:"center",
            background:"rgba(255,255,255,0.07)",
            border:"1px solid rgba(255,255,255,0.18)",
            color:"#E8F5F0",fontWeight:600,fontSize:14,
            backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",
            textDecoration:"none",
            boxShadow:"inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
