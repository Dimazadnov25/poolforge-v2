const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// JitoSOL outputMint → USDC
c = c.replace(
  `outputMint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'`,
  `outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'`
)

// Button Text
c = c.replace(/MAX SOL \\u2192 JitoSOL/g, 'MAX SOL \\u2192 USDC')
c = c.replaceAll('MAX SOL → JitoSOL', 'MAX SOL → USDC')

fs.writeFileSync(file, c)
console.log('✅ Swap auf USDC geändert')