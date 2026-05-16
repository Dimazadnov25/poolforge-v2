const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "import PriceAlert from './PriceAlert'",
  "import PriceAlert from './PriceAlert'\nimport HawkDashboard from './HawkDashboard'"
)

c = c.replace(
  '<a href="https://www.hawkfi.ag/dashboard"',
  '<HawkDashboard solPrice={pool.solPrice} />\n      <a href="https://www.hawkfi.ag/dashboard" style={{display:"none"}}'
)

fs.writeFileSync(file, c)
console.log('✅ HawkDashboard eingebunden')