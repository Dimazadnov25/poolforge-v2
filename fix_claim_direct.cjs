const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// totalClaim aus positionData ersetzen durch direkten fetch
c = c.replace(
  /const totalClaim = Object\.values[\s\S]*?\}, 0\)/,
  `const totalClaim = Object.values(positionData).reduce((acc, d) => {
    if (!d) return acc
    return acc + (parseFloat(d.feeOwedA || 0) / 1e9) * (pool.solPrice || 0) + parseFloat(d.feeOwedB || 0) / 1e6
  }, 0)`
)

// Claim Box immer anzeigen (auch wenn 0) damit man sieht ob es funktioniert
c = c.replace(
  '{totalClaim > 0 && (',
  '{pool.solPrice && ('
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Claim Box immer sichtbar')