const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "import PriceAlert from './PriceAlert'",
  "import PriceAlert from './PriceAlert'\nimport SolChart from './SolChart'"
)

c = c.replace(
  "      <PriceAlert solPrice={pool.solPrice} />",
  "      <SolChart />\n      <PriceAlert solPrice={pool.solPrice} />"
)

fs.writeFileSync(file, c)
console.log('✅ SolChart eingefügt')