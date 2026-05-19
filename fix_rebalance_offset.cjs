const fs = require('fs')
const file = 'api/rebalance.js'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `{ memcmp: { offset: 8, bytes: wallet.toBase58() } }`,
  `{ memcmp: { offset: 40, bytes: wallet.toBase58() } }`
)

fs.writeFileSync(file, c)
console.log('✅ Offset auf 40 geändert')