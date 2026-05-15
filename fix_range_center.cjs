const fs = require('fs')
const file = 'src/components/PositionDetails.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'0.75rem'",
  "display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'0.75rem', maxWidth:'320px', margin:'0 auto 0.75rem auto'"
)

fs.writeFileSync(file, c)
console.log('✅ Range Grid zentriert')