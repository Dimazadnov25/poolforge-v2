const fs = require('fs')
let c = fs.readFileSync('src/components/ByrealDashboard.jsx', 'utf8')

c = c.replace(
  /href=\{`https:\/\/www\.byreal\.io\/en\/position\/\${p\.positionPda}`\}/,
  `href="https://www.byreal.io/en/portfolio"`
)

c = c.replace(
  /↗ Position öffnen|↗ Byreal/,
  '↗ Mein Portfolio'
)

fs.writeFileSync('src/components/ByrealDashboard.jsx', c)
console.log('✅ Link → Portfolio')