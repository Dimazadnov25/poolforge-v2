const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// totalClaim direkt aus pool.positions lesen
c = c.replace(
  /const totalClaim = Object\.values\(positionData\)[\s\S]*?\}, 0\)/,
  `const totalClaim = (pool.positions || []).reduce((acc, p) => {
    return acc + (parseFloat(p.feeOwedA || 0) / 1e9) * (pool.solPrice || 0) + parseFloat(p.feeOwedB || 0) / 1e6
  }, 0)`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ totalClaim aus pool.positions')