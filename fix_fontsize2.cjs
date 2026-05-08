const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

const map = {
  "fontSize:'1.9rem'":  "fontSize:'1.425rem'",
  "fontSize:'1.3rem'":  "fontSize:'0.975rem'",
  "fontSize:'1.2rem'":  "fontSize:'0.9rem'",
  "fontSize:'2.8rem'":  "fontSize:'2.1rem'",
  "fontSize:'1.8rem'":  "fontSize:'1.35rem'",
  "fontSize:'1.56rem'": "fontSize:'1.17rem'",
  "fontSize:'1.7rem'":  "fontSize:'1.275rem'",
  "fontSize:'2rem'":    "fontSize:'1.5rem'"
}

for (const [from, to] of Object.entries(map)) {
  c = c.replaceAll(from, to)
  console.log(from, '->', to)
}

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Schriftgrößen auf 150% gesetzt')