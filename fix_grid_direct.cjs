const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Altes Grid komplett ersetzen
const oldGrid = c.substring(c.indexOf("<div style={{display:'grid'"), c.indexOf('</div>', c.indexOf("<div style={{display:'grid'")) + 6)

const newGrid = `<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.4rem'}}>
              {pool.solPrice && (
                <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.5rem 0.6rem',border:'1px solid rgba(0,255,255,0.15)'}}>
                  <div style={{fontSize:'0.6rem',color:'#444',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>SOL</div>
                  <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00ffff',fontFamily:'Orbitron,monospace'}}>\${pool.solPrice.toFixed(2)}</div>
                </div>
              )}
              {solVolume != null && (
                <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.5rem 0.6rem',border:'1px solid rgba(0,255,255,0.15)'}}>
                  <div style={{fontSize:'0.6rem',color:'#444',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>Vol 24h</div>
                  <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00ff88',fontFamily:'Orbitron,monospace'}}>
                    \${solVolume>=1e9?(solVolume/1e9).toFixed(1)+'B':solVolume>=1e6?(solVolume/1e6).toFixed(0)+'M':solVolume.toFixed(0)}
                  </div>
                </div>
              )}
              {Object.keys(positionData).length > 0 && totalClaim > 0 && (
                <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.5rem 0.6rem',border:'1px solid rgba(255,34,68,0.3)'}}>
                  <div style={{fontSize:'0.6rem',color:'#444',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>Claim</div>
                  <div style={{fontSize:'1.4rem',fontWeight:700,color:'#ff2244',fontFamily:'Orbitron,monospace'}}>\${totalClaim.toFixed(2)}</div>
                </div>
              )}
            </div>`

c = c.replace(oldGrid, newGrid)
fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Grid neu geschrieben')
console.log('SOL zuerst:', c.indexOf('SOL</div>') < c.indexOf('Claim</div>'))