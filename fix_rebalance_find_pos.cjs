const fs = require('fs')
const file = 'api/rebalance.js'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `const accounts = await connection.getProgramAccounts(DLMM_PROGRAM, {
      filters: [
        { dataSize: 8016 },
        { memcmp: { offset: 8, bytes: wallet.toBase58() } }
      ]
    })`,
  `// Alle Positionen der Wallet suchen - verschiedene Größen probieren
    const accounts = await connection.getProgramAccounts(DLMM_PROGRAM, {
      filters: [
        { memcmp: { offset: 8, bytes: wallet.toBase58() } }
      ]
    })`
)

fs.writeFileSync(file, c)
console.log('✅ dataSize Filter entfernt')