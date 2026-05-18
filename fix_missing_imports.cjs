const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// Prüfen ob useWallet/useConnection schon importiert sind
const hasWallet = c.includes('useWallet')
const hasConnection = c.includes('useConnection')
console.log('useWallet:', hasWallet, '| useConnection:', hasConnection)

// Import hinzufügen falls fehlend
if (!hasWallet || !hasConnection) {
  c = c.replace(
    `import { useWallet } from '@solana/wallet-adapter-react'`,
    `import { useWallet, useConnection } from '@solana/wallet-adapter-react'`
  )
  // Falls der Import anders aussieht
  if (!c.includes('useConnection')) {
    c = c.replace(
      /import\s*{\s*useWallet\s*}\s*from\s*['"]@solana\/wallet-adapter-react['"]/,
      `import { useWallet, useConnection } from '@solana/wallet-adapter-react'`
    )
  }
}

// dynamic import ersetzen durch statischen
c = c.replace(
  `const { VersionedTransaction } = await import('@solana/web3.js')`,
  `const { VersionedTransaction } = await import('@solana/web3.js')`
)

fs.writeFileSync(file, c)
console.log('✅ Imports gefixt')