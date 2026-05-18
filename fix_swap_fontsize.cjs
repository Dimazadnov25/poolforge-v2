const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `fontSize:'0.6rem',padding:'0.15rem 0.4rem',borderRadius:'3px',
      border:'1px solid rgba(0,255,255,0.3)',background:'rgba(0,255,255,0.05)',
      color:'#00ffff',fontFamily:'Share Tech Mono,monospace',cursor:'pointer',
      minWidth:'120px'`,
  `fontSize:'1.3rem',padding:'0.5rem 1.5rem',borderRadius:'6px',
      border:'1px solid rgba(0,255,255,0.3)',background:'rgba(0,255,255,0.05)',
      color:'#00ffff',fontFamily:'Rajdhani,sans-serif',fontWeight:700,cursor:'pointer',
      minWidth:'200px'`
)

fs.writeFileSync(file, c)
console.log('✅ SwapButton Schrift größer')