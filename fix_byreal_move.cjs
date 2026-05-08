const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// ByrealDashboard aus alter Position entfernen
c = c.replace('\n      <ByrealDashboard />', '')

// Byreal Link direkt in ByrealDashboard.jsx auf gleichen Style wie Meteora setzen
const byreal = `export default function ByrealDashboard() {
  return (
    <a href="https://www.byreal.io/en/portfolio" target="_blank" rel="noreferrer" style={{
      display:'inline-flex', alignItems:'center', gap:'0.4rem',
      padding:'0.45rem 0.9rem', borderRadius:'6px', textDecoration:'none',
      border:'1px solid rgba(0,255,255,0.35)', color:'rgba(0,255,255,0.8)',
      fontSize:'1.35rem', fontWeight:700, fontFamily:'Share Tech Mono, monospace',
      textTransform:'uppercase', letterSpacing:'0.08em',
      background:'rgba(0,255,255,0.07)'
    }}>↗ BYREAL</a>
  )
}
`
require('fs').writeFileSync('src/components/ByrealDashboard.jsx', byreal)

// Byreal rechts neben Meteora in den flex div
c = c.replace(
  `<div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>`,
  `<div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
      <ByrealDashboard />`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Byreal neben Meteora:', c.includes('<ByrealDashboard />'))