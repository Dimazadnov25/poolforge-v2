const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
// Zweiten doppelten swapSuggest State entfernen
c = c.replace(
  `const [swapSuggest, setSwapSuggest] = useState(null)
  const [swapSuggest, setSwapSuggest] = useState(null)`,
  `const [swapSuggest, setSwapSuggest] = useState(null)`
)
fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Duplikat entfernt')