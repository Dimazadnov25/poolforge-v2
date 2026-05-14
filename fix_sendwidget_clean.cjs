const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// Alles was mit SendWidget zu tun hat entfernen
c = c.replace(/\n\s*function SendWidget[\s\S]*?\n  }/m, '')
c = c.replace(/\n\s*<SendWidget[^/]*\/>/g, '')
c = c.replace(/\n\s*<SendWidget[\s\S]*?\/>/g, '')

fs.writeFileSync(file, c)
console.log('✅ SendWidget komplett entfernt')