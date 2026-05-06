import { useState, useEffect, useRef } from 'react'

export default function PriceAlert({ solPrice }) {
  const [activeAlert, setActiveAlert] = useState(null)
  const [refPrice, setRefPrice] = useState(null)
  const [saving, setSaving] = useState(false)

  const activateAlert = async (pct) => {
    if (activeAlert === pct) {
      setActiveAlert(null)
      setRefPrice(null)
      setSaving(true)
      await fetch('/api/save-alert?pct=0&refPrice=0&active=false')
      setSaving(false)
    } else {
      setActiveAlert(pct)
      setRefPrice(solPrice)
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
      {[1, 2, 3, 5].map(pct => (
        <button key={pct} onClick={() => activateAlert(pct)} disabled={saving} style={{
          padding:'0.3rem 0.75rem', borderRadius:'999px',
          border: activeAlert === pct ? '1.5px solid #f59e0b' : '1.5px solid rgba(255,255,255,0.1)',
          background: activeAlert === pct ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
          color: activeAlert === pct ? '#f59e0b' : '#94a3b8',
          fontWeight: activeAlert === pct ? 700 : 400,
          fontSize:'0.8rem', cursor: saving ? 'wait' : 'pointer', transition:'all 0.2s'
        }}>
          {activeAlert === pct ? '🔔' : '🔕'} {pct}%
        </button>
      ))}
      {activeAlert && refPrice && change !== null && (
        <span style={{fontSize:'0.75rem', color: Math.abs(change) > activeAlert * 0.7 ? '#fb923c' : '#64748b'}}>
          Ref: ${refPrice.toFixed(2)} | {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          {saving ? ' ⟳' : ' ✅ aktiv (PC aus OK)'}
        </span>
      )}
    </div>
  )
}
