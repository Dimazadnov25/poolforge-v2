const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
const lines = c.split(/\r?\n/)

// Zeilen 99-120 (0-indexed: 98-119) entfernen — zweiter TVL Block
// Finde den zweiten {solTvl && ( Block
let count = 0
let start2 = -1, end2 = -1
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{solTvl && (')) {
    count++
    if (count === 2) { start2 = i; break }
  }
}
if (start2 > -1) {
  // Finde das Ende dieses Blocks: )}\n
  for (let i = start2; i < lines.length; i++) {
    if (lines[i].trim() === ')}') { end2 = i; break }
  }
  lines.splice(start2, end2 - start2 + 1)
  console.log('✅ Duplikat TVL entfernt, Zeilen', start2+1, '-', end2+1)
}

// Ersetze ersten TVL Block durch USDC-Balance Kasten
c = lines.join('\n')
const tvlBlock = `        {solTvl && (
          <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.5rem',border:'1px solid rgba(0,255,255,0.3)'}}>
            <div style={{fontSize:'0.65rem',color:'#ff2244',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>SOLANA TVL</div>
            <strong style={{color:'#00ffff',fontSize:'1.6rem',fontFamily:'Share Tech Mono,monospace'}}>
              \${solTvl >= 1e9 ? (solTvl/1e9).toFixed(2)+'B' : solTvl >= 1e6 ? (solTvl/1e6).toFixed(1)+'M' : solTvl.toFixed(0)}
            </strong>
          </div>
        )}`

const tvlIdx = c.indexOf('{solTvl && (')
const tvlEnd = c.indexOf(')}', tvlIdx) + 2
c = c.slice(0, tvlIdx) + tvlBlock + c.slice(tvlEnd)

// USDC Balance Kasten nach SOL-Preis-Block einbauen
const usdcBox = `
        {pool.usdcBalance !== undefined && (
          <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.5rem',border:'1px solid rgba(0,255,255,0.3)'}}>
            <div style={{fontSize:'0.65rem',color:'#ff2244',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>USDC Wallet</div>
            <strong style={{color:'#00ffff',fontSize:'1.6rem',fontFamily:'Share Tech Mono,monospace'}}>
              \${parseFloat(pool.usdcBalance||0).toFixed(2)}
            </strong>
          </div>
        )}`

// Nach dem TVL-Block einfügen
const afterTvl = c.indexOf(')}', c.indexOf('SOLANA TVL')) + 2
c = c.slice(0, afterTvl) + usdcBox + c.slice(afterTvl)

// TVL useEffect sicherstellen — falls nicht vorhanden
if (!c.includes('llama.fi')) {
  const returnIdx = c.lastIndexOf('\n  return (')
  const tvlEffect = `
  useEffect(() => {
    const fetchTvl = async () => {
      try {
        const r = await fetch('https://api.llama.fi/v2/chains')
        const chains = await r.json()
        const sol = chains.find(ch => ch.name === 'Solana')
        if (sol?.tvl) setSolTvl(sol.tvl)
      } catch(e) {}
    }
    fetchTvl()
    const id = setInterval(fetchTvl, 60000)
    return () => clearInterval(id)
  }, [])
`
  c = c.slice(0, returnIdx) + tvlEffect + c.slice(returnIdx)
  console.log('✅ TVL useEffect hinzugefügt')
} else {
  console.log('✅ TVL useEffect bereits vorhanden')
}

fs.writeFileSync('src/components/PoolDashboard.jsx', c, 'utf8')
console.log('✅ Fertig')