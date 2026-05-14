const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// solWalletTrend -> solTrend im JSX ersetzen
c = c.replace(
  '{solWalletTrend !== null && <span style={{fontSize:\'0.85rem\',fontWeight:700,marginLeft:\'0.4rem\',fontFamily:\'Share Tech Mono,monospace\',color:solWalletTrend>=0?\'#00ff88\':\'#ff2244\'}}>{solWalletTrend>=0?\'+\':\'\'}{solWalletTrend.toFixed(2)}%</span>}',
  '{solTrend !== null && <span style={{fontSize:\'0.85rem\',fontWeight:700,marginLeft:\'0.4rem\',fontFamily:\'Share Tech Mono,monospace\',color:solTrend>=0?\'#00ff88\':\'#ff2244\'}}>{solTrend>=0?\'+\':\'\'}{solTrend.toFixed(2)}%</span>}'
)

fs.writeFileSync(file, c)
console.log('✅ solWalletTrend -> solTrend')