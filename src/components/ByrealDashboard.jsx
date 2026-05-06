import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function ByrealDashboard({ solPrice }) {
  const { publicKey } = useWallet()
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!publicKey) return
    const load = async () => {
      setLoading(true)
      try {
        const r = await fetch('/api/byreal-positions?wallet=' + publicKey.toBase58())
        const d = await r.json()
        setPositions(d.positions || [])
      } catch(e) {} finally { setLoading(false) }
    }
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [publicKey])

  if (!publicKey) return null

  return (
    <div style={{marginTop:'1.5rem', background:'var(--card-bg,#1e293b)', borderRadius:'1rem', padding:'1.25rem', border:'1px solid rgba(255,255,255,0.07)'}}>
      <div style={{display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'1rem'}}>
        <span style={{fontWeight:700, fontSize:'1rem', color:'#e2e8f0'}}>Byreal Positionen</span>
        {loading && <span style={{fontSize:'0.75rem', color:'#64748b', marginLeft:'auto'}}>⟳ lädt...</span>}
      </div>
      {!loading && positions.length === 0 && (
        <div style={{color:'#64748b', fontSize:'0.85rem'}}>Keine Byreal Positionen gefunden</div>
      )}
      {positions.map((p, i) => (
        <div key={i} style={{
          background:'rgba(255,255,255,0.04)', borderRadius:'0.75rem', padding:'1rem', marginBottom:'0.75rem',
          border: p.inRange === true ? '1px solid rgba(16,185,129,0.3)' : p.inRange === false ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem'}}>
            <span style={{fontSize:'0.8rem', color:'#94a3b8', fontFamily:'monospace'}}>{p.positionPda.slice(0,6)}...{p.positionPda.slice(-4)}</span>
            <span style={{fontSize:'0.75rem', fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:'999px',
              background: p.inRange === true ? 'rgba(16,185,129,0.15)' : 'rgba(248,113,113,0.15)',
              color: p.inRange === true ? '#10b981' : '#f87171'
            }}>{p.inRange === true ? '✓ In Range' : '✗ Out of Range'}</span>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.5rem', fontSize:'0.82rem', textAlign:'center'}}>
            <div>
              <div style={{color:'#64748b', fontSize:'0.7rem', marginBottom:'0.2rem'}}>Min Preis</div>
              <div style={{color:'#e2e8f0', fontWeight:600}}>${p.priceLower}</div>
            </div>
            <div style={{borderLeft:'1px solid rgba(255,255,255,0.06)', borderRight:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{color:'#64748b', fontSize:'0.7rem', marginBottom:'0.2rem'}}>Aktuell</div>
              <div style={{color:'#06b6d4', fontWeight:700}}>${p.currentPrice || '—'}</div>
            </div>
            <div>
              <div style={{color:'#64748b', fontSize:'0.7rem', marginBottom:'0.2rem'}}>Max Preis</div>
              <div style={{color:'#e2e8f0', fontWeight:600}}>${p.priceUpper}</div>
            </div>
          </div>
          <div style={{marginTop:'0.6rem', paddingTop:'0.6rem', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', fontSize:'0.78rem', color:'#64748b'}}>
            <span>Ticks: {p.tickLower} / {p.tickUpper}</span>
            <a href={`https://www.byreal.io/en/position/${p.positionPda}`} target="_blank" rel="noreferrer" style={{color:'#6366f1', textDecoration:'none'}}>↗ Byreal</a>
          </div>
        </div>
      ))}
    </div>
  )
}