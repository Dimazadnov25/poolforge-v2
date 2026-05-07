const fs = require('fs')
let c = fs.readFileSync('api/monitor-position.js', 'utf8')
c = c.replace(
  /let currentPrice = null[\s\S]*?if \(!currentPrice\) return res\.json\(\{ ok: true, message: 'Price unavailable' \}\)/,
  `let currentPrice = null
    try {
      const r = await fetch('https://poolforge-v2.vercel.app/api/sol-price')
      const d = await r.json()
      if (d?.price) currentPrice = d.price
    } catch(e) {}
    if (!currentPrice) return res.json({ ok: true, message: 'Price unavailable' })`
)
fs.writeFileSync('api/monitor-position.js', c)
console.log('✅ Pyth price API')