const fs = require('fs')
const file = 'src/hooks/usePool.js'
let c = fs.readFileSync(file, 'utf8')

// JitoSOL Preis via eigene Vercel API
c = c.replace(
  "      } catch(e) { setJitoSolBalance(0) }",
  `      } catch(e) { setJitoSolBalance(0) }
      try {
        const r = await fetch('/api/jitosol-price')
        const d = await r.json()
        if (d.price) setJitoSolPrice(d.price)
      } catch(e) {}`
)

// jitoSolPrice im return sicherstellen
if (!c.includes('jitoSolPrice,')) {
  c = c.replace(
    'jitoSolBalance,',
    'jitoSolBalance, jitoSolPrice,'
  )
}

fs.writeFileSync(file, c)
console.log('✅ JitoSOL Preis via /api/jitosol-price')