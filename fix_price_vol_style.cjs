const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Äußerer Container - fest nebeneinander
c = c.replace(
  "style={{display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}",
  "style={{display:'flex',alignItems:'stretch',gap:'0.75rem'}}"
)

// Vol 24h Box - gleiche Größe wie Preis Box
c = c.replace(
  `style={{fontSize:'1rem',padding:'0.5rem 1.2rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.2rem'}}`,
  `style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'0.2rem'}}`
)

// Vol Zahl - gleiche Größe wie SOL Preis
c = c.replace(
  `style={{color:'#10b981',fontSize:'1.6rem'}}`,
  `style={{color:'#10b981',fontSize:'2rem',fontWeight:'bold'}}`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Preis + Vol gleich groß nebeneinander')