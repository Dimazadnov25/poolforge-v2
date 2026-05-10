const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
const lines = c.split(/\r?\n/)

// Finde den Grid-Block Start und Ende
let gridStart = -1, gridEnd = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("display:'grid',gridTemplateColumns:'1fr 1fr'")) { gridStart = i; break }
}
// Finde Ende: naechste leere Zeile nach dem Grid
for (let i = gridStart + 1; i < lines.length; i++) {
  if (lines[i].includes('{solVolume')) { gridEnd = i; break }
}

console.log('Grid von Zeile', gridStart+1, 'bis', gridEnd)

const newGrid = `      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
        {pool.solPrice && (
          <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.5rem',border:'1px solid rgba(0,255,255,0.3)'}}>
            <div style={{fontSize:'0.65rem',color:'#ff2244',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>SOL</div>
            <div style={{fontSize:'2.2rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>${'$'}{pool.solPrice.toFixed(2)}</div>
          </div>
        )}
        {solTvl && (
          <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.5rem',border:'1px solid rgba(0,255,255,0.3)'}}>
            <div style={{fontSize:'0.65rem',color:'#ff2244',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>SOLANA TVL</div>
            <div style={{fontSize:'2.2rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>${'$'}{solTvl >= 1e9 ? (solTvl/1e9).toFixed(2)+'B' : (solTvl/1e6).toFixed(1)+'M'}</div>
          </div>
        )}
        {pool.usdcBalance !== undefined && (
          <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.5rem',border:'1px solid rgba(0,255,255,0.3)'}}>
            <div style={{fontSize:'0.65rem',color:'#ff2244',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>USDC Wallet</div>
            <div style={{fontSize:'2.2rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>${'$'}{parseFloat(pool.usdcBalance||0).toFixed(2)}</div>
          </div>
        )}
      </div>
`

lines.splice(gridStart, gridEnd - gridStart, ...newGrid.split('\n'))
fs.writeFileSync('src/components/PoolDashboard.jsx', lines.join('\n'), 'utf8')
console.log('✅ Grid sauber neu geschrieben')