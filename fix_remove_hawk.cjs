const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const idx = c.indexOf('<a href="https://www.hawkfi.ag')
const end = c.indexOf('</a>', idx) + '</a>'.length
c = c.substring(0, idx) + c.substring(end)

fs.writeFileSync(file, c)
console.log('✅ HAWK entfernt')