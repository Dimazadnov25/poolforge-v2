const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// 1. Import entfernen
c = c.replace("import SwapWidget from './SwapWidget'\r\n", '')

// 2. State entfernen
c = c.replace("  const [swapSuggest, setSwapSuggest] = useState(null)\r\n", '')

// 3. SwapWidget JSX entfernen
c = c.replace("\r\n      <SwapWidget solPrice={pool.solPrice} solBalance={pool.solBalance} usdcBalance={pool.usdcBalance} />\r\n", '')

// 4. setSwapSuggest in onCollect entfernen
c = c.replace("\r\n            const bal = pool.solBalance || 0\r\n            const excess = parseFloat((bal - 0.01).toFixed(4))\r\n            if (excess > 0.001) setSwapSuggest(excess)", '')

// 5. swapSuggest Modal entfernen
const modalStart = "\r\n      {swapSuggest && ("
const modalEnd = ")}\r\n    </div>"
const startIdx = c.indexOf(modalStart)
const endIdx = c.indexOf(modalEnd, startIdx) + modalEnd.length
if (startIdx !== -1) {
  c = c.substring(0, startIdx) + "\r\n    </div>" + c.substring(endIdx)
  console.log('✅ swapSuggest Modal entfernt')
} else {
  console.log('❌ Modal nicht gefunden')
}

fs.writeFileSync(file, c)
console.log('✅ SwapWidget komplett entfernt')