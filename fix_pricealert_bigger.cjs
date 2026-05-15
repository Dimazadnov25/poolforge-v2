const fs = require('fs')
const file = 'src/components/PriceAlert.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "fontSize:'0.75rem',color:'#94a3b8',fontFamily:'Share Tech Mono,monospace'",
  "fontSize:'1rem',color:'#94a3b8',fontFamily:'Share Tech Mono,monospace'"
)
c = c.replace(
  "fontSize:'1rem',fontWeight:700,fontFamily:'Share Tech Mono,monospace',color:Math.abs(change)>activeAlert*0.7?'#fb923c':change>=0?'#00ff88':'#ff2244'",
  "fontSize:'1.5rem',fontWeight:700,fontFamily:'Share Tech Mono,monospace',color:Math.abs(change)>activeAlert*0.7?'#fb923c':change>=0?'#00ff88':'#ff2244'"
)
c = c.replace(
  "fontSize:'0.7rem',color:'#f59e0b',fontFamily:'Share Tech Mono,monospace'",
  "fontSize:'0.9rem',color:'#f59e0b',fontFamily:'Share Tech Mono,monospace'"
)

fs.writeFileSync(file, c)
console.log('✅ Ref Info Kasten größer')