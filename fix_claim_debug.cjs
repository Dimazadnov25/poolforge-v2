const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Claim Box IMMER zeigen zum debuggen
c = c.replace(
  '{Object.keys(positionData).length > 0 && (',
  '{true && ('
)
// Wert zeigen auch wenn 0
c = c.replace(
  `<div style={{fontSize:'1.4rem',fontWeight:700,color:'#ff2244',fontFamily:'Orbitron,monospace'}}>\${totalClaim.toFixed(4)}</div>`,
  `<div style={{fontSize:'1.4rem',fontWeight:700,color:'#ff2244',fontFamily:'Orbitron,monospace'}}>\${totalClaim.toFixed(4)} / pd:{Object.keys(positionData).length}</div>`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Debug mode')