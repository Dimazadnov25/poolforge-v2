const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "fontSize:'2.2rem',fontWeight:700,color:'#9945FF',fontFamily:'Rajdhani,sans-serif'",
  "fontSize:'2.2rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif'"
)

fs.writeFileSync(file, c)
console.log('✅ JitoSOL Farbe cyan')