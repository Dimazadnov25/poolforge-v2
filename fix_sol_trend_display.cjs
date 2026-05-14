const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const idx = c.indexOf('SOL Wallet')
const context = c.substring(idx-5, idx+400)
const hasCRLF = context.includes('\r\n')
const nl = hasCRLF ? '\r\n' : '\n'

const oldStr = `}}>\${(parseFloat(pool.solBalance||0)*pool.solPrice).toFixed(2)}</div>`
const newStr = `}}><span>\${(parseFloat(pool.solBalance||0)*pool.solPrice).toFixed(2)}</span>{solWalletTrend !== null && <span style={{fontSize:'0.85rem',fontWeight:700,marginLeft:'0.4rem',fontFamily:'Share Tech Mono,monospace',color:solWalletTrend>=0?'#00ff88':'#ff2244'}}>{solWalletTrend>=0?'+':''}{solWalletTrend.toFixed(2)}%</span>}</div>`

if (!c.includes(oldStr)) {
  console.log('❌ nicht gefunden')
  process.exit(1)
}

c = c.replace(oldStr, newStr)
fs.writeFileSync(file, c)
console.log('✅ Trend-Anzeige eingefügt')