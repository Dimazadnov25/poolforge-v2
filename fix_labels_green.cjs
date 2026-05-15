const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// Alle Label-Farben von rot auf cyan
c = c.replaceAll("fontSize:'0.65rem',color:'#ff2244',textTransform:'uppercase'", "fontSize:'0.65rem',color:'#00ffff',textTransform:'uppercase'")

fs.writeFileSync(file, c)
console.log('✅ Alle Labels cyan')