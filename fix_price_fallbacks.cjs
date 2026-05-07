const fs = require('fs')

// sol-price.js mit mehreren Quellen
const solPrice = `export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=30')
  
  const sources = [
    async () => {
      const r = await fetch('https://hermes.pyth.network/v2/updates/price/latest?ids[]=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d')
      const d = await r.json()
      return Math.abs(d.parsed[0].price.price * Math.pow(10, d.parsed[0].price.expo))
    },
    async () => {
      const r = await fetch('https://api.kraken.com/0/public/Ticker?pair=SOLUSD')
      const d = await r.json()
      return parseFloat(d.result.SOLUSD.c[0])
    },
    async () => {
      const r = await fetch('https://api.coinbase.com/v2/prices/SOL-USD/spot')
      const d = await r.json()
      return parseFloat(d.data.amount)
    }
  ]
  
  for (const source of sources) {
    try {
      const price = await source()
      if (price && price > 1) return res.json({ price })
    } catch(e) {}
  }
  
  res.status(500).json({ error: 'All price sources failed' })
}
`
fs.writeFileSync('api/sol-price.js', solPrice)
console.log('✅ sol-price.js mit 3 Fallbacks')