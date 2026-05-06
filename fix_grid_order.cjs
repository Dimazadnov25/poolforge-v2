const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

c = c.replace(
  `<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.4rem'}}>
              {Object.keys(positionData).length > 0 && (
                <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.5rem 0.6rem',border:'1px solid rgba(0,255,255,0.15)'}}>
                  <div style={{fontSize:'0.6rem',color:'#444',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>SOL</div>
                  <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00ffff',fontFamily:'Orbitron,monospace'}}>\${pool.solPrice.toFixed(2)}</div>
                </div>
              )}
              {pool.solPrice && (`,
  `<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.4rem'}}>
              {pool.solPrice && (
                <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.5rem 0.6rem',border:'1px solid rgba(0,255,255,0.15)'}}>
                  <div style={{fontSize:'0.6rem',color:'#444',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>SOL</div>
                  <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00ffff',fontFamily:'Orbitron,monospace'}}>\${pool.solPrice.toFixed(2)}</div>
                </div>
              )}
              {Object.keys(positionData).length > 0 && (`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Grid Reihenfolge gefixt')