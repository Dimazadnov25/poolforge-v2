const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// ByrealDashboard nach PriceAlert verschieben
c = c.replace('\n      <ByrealDashboard />\n', '\n')
c = c.replace(
  '<PriceAlert solPrice={pool.solPrice} />',
  '<PriceAlert solPrice={pool.solPrice} />\n\n      <ByrealDashboard />'
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Byreal nach oben')