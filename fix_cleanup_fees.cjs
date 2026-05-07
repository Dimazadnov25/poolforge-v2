const fs = require('fs')

// 1. ByrealDashboard - nur noch Portfolio Button, keine Fees
const byreal = `export default function ByrealDashboard() {
  return (
    <a href="https://www.byreal.io/en/portfolio" target="_blank" rel="noreferrer" style={{
      display:'inline-flex', alignItems:'center', gap:'0.4rem',
      padding:'0.5rem 1.3rem', borderRadius:'4px', textDecoration:'none',
      border:'1px solid rgba(0,255,255,0.3)', color:'rgba(0,255,255,0.7)',
      fontSize:'0.85rem', fontFamily:'Share Tech Mono, monospace',
      textTransform:'uppercase', letterSpacing:'0.08em',
      background:'rgba(0,255,255,0.05)'
    }}>↗ BYREAL PORTFOLIO</a>
  )
}
`
fs.writeFileSync('src/components/ByrealDashboard.jsx', byreal)
console.log('✅ ByrealDashboard ohne Fees')

// 2. PoolDashboard - debug pd: und Claim Box entfernen
let pd = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Claim Box entfernen
pd = pd.replace(
  /\{Object\.keys\(positionData\)[\s\S]*?<\/div>\s*\)\s*\}\s*\n/,
  ''
)
// debug pd: aus Claim entfernen falls noch da
pd = pd.replace(/ \/ pd:\{Object\.keys\(positionData\)\.length\}/g, '')

fs.writeFileSync('src/components/PoolDashboard.jsx', pd)
console.log('✅ Claim Box + debug entfernt')