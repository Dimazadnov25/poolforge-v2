const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem',marginTop:'0.5rem'`,
  `display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem',marginTop:'0.5rem',width:'100%'`
)

fs.writeFileSync(file, c)
console.log('✅ Meteora Kästen volle Breite')