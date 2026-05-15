const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const idx = c.indexOf('{solVolume != null && (')
const end = c.indexOf(')}', idx) + ')}'.length
c = c.substring(0, idx) + c.substring(end)

fs.writeFileSync(file, c)
console.log('✅ Vol 24h entfernt')