const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
c = c.replace(
  "padding:'0.45rem 0.9rem', borderRadius:'6px'",
  "padding:'0.45rem 0.9rem', borderRadius:'6px', width:'50%', justifyContent:'center'"
)
fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Meteora Kasten halb so breit:', c.includes("width:'50%'"))