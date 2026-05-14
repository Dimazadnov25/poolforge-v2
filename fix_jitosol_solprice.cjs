const fs = require('fs')

// usePool.js: CoinGecko Fetch entfernen
const hookFile = 'src/hooks/usePool.js'
let h = fs.readFileSync(hookFile, 'utf8')

h = h.replace(
  `      // JitoSOL Preis via CoinGecko
      try {
        const jitoPrice = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=jito-staked-sol&vs_currencies=usd')
        const jitoPriceData = await jitoPrice.json()
        const jitoUsdPrice = parseFloat(jitoPriceData?.['jito-staked-sol']?.usd || 0)
        if (jitoUsdPrice > 0) setJitoSolPrice(jitoUsdPrice)
      } catch(e) {}`,
  ''
)

fs.writeFileSync(hookFile, h)
console.log('✅ usePool.js: CoinGecko entfernt')

// PoolDashboard.jsx: jitoSolPrice -> solPrice
const dashFile = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(dashFile, 'utf8')

c = c.replace(
  "(pool.jitoSolBalance * (pool.jitoSolPrice || pool.solPrice)).toFixed(2)",
  "(pool.jitoSolBalance * pool.solPrice).toFixed(2)"
)

c = c.replace(
  "pool.jitoSolBalance * (pool.jitoSolPrice || pool.solPrice)",
  "pool.jitoSolBalance * pool.solPrice"
)

fs.writeFileSync(dashFile, c)
console.log('✅ PoolDashboard.jsx: solPrice direkt')