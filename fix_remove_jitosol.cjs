const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// JitoSOL Block entfernen (von pool.solPrice && bis </div>)
c = c.replace(/\s*\{pool\.solPrice &&[^}]*\(\s*<div[^>]*>[\s\S]*?JitoSOL[\s\S]*?<\/div>\s*\)\s*\}/, '')

fs.writeFileSync(file, c)
console.log('✅ JitoSOL Kasten entfernt')