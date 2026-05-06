const fs = require('fs')

const byreal = `export default function ByrealDashboard() {
  return (
    <div style={{textAlign:'center', margin:'1.5rem 0'}}>
      <a href="https://www.byreal.io/en/portfolio" target="_blank" rel="noreferrer" style={{
        display:'inline-block',
        padding:'1rem 2.5rem',
        borderRadius:'999px',
        fontWeight:700,
        fontSize:'1.4rem',
        textDecoration:'none',
        color:'#fff',
        background:'linear-gradient(135deg, #a855f7, #06b6d4)',
        boxShadow:'0 0 24px rgba(168,85,247,0.6), 0 0 48px rgba(6,182,212,0.4)',
        border:'2px solid rgba(255,255,255,0.2)',
        letterSpacing:'0.05em',
        transition:'all 0.3s'
      }}>↗ Byreal Portfolio</a>
    </div>
  )
}
`
fs.writeFileSync('src/components/ByrealDashboard.jsx', byreal)
console.log('✅ Byreal Button neon + zentriert + groß')