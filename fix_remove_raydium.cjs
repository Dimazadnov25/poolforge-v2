const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(/import RaydiumDashboard from '\.\/RaydiumDashboard'\n/, '')
c = c.replace(/\s*<RaydiumDashboard \/>/, '')

fs.writeFileSync(file, c)
console.log('✅ Raydium entfernt')