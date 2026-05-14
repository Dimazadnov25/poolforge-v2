const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// SendWidget aus falscher Position entfernen
const swStart = c.indexOf('\n  function SendWidget')
const swEnd = c.indexOf('\n  return (\n    <div')
const sendWidgetCode = c.substring(swStart, swEnd)

// Aus falscher Position entfernen
c = c.substring(0, swStart) + c.substring(swEnd)

// Nach den Imports, vor PoolDashboard einfügen
c = c.replace(
  "import PriceAlert from './PriceAlert'\n",
  "import PriceAlert from './PriceAlert'\n" + sendWidgetCode.replace(/^  /gm, '') + '\n'
)

fs.writeFileSync(file, c)
console.log('✅ SendWidget korrekt positioniert')