const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
c = c.replace(
  '{wallet.connected && pool.positions.length > 0 && (',
  '{Object.keys(positionData).length > 0 && ('
)
fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('Claim Bedingung:', c.includes("Object.keys(positionData).length > 0"))