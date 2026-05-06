const fs = require('fs')

// 1. "keine positionen" entfernen
let pd = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
pd = pd.replace(
  /\{wallet\.connected && pool\.positions\.length === 0 && \([^)]+\)\s*\}\n?/s,
  ''
)
fs.writeFileSync('src/components/PoolDashboard.jsx', pd)
console.log('✅ Keine-Positionen Text entfernt')

// 2. Byreal Button größer
let byreal = fs.readFileSync('src/components/ByrealDashboard.jsx', 'utf8')
byreal = byreal.replace(
  "padding:'0.3rem 0.8rem'",
  "padding:'0.5rem 1.3rem'"
)
byreal = byreal.replace(
  "fontSize:'0.7rem'",
  "fontSize:'0.85rem'"
)
fs.writeFileSync('src/components/ByrealDashboard.jsx', byreal)
console.log('✅ Byreal Button größer')