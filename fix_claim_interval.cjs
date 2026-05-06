const fs = require('fs')
let c = fs.readFileSync('src/components/PositionDetails.jsx', 'utf8')

// Intervall von 60000 auf 10000 reduzieren
c = c.replace('setInterval(load, 60000)', 'setInterval(load, 10000)')

fs.writeFileSync('src/components/PositionDetails.jsx', c)
console.log('✅ Intervall auf 10 Sekunden')