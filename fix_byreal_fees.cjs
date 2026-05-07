const fs = require('fs')
let c = fs.readFileSync('api/byreal-positions.js', 'utf8')

// feeOwed bei offset 216 auslesen
c = c.replace(
  'const liquidity = pd.readBigUInt64LE(80)',
  `const liquidity = pd.readBigUInt64LE(80)
      const feeOwed = pd.readBigUInt64LE(216)`
)

c = c.replace(
  'priceLower: tickToPrice(tickLower).toFixed(2),',
  `priceLower: tickToPrice(tickLower).toFixed(2),
        feeOwedUsdc: (Number(feeOwed) / 1e6).toFixed(4),`
)

fs.writeFileSync('api/byreal-positions.js', c)
console.log('✅ feeOwed bei offset 216 hinzugefügt')