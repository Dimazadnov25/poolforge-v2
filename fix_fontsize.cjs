const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

const map = {
  "fontSize:'0.95rem'": "fontSize:'1.9rem'",
  "fontSize:'0.65rem'": "fontSize:'1.3rem'",
  "fontSize:'0.6rem'":  "fontSize:'1.2rem'",
  "fontSize:'1.4rem'":  "fontSize:'2.8rem'",
  "fontSize:'0.9rem'":  "fontSize:'1.8rem'",
  "fontSize:'0.78rem'": "fontSize:'1.56rem'",
  "fontSize:'0.85rem'": "fontSize:'1.7rem'",
  "fontSize:'1rem'":    "fontSize:'2rem'"
}

for (const [from, to] of Object.entries(map)) {
  c = c.replaceAll(from, to)
  console.log(from, '->', to)
}

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Alle Schriftgrößen verdoppelt')