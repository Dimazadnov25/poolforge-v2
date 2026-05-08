const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

c = c.replace(
  'https://app.meteora.ag/pools?token=So11111111111111111111111111111111111111112&token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'https://www.meteora.ag/dlmm/BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y?referrer=pools'
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Meteora URL aktualisiert:', c.includes('BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y'))