const fs = require('fs')

// API updaten
let api = fs.readFileSync('api/byreal-positions.js', 'utf8')
api = api.replace(
  `const feeOwed = pd.readBigUInt64LE(216)`,
  `const feeOwedUsdc = pd.readBigUInt64LE(216)
      const feeOwedSol = pd.readBigInt64LE ? Number(pd.readBigUInt64LE(83)) : 0`
)
api = api.replace(
  `feeOwedUsdc: (Number(feeOwed) / 1e6).toFixed(4),`,
  `feeOwedUsdc: (Number(feeOwedUsdc) / 1e6).toFixed(4),
        feeOwedSol: (Number(feeOwedSol) / 1e9).toFixed(6),`
)
fs.writeFileSync('api/byreal-positions.js', api)
console.log('✅ API gefixt')

// ByrealDashboard updaten - beide Fees anzeigen
const comp = `import { useState, useEffect } from 'react'

export default function ByrealDashboard({ solPrice }) {
  const [fees, setFees] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/byreal-positions?wallet=ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy')
        const d = await r.json()
        let usdc = 0, sol = 0
        for (const p of d.positions || []) {
          usdc += parseFloat(p.feeOwedUsdc || 0)
          sol += parseFloat(p.feeOwedSol || 0)
        }
        const totalUsd = usdc + sol * (solPrice || 0)
        setFees({ usdc, sol, totalUsd })
      } catch(e) {}
    }
    load()
    const iv = setInterval(load, 15000)
    return () => clearInterval(iv)
  }, [solPrice])

  return (
    <div style={{display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap'}}>
      <a href="https://www.byreal.io/en/portfolio" target="_blank" rel="noreferrer" style={{
        display:'inline-flex', alignItems:'center', gap:'0.4rem',
        padding:'0.5rem 1.3rem', borderRadius:'4px', textDecoration:'none',
        border:'1px solid rgba(0,255,255,0.3)', color:'rgba(0,255,255,0.7)',
        fontSize:'0.85rem', fontFamily:'Share Tech Mono, monospace',
        textTransform:'uppercase', letterSpacing:'0.08em',
        background:'rgba(0,255,255,0.05)'
      }}>↗ BYREAL</a>
      {fees !== null && (
        <div style={{background:'#111', borderRadius:'4px', padding:'0.4rem 0.75rem', border:'1px solid rgba(255,34,68,0.3)'}}>
          <span style={{fontSize:'0.65rem', color:'#444', fontFamily:'Share Tech Mono,monospace', textTransform:'uppercase'}}>Claim </span>
          <span style={{fontSize:'1rem', fontWeight:700, color:'#ff2244', fontFamily:'Orbitron,monospace'}}>\${fees.totalUsd.toFixed(4)}</span>
          <span style={{fontSize:'0.65rem', color:'#555', fontFamily:'Share Tech Mono,monospace', marginLeft:'0.4rem'}}>({fees.sol.toFixed(5)} SOL + \${fees.usdc.toFixed(4)})</span>
        </div>
      )}
    </div>
  )
}
`
fs.writeFileSync('src/components/ByrealDashboard.jsx', comp)
console.log('✅ ByrealDashboard mit SOL + USDC Fees')