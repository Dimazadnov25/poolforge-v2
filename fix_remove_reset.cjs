const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const idx = c.indexOf('<button onClick={resetJitoBaseline}')
const end = c.indexOf('</button>', idx) + '</button>'.length

if (idx === -1) { console.log('❌ nicht gefunden'); process.exit(1) }

c = c.substring(0, idx) + c.substring(end)
fs.writeFileSync(file, c)
console.log('✅ Reset Button entfernt')