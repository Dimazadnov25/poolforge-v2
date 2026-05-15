const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "<span>{pool.jitoSolBalance > 0 ? (pool.jitoSolBalance * (pool.jitoSolPrice || pool.solPrice)).toFixed(2) : '0.00'}</span>",
  "<span>${pool.jitoSolBalance > 0 ? (pool.jitoSolBalance * (pool.jitoSolPrice || pool.solPrice)).toFixed(2) : '0.00'}</span>"
)

fs.writeFileSync(file, c)
console.log('✅ Dollar Symbol hinzugefügt')