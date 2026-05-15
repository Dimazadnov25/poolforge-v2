import { useState, useEffect, useRef } from 'react'

export default function PriceAlert({ solPrice }) {
  const [activeAlert, setActiveAlert] = useState(() => { try { const s = localStorage.getItem('pf_alert'); return s ? JSON.parse(s).pct : null } catch { return null } })
  const [refPrice, setRefPrice] = useState(() => { try { const s = localStorage.getItem('pf_alert'); return s ? JSON.parse(s).refPrice : null } catch { return null } })
  const [saving, setSaving] = useState(false)
  const [pulse, setPulse] = useState(false)
  const pulseRef = useRef(null)

  useEffect(() => {
    if (activeAlert) {
      pulseRef.current = setInterval(() => setPulse(p => !p), 800)
    } else {
      clearInterval(pulseRef.current)
      setPulse(false)
    }
    return () => clearInterval(pulseRef.current)
  }, [activeAlert])

  const activateAlert = async (pct) => {
    if (activeAlert === pct) {
      setActiveAlert(null)
      setRefPrice(null)
      localStorage.removeItem('pf_alert')
      setSaving(true)
      await fetch('/api/save-alert?pct=0&refPrice=0&active=false')
      setSaving(false)
    } else {
      setActiveAlert(pct)
      setRefPrice(solPrice)
      localStorage.setItem('pf_alert', JSON.stringify({ pct, refPrice: solPrice }))
      setSaving(true)
      await fetch('/api/save-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pct, refPrice: solPrice, active: true })
      })
      setSaving(false)
    }
  }

  if (!solPrice) return null
  const change = refPrice ? ((solPrice - refPrice) / refPrice * 100) : null

  return (
    <div style={{marginTop:'0.75rem', display:'flex', flexDirection:'column', gap:'0.4rem'}}>
      <div style={{display:'flex',gap:'0.4rem'}}>
      {[0.5, 1, 2, 3].map(pct => {
        const isActive = activeAlert === pct
        return (
          <button key={pct} onClick={() => activateAlert(pct)} disabled={saving} style={{
            padding:'0.5rem 1rem', borderRadius:'6px',
            border: isActive ? '1.5px solid #f59e0b' : '1.5px solid rgba(255,255,255,0.1)',
            background: isActive
              ? pulse ? 'rgba(245,158,11,0.35)' : 'rgba(245,158,11,0.15)'
              : 'rgba(255,255,255,0.04)',
            color: isActive ? '#f59e0b' : '#94a3b8',
            fontWeight: isActive ? 700 : 400,
            fontSize:'0.8rem',
            cursor: saving ? 'wait' : 'pointer',
            transition:'all 0.3s',
            boxShadow: isActive ? (pulse ? '0 0 12px rgba(245,158,11,0.7)' : '0 0 6px rgba(245,158,11,0.3)') : 'none'
          }}>
            {isActive ? '🔔' : '🔕'} {pct}%
          </button>
        )
      })}
      </div>
      {activeAlert && refPrice && change !== null && (
        <div style={{padding:'0.75rem 1rem',borderRadius:'6px',border:'1px solid rgba(245,158,11,0.4)',background:'rgba(245,158,11,0.07)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:'1rem',color:'#94a3b8',fontFamily:'Share Tech Mono,monospace'}}>REF <strong style={{color:'#f59e0b',fontSize:'1.2rem'}}>${refPrice.toFixed(2)}</strong></span>
            <span style={{fontSize:'2.2rem',fontWeight:700,fontFamily:'Rajdhani,sans-serif',color:Math.abs(change)>activeAlert*0.7?'#fb923c':change>=0?'#00ff88':'#ff2244'}}>{change>=0?'+':''}{change.toFixed(2)}%</span>
            <span style={{fontSize:'0.9rem',color:'#f59e0b',fontFamily:'Share Tech Mono,monospace'}}>{activeAlert}% ALARM</span>
          </div>
        </div>
      )}
    </div>
  )
}
