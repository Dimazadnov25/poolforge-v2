const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

c = c.replace(
  `style={{fontSize:'0.85rem',padding:'0.35rem 0.75rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.1rem'}}`,
  `style={{fontSize:'1rem',padding:'0.5rem 1.2rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.2rem'}}`
)

c = c.replace(
  `style={{color:'#94a3b8',fontSize:'0.7rem',letterSpacing:'0.05em',textTransform:'uppercase'}}`,
  `style={{color:'#94a3b8',fontSize:'0.75rem',letterSpacing:'0.05em',textTransform:'uppercase'}}`
)

c = c.replace(
  `<strong style={{color:'#10b981'}}>`,
  `<strong style={{color:'#10b981',fontSize:'1.6rem'}}>`
)

fs.writeFileSync(path, c)
console.log('✅ Fertig')