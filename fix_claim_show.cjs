const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
c = c.replace(
  '{totalClaim > 0 && (',
  '{wallet.connected && pool.positions.length > 0 && ('
)
// Mehr Dezimalstellen zeigen
c = c.replace(
  'totalClaim.toFixed(2)',
  'totalClaim.toFixed(4)'
)
fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Claim immer sichtbar bei offener Position')