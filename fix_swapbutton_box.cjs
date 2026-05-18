const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `<SendWidget wallet={wallet} onRefresh={pool.refreshBalances} />`,
  `<SendWidget wallet={wallet} onRefresh={pool.refreshBalances} />
      <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.5rem',border:'1px solid rgba(0,255,255,0.3)',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.4rem'}}>
        <div style={{fontSize:'0.65rem',color:'#00ffff',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>SWAP</div>
        <SwapButton />
      </div>`
)

fs.writeFileSync(file, c)
console.log('✅ SwapButton Kasten eingebaut')