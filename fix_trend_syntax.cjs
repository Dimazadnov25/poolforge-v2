const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Zeile 124 Bereich anzeigen
const lines = c.split('\n')
console.log('Zeilen 118-128:')
lines.slice(117,128).forEach((l,i) => console.log(i+118, l))