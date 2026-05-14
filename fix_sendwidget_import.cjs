const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "import PriceAlert from './PriceAlert'",
  "import PriceAlert from './PriceAlert'\nimport SendWidget from './SendWidget'"
)

c = c.replace(
  ">HAWK</a>",
  ">HAWK</a>\n      <SendWidget wallet={wallet} onRefresh={pool.refreshBalances} />"
)

fs.writeFileSync(file, c)
console.log('✅ SendWidget importiert und eingebunden')