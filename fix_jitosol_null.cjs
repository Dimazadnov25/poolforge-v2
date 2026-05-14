const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// useEffect Bedingung: undefined -> null check
c = c.replace(
  "if (pool.jitoSolBalance === undefined || !pool.solPrice) return",
  "if (pool.jitoSolBalance === null || pool.jitoSolBalance === undefined || !pool.solPrice) return"
)

// JSX: auch ohne jitoSolPrice anzeigen (solPrice als Fallback)
c = c.replace(
  "{pool.jitoSolBalance && pool.jitoSolPrice ? (pool.jitoSolBalance * pool.jitoSolPrice).toFixed(2) : '0.00'}",
  "{pool.jitoSolBalance > 0 ? (pool.jitoSolBalance * (pool.jitoSolPrice || pool.solPrice)).toFixed(2) : '0.00'}"
)

// JitoSOL Anzeige auch ohne jitoSolPrice
c = c.replace(
  "{pool.jitoSolBalance ? pool.jitoSolBalance.toFixed(4) : '0.0000'} JitoSOL",
  "{pool.jitoSolBalance > 0 ? pool.jitoSolBalance.toFixed(4) : '0.0000'} JitoSOL"
)

fs.writeFileSync(file, c)
console.log('✅ null check korrigiert')