const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// JitoSOL Kasten Border grün
c = c.replace(
  "border:'1px solid rgba(153,69,255,0.4)'",
  "border:'1px solid rgba(0,255,255,0.3)'"
)

// JitoSOL Label Farbe grün
c = c.replace(
  "fontSize:'0.65rem',color:'#9945FF',textTransform:'uppercase'",
  "fontSize:'0.65rem',color:'#ff2244',textTransform:'uppercase'"
)

// MAX SOL Button grün
c = c.replace(
  "border:'1px solid #9945FF',background:'rgba(153,69,255,0.1)',color:'#9945FF'",
  "border:'1px solid rgba(0,255,255,0.3)',background:'rgba(0,255,255,0.05)',color:'#00ffff'"
)

fs.writeFileSync(file, c)
console.log('✅ JitoSOL grün')