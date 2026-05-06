const fs = require('fs')
let c = fs.readFileSync('src/components/ByrealDashboard.jsx', 'utf8')

c = c.replace(
  "<span>Ticks: {p.tickLower} / {p.tickUpper}</span>",
  "<span>Ticks: {p.tickLower} / {p.tickUpper}</span>"
)

c = c.replace(
  `<a href={\`https://www.byreal.io/en/position/\${p.positionPda}\`} target="_blank" rel="noreferrer" style={{color:'#6366f1', textDecoration:'none'}}>↗ Byreal</a>`,
  `<a href={\`https://www.byreal.io/en/position/\${p.positionPda}\`} target="_blank" rel="noreferrer" style={{
    background:'rgba(99,102,241,0.15)', color:'#6366f1', textDecoration:'none',
    padding:'0.3rem 0.9rem', borderRadius:'999px', fontWeight:600, fontSize:'0.8rem',
    border:'1px solid rgba(99,102,241,0.3)'
  }}>↗ Position öffnen</a>`
)

fs.writeFileSync('src/components/ByrealDashboard.jsx', c)
console.log('✅ Button updated')