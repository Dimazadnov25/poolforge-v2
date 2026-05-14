const fs = require('fs')
const file = 'src/hooks/usePool.js'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "const jitoPrice = await fetch('https://lite-api.jup.ag/price/v2?ids=J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn')\n        const jitoPriceData = await jitoPrice.json()\n        const jitoUsdPrice = parseFloat(jitoPriceData?.data?.['J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn']?.price || 0)",
  "const jitoPrice = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=jito-staked-sol&vs_currencies=usd')\n        const jitoPriceData = await jitoPrice.json()\n        const jitoUsdPrice = parseFloat(jitoPriceData?.['jito-staked-sol']?.usd || 0)"
)

fs.writeFileSync(file, c)
console.log('✅ JitoSOL Preis via CoinGecko')