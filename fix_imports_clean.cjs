const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// useConnection hinzufügen
c = c.replace(
  `import { useWallet } from '@solana/wallet-adapter-react'`,
  `import { useWallet, useConnection } from '@solana/wallet-adapter-react'`
)

// ByrealDashboard + HawkDashboard Imports entfernen
c = c.replace(/import ByrealDashboard from '\.\/ByrealDashboard'\n/, '')
c = c.replace(/import HawkDashboard from '\.\/HawkDashboard'\n/, '')

// JSX Tags entfernen falls noch vorhanden
c = c.replace(/\s*<ByrealDashboard\s*\/>/, '')
c = c.replace(/\s*<HawkDashboard\s*\/>/, '')

fs.writeFileSync(file, c)
console.log('✅ Imports gefixt')