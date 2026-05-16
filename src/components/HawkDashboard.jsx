import { useState, useEffect } from 'react'

export default function HawkDashboard({ solPrice }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/hawk-position')
        const d = await r.json()
        const solVal = d.sol * (solPrice || 0)
        setData({ usdc: d.usdc||0, sol: d.sol||0, solVal: solVal||0, total: (d.usdc||0) + (solVal||0) })
      } catch(e) { console.error(e) }
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [solPrice])

  return (
    <a href="https://www.hawkfi.ag/dashboard" target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
      <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.75rem',border:'1px solid rgba(0,255,255,0.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.3rem'}}>
          <span style={{fontSize:'0.65rem',color:'#00ffff',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>HAWK POSITION</span>
          <span style={{fontSize:'0.6rem',color:'#444',fontFamily:'Share Tech Mono,monospace'}}>↗ dashboard</span>
        </div>
        {loading ? (
          <div style={{color:'#444',fontFamily:'Share Tech Mono,monospace',fontSize:'0.8rem'}}>laden...</div>
        ) : data ? (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.4rem'}}>
            <div>
              <div style={{fontSize:'0.6rem',color:'#888',fontFamily:'Share Tech Mono,monospace'}}>USDC</div>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>${data.usdc.toFixed(2)}</div>
            </div>
            <div>
              <div style={{fontSize:'0.6rem',color:'#888',fontFamily:'Share Tech Mono,monospace'}}>SOL</div>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>{data.sol.toFixed(3)}</div>
            </div>
            <div>
              <div style={{fontSize:'0.6rem',color:'#888',fontFamily:'Share Tech Mono,monospace'}}>GESAMT</div>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>${data.total.toFixed(2)}</div>
            </div>
          </div>
        ) : (
          <div style={{color:'#ff2244',fontFamily:'Share Tech Mono,monospace',fontSize:'0.8rem'}}>Fehler</div>
        )}
      </div>
    </a>
  )
}