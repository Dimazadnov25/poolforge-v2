const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// VersionedTransaction hinzufügen
c = c.replace(
  `import { useWallet, useConnection } from '@solana/wallet-adapter-react'`,
  `import { useWallet, useConnection } from '@solana/wallet-adapter-react'\nimport { VersionedTransaction } from '@solana/web3.js'`
)

// Tote Imports entfernen
c = c.replace(/import ByrealDashboard from '\.\/ByrealDashboard'\n/, '')
c = c.replace(/import HawkDashboard from '\.\/HawkDashboard'\n/, '')
c = c.replace(/import SolChart from '\.\/SolChart'\n/, '')

fs.writeFileSync(file, c)
console.log('✅ Imports gefixt')