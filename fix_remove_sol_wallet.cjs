const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const idx = c.indexOf('{pool.solBalance !== undefined && pool.solPrice && (')
const endStr = '        )}'
const endIdx = c.indexOf(endStr, idx) + endStr.length

if (idx === -1) { console.log('❌ nicht gefunden'); process.exit(1) }

c = c.substring(0, idx) + c.substring(endIdx)
fs.writeFileSync(file, c)
console.log('✅ SOL Wallet Kasten entfernt')