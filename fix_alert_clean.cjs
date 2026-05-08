const fs = require('fs')
let c = fs.readFileSync('src/components/PriceAlert.jsx', 'utf8')

// "🔔 ntfy:" Label entfernen
c = c.replace(/<span[^>]*>🔔 ntfy:<\/span>\s*/g, '')
c = c.replace(/<span[^>]*>🔔 Alert:<\/span>\s*/g, '')

// Array sicherstellen: [0.5, 1, 2, 3]
c = c.replace(/\[0\.1,\s*0\.5,\s*1,\s*2,\s*3\]/, '[0.5, 1, 2, 3]')
c = c.replace(/\[1,\s*2,\s*3\]/, '[0.5, 1, 2, 3]')
c = c.replace(/\[1,\s*2,\s*3,\s*5\]/, '[0.5, 1, 2, 3]')

// flex container: gap kleiner, wrap weg
c = c.replace("gap:'0.5rem', flexWrap:'wrap'", "gap:'0.4rem'")

fs.writeFileSync('src/components/PriceAlert.jsx', c)
console.log('✅ Label weg, Array:', (c.match(/\[0\.5,\s*1,\s*2,\s*3\]/)||['❌'])[0])