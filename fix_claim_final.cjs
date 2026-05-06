const fs = require('fs')

// totalClaim zurück auf positionData
let pd = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
pd = pd.replace(
  /const totalClaim = \(pool\.positions[\s\S]*?\}, 0\)/,
  `const totalClaim = Object.values(positionData).reduce((acc, d) => {
    if (!d) return acc
    return acc + (parseFloat(d.feeOwedA || 0) / 1e9) * (pool.solPrice || 0) + parseFloat(d.feeOwedB || 0) / 1e6
  }, 0)`
)
// Claim Box nur wenn positionData gefüllt
pd = pd.replace(
  '{pool.solPrice && (',
  '{Object.keys(positionData).length > 0 && ('
)
fs.writeFileSync('src/components/PoolDashboard.jsx', pd)
console.log('✅ totalClaim fix')

// PositionDetails - onUpdate auch bei jedem Intervall aufrufen
let pos = fs.readFileSync('src/components/PositionDetails.jsx', 'utf8')
pos = pos.replace(
  `const load = () => fetchPosition(position.mint).then(d => {
              setDetails(d)
              if (onUpdate) onUpdate(position.mint, d)
            })`,
  `const load = () => fetchPosition(position.mint).then(d => {
              setDetails(d)
              if (onUpdate) onUpdate(position.mint, d)
            }).catch(() => {})`
)
fs.writeFileSync('src/components/PositionDetails.jsx', pos)
console.log('✅ PositionDetails onUpdate fix')