const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

c = c.replace(
  "padding:'0.5rem 1.3rem', borderRadius:'4px'",
  "padding:'0.45rem 0.9rem', borderRadius:'6px'"
)
c = c.replace("fontSize:'0.85rem'", "fontSize:'0.9rem', fontWeight:700")

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Meteora Kasten Größe angepasst:', c.includes('0.45rem 0.9rem'))