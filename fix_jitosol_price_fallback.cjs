const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "{pool.jitoSolBalance > 0 ? (pool.jitoSolBalance * (pool.jitoSolPrice || pool.solPrice)).toFixed(2) : '0.00'}",
  "{pool.jitoSolBalance > 0 && pool.jitoSolPrice ? (pool.jitoSolBalance * pool.jitoSolPrice).toFixed(2) : pool.jitoSolBalance > 0 ? '...' : '0.00'}"
)

fs.writeFileSync(file, c)
console.log('✅ JitoSOL kein falscher Fallback')