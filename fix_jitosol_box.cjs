const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const idx = c.indexOf("border:'1px solid rgba(153,69,255,0.4)'")
if (idx === -1) { console.log('❌ Kasten nicht gefunden'); process.exit(1) }

const boxStart = c.lastIndexOf('\n        {pool.solPrice', idx)
const boxEnd = c.indexOf('\n        )}', idx) + '\n        )}'.length

const newBox = `
        {pool.solPrice && (
          <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.5rem',border:'1px solid rgba(153,69,255,0.4)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:'0.65rem',color:'#9945FF',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>JitoSOL</div>
              <a href="https://jup.ag/swap/SOL-JitoSOL" target="_blank" rel="noreferrer" style={{fontSize:'0.6rem',padding:'0.15rem 0.4rem',borderRadius:'3px',border:'1px solid #9945FF',background:'rgba(153,69,255,0.1)',color:'#9945FF',fontFamily:'Share Tech Mono,monospace',textDecoration:'none'}}>MAX SOL → JitoSOL</a>
            </div>
            <div style={{fontSize:'2.2rem',fontWeight:700,color:'#9945FF',fontFamily:'Rajdhani,sans-serif'}}>
              <span>{pool.jitoSolBalance > 0 ? (pool.jitoSolBalance * pool.solPrice).toFixed(2) : '0.00'}</span>
              {jitoSolTrend !== null && <span style={{fontSize:'0.85rem',fontWeight:700,marginLeft:'0.4rem',fontFamily:'Share Tech Mono,monospace',color:jitoSolTrend>=0?'#00ff88':'#ff2244'}}>{jitoSolTrend>=0?'+':''}{jitoSolTrend.toFixed(2)}%</span>}
            </div>
            <div style={{fontSize:'0.7rem',color:'#888',fontFamily:'Share Tech Mono,monospace'}}>{pool.jitoSolBalance > 0 ? pool.jitoSolBalance.toFixed(4) : '0.0000'} JitoSOL</div>
          </div>
        )}`

c = c.substring(0, boxStart) + newBox + c.substring(boxEnd)
fs.writeFileSync(file, c)
console.log('✅ JitoSOL Kasten komplett neu geschrieben')