const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "onClick={async()=>{\n                const maxSol = Math.max(0, (parseFloat(pool.solBalance||0) - 0.03))\n                if(maxSol<=0) return\n                window.open('https://jup.ag/swap/SOL-JitoSOL?inAmount='+maxSol,'_blank')\n              }}",
  "onClick={()=>{\n                const maxSol = Math.max(0, (parseFloat(pool.solBalance||0) - 0.03))\n                if(maxSol<=0) return\n                window.location.href='https://jup.ag/swap/SOL-JitoSOL'\n              }}"
)

fs.writeFileSync(file, c)
console.log('✅ MAX SOL Button gefixt')