const fs = require('fs')
const file = 'src/components/ByrealDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')
c = c.replaceAll('#ff2244', '#00ffff')
c = c.replaceAll("color: '#ff", "color: '#00ff")
fs.writeFileSync(file, c)
console.log('✅ Byreal cyan')