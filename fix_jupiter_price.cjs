const fs = require('fs')
let c = fs.readFileSync('api/monitor-position.js', 'utf8')

c = c.replace(
  /let currentPrice = null[\s\S]*?if \(!currentPrice\) return res\.json\(\{ ok: true, message: 'Price unavailable' \}\)/,
  `let currentPrice = null
    try {
      const r = await fetch('https://price.jup.ag/v6/price?ids=SOL')
      const d = await r.json()
      if (d?.data?.SOL?.price) currentPrice = d.data.SOL.price
    } catch(e) {}
    if (!currentPrice) return res.json({ ok: true, message: 'Price unavailable' })`
)

fs.writeFileSync('api/monitor-position.js', c)
console.log('✅ Jupiter Price API')