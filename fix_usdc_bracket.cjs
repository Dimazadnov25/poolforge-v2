const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "fontFamily:'Rajdhani,sans-serif'}><span>${parseFloat(pool.usdcBalance||0).toFixed(2)}",
  "fontFamily:'Rajdhani,sans-serif'}}><span>${parseFloat(pool.usdcBalance||0).toFixed(2)}"
)

fs.writeFileSync(file, c)
console.log('✅ Klammer korrigiert')