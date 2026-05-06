const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Nach MeteoraDashboard einfügen
c = c.replace(
  /<MeteoraDashboard solPrice={pool\.solPrice}[^/]*\/>/,
  m => m + '\n            <ByrealDashboard solPrice={pool.solPrice} />'
)

// Falls MeteoraDashboard nicht gefunden, nach LendDashboard
if (!c.includes('<ByrealDashboard')) {
  c = c.replace(
    /<LendDashboard/,
    '<ByrealDashboard solPrice={pool.solPrice} />\n            <LendDashboard'
  )
}

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('Eingebaut:', c.includes('<ByrealDashboard'))