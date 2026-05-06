const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Wallet Balance Box aus dem Grid entfernen
c = c.replace(
  /\{wallet\.connected && \(\s*<div style=\{\{background:'#111'[\s\S]*?SOL\/USDC[\s\S]*?<\/div>\s*\)\}/,
  ''
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Wallet Box entfernt:', !c.includes('SOL/USDC'))