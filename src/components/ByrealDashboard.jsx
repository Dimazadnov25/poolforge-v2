import { useState, useEffect } from 'react'

export default function ByrealDashboard() {
  const [feeUsdc, setFeeUsdc] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/byreal-positions?wallet=ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy')
        const d = await r.json()
        const total = (d.positions || []).reduce((acc, p) => acc + parseFloat(p.feeOwedUsdc || 0), 0)
        setFeeUsdc(total)
      } catch(e) {}
    }
    load()
    const iv = setInterval(load, 15000)
    return () => clearInterval(iv)
  }, [])

  return (
    <div style={{display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap'}}>
      <a href="https://www.byreal.io/en/portfolio" target="_blank" rel="noreferrer" style={{
        display:'inline-flex', alignItems:'center', gap:'0.4rem',
        padding:'0.5rem 1.3rem', borderRadius:'4px', textDecoration:'none',
        border:'1px solid rgba(0,255,255,0.3)', color:'rgba(0,255,255,0.7)',
        fontSize:'0.85rem', fontFamily:'Share Tech Mono, monospace',
        textTransform:'uppercase', letterSpacing:'0.08em',
        background:'rgba(0,255,255,0.05)'
      }}>↗ BYREAL PORTFOLIO</a>
      {feeUsdc !== null && (
        <div style={{background:'#111', borderRadius:'4px', padding:'0.4rem 0.75rem', border:'1px solid rgba(255,34,68,0.3)'}}>
          <span style={{fontSize:'0.65rem', color:'#444', fontFamily:'Share Tech Mono,monospace', textTransform:'uppercase'}}>Byreal Claim </span>
          <span style={{fontSize:'1rem', fontWeight:700, color:'#ff2244', fontFamily:'Orbitron,monospace'}}>${feeUsdc.toFixed(4)}</span>
        </div>
      )}
    </div>
  )
}