const fs = require('fs')
let c = fs.readFileSync('api/monitor-position.js', 'utf8')

c = c.replace(
  `const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
    const priceData = await priceRes.json()
    const currentPrice = parseFloat(priceData.price)

    if (isNaN(currentPrice)) {
      // Fallback CoinGecko
      const r2 = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      const d2 = await r2.json()
      if (!d2?.solana?.usd) return res.json({ ok: true, message: 'Price unavailable' })
    }`,
  `let currentPrice = null
    try {
      const r1 = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
      const d1 = await r1.json()
      if (d1.price) currentPrice = parseFloat(d1.price)
    } catch(e) {}
    if (!currentPrice) {
      try {
        const r2 = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        const d2 = await r2.json()
        if (d2?.solana?.usd) currentPrice = d2.solana.usd
      } catch(e) {}
    }
    if (!currentPrice) return res.json({ ok: true, message: 'Price unavailable' })`
)

fs.writeFileSync('api/monitor-position.js', c)
console.log('✅ Price fetch gefixt')