const fs = require('fs')
let c = fs.readFileSync('monitor.cjs', 'utf8')

// Binance API durch CoinGecko ersetzen (zuverlässiger in GitHub Actions)
c = c.replace(
  `const priceData = await fetchJSON('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
  const currentPrice = parseFloat(priceData.price)`,
  `// Mehrere Quellen versuchen
  let currentPrice = NaN
  try {
    const r1 = await fetchJSON('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
    currentPrice = parseFloat(r1.price)
  } catch(e) {}
  if (isNaN(currentPrice)) {
    try {
      const r2 = await fetchJSON('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      currentPrice = r2.solana.usd
    } catch(e) {}
  }
  if (isNaN(currentPrice)) {
    console.log('❌ Preis nicht verfügbar')
    process.exit(0)
  }`
)

fs.writeFileSync('monitor.cjs', c)
console.log('✅ Price fetch gefixt')