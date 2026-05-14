const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `onClick={()=>{\n                const maxSol = Math.max(0, (parseFloat(pool.solBalance||0) - 0.03))\n                if(maxSol<=0) return\n                window.location.href='https://jup.ag/swap/SOL-JitoSOL'\n              }} style={{fontSize:'0.6rem',padding:'0.15rem 0.4rem',borderRadius:'3px',border:'1px solid #9945FF',background:'rgba(153,69,255,0.1)',color:'#9945FF',cursor:'pointer',fontFamily:'Share Tech Mono,monospace'}}>MAX SOL → JitoSOL</button>`,
  `style={{fontSize:'0.6rem',padding:'0.15rem 0.4rem',borderRadius:'3px',border:'1px solid #9945FF',background:'rgba(153,69,255,0.1)',color:'#9945FF',cursor:'pointer',fontFamily:'Share Tech Mono,monospace',textDecoration:'none',display:'inline-block'}} href='https://jup.ag/swap/SOL-JitoSOL' target='_blank' rel='noreferrer'>MAX SOL → JitoSOL</a>`
)

// button -> a tag
c = c.replace(
  `<button onClick={()=>{\n                const maxSol = Math.max(0, (parseFloat(pool.solBalance||0) - 0.03))\n                if(maxSol<=0) return\n                window.location.href='https://jup.ag/swap/SOL-JitoSOL'\n              }}`,
  `<a`
)

fs.writeFileSync(file, c)
console.log('✅ MAX SOL als Link')