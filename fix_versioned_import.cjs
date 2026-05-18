const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// Dynamic import entfernen
c = c.replace(
  `const { VersionedTransaction } = await import('@solana/web3.js')`,
  ``
)

// Statischen Import oben hinzufügen falls noch nicht da
if (!c.includes('VersionedTransaction')) {
  c = c.replace(
    `import { useWallet, useConnection } from '@solana/wallet-adapter-react'`,
    `import { useWallet, useConnection } from '@solana/wallet-adapter-react'\nimport { VersionedTransaction } from '@solana/web3.js'`
  )
}

fs.writeFileSync(file, c)
console.log('✅ VersionedTransaction statisch importiert')