export default function ByrealDashboard() {
  return (
    <a href="https://www.byreal.io/en/portfolio" target="_blank" rel="noreferrer" style={{
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      padding:"0.6rem 0.9rem", borderRadius:"6px", textDecoration:"none",
      border:"1px solid rgba(0,255,255,0.3)", background:"rgba(0,255,255,0.05)"
    }}>
      <div style={{fontSize:"0.65rem",color:"#ff2244",textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:"Share Tech Mono,monospace"}}>BYREAL</div>
      <div style={{fontSize:"1.35rem",fontWeight:700,color:"#00ffff",fontFamily:"Rajdhani,sans-serif"}}>{"? PORTFOLIO"}</div>
    </a>
  )
}