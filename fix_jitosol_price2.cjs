const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "(pool.jitoSolBalance * pool.solPrice).toFixed(2)",
  "(pool.jitoSolBalance * (pool.jitoSolPrice || pool.solPrice)).toFixed(2)"
)

fs.writeFileSync(file, c)
console.log('✅ jitoSolPrice im Dashboard')