const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "<span>${parseFloat(pool.usdcBalance||0).toFixed(2)}</span>{usdcWalletTrend !== null && <span style={{fontSize:'0.85rem',fontWeight:700,marginLeft:'0.4rem',fontFamily:'Share Tech Mono,monospace',color:usdcWalletTrend>=0?'#00ff88':'#ff2244'}}>{usdcWalletTrend>=0?'+':''}{usdcWalletTrend.toFixed(2)}%</span>}",
  "${parseFloat(pool.usdcBalance||0).toFixed(2)}"
)

fs.writeFileSync(file, c)
console.log('✅ USDC Trend entfernt')