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
    <div style={{marginTop:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap'}}>
      <span style={{color:'#64748b', fontSize:'0.75rem'}}>🔔 ntfy:</span>
      {[0.5, 1, 2, 3].map(pct => {
        const isActive = activeAlert === pct
        return (
          <button key={pct} onClick={() => activateAlert(pct)} disabled={saving} style={{
            padding:'0.3rem 0.75rem',
            borderRadius:'999px',
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
      {activeAlert && refPrice && change !== null && (
        <span style={{fontSize:'0.75rem', color: Math.abs(change) > activeAlert * 0.7 ? '#fb923c' : '#64748b'}}>
          Ref: ${refPrice.toFixed(2)} | {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          {saving ? ' ⟳' : ' ✅ aktiv'}
        </span>
      )}
    </div>
  )
}
