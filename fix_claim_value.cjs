const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// totalEarned berechnen (bereits positionData vorhanden)
c = c.replace(
  'const handlePositionUpdate = useCallback((mint, details) => {',
  `const totalClaim = Object.values(positionData).reduce((acc, d) => {
    if (!d) return acc
    return acc + (parseFloat(d.feeOwedA || 0) / 1e9) * (pool.solPrice || 0) + parseFloat(d.feeOwedB || 0) / 1e6
  }, 0)

  const handlePositionUpdate = useCallback((mint, details) => {`
)

// Claim Box ins Grid einfügen - nach Vol 24h
c = c.replace(
  '{solVolume != null && (',
  `{totalClaim > 0 && (
          <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.5rem 0.6rem',border:'1px solid rgba(255,34,68,0.3)'}}>
            <div style={{fontSize:'0.6rem',color:'#444',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>Claim</div>
            <div style={{fontSize:'1.4rem',fontWeight:700,color:'#ff2244',fontFamily:'Orbitron,monospace'}}>\${totalClaim.toFixed(2)}</div>
          </div>
        )}
        {solVolume != null && (`
)

// Grid auf 4 Spalten wenn Claim vorhanden - oder dynamisch lassen
fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Claim Value Box eingebaut')