const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

// Finde den kaputten Block (von PriceAlert bis solTrend Ende) und ersetze ihn komplett
const oldBlock = c.match(/<PriceAlert[\s\S]*?<\/div>\s*\n\s*\{solTrend[\s\S]*?<\/div>\s*\n\s*\}/)?.[0]
if (!oldBlock) { console.log('Block nicht gefunden, zeige Bereich:'); console.log(JSON.stringify(c.substring(c.indexOf('PriceAlert'), c.indexOf('PriceAlert')+600))); process.exit(1) }

const newBlock = `<PriceAlert solPrice={pool.solPrice} />
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'0.4rem',width:'100%'}}>
        <div style={{display:'flex',gap:'0.4rem',alignItems:'stretch',width:'100%',justifyContent:'center'}}>
          <div style={{flex:1}}><ByrealDashboard /></div>
          {tvl !== null && (
            <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              padding:'1rem 0.5rem',borderRadius:'6px',fontWeight:700,
              border:'1px solid rgba(0,255,255,0.3)',background:'rgba(0,255,255,0.05)'}}>
              <div style={{fontSize:'0.65rem',color:'#ff2244',fontFamily:'Share Tech Mono,monospace',textTransform:'uppercase'}}>TVL</div>
              <div style={{fontSize:'1.3rem',color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>
                {tvl>=1e6?'$'+(tvl/1e6).toFixed(1)+'M':'$'+tvl.toFixed(0)}
              </div>
            </div>
          )}
        </div>
        {solTrend !== null && (
          <div style={{
            padding:'0.45rem 0.9rem', borderRadius:'6px', fontWeight:700, fontSize:'1.35rem',
            fontFamily:'Share Tech Mono, monospace',
            border: solTrend >= 0 ? '2px solid rgba(0,255,136,0.4)' : '2px solid rgba(255,34,68,0.4)',
            background: solTrend >= 0 ? 'rgba(0,255,136,0.07)' : 'rgba(255,34,68,0.07)',
            color: solTrend >= 0 ? '#00ff88' : '#ff2244'
          }}>{solTrend >= 0 ? '▲' : '▼'} {Math.abs(solTrend).toFixed(2)}%</div>
        )}`

c = c.replace(oldBlock, newBlock)
fs.writeFileSync(path, c)
console.log('✅ Byreal + TVL zentriert, TVL-String gefixt')