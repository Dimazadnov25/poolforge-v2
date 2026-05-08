const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

c = c.replace(
  '<ByrealDashboard />',
  `<ByrealDashboard />
      <a href="https://app.meteora.ag/pools?token=So11111111111111111111111111111111111111112&token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" target="_blank" rel="noreferrer" style={{
        display:'inline-flex', alignItems:'center', gap:'0.4rem', marginTop:'0.5rem',
        padding:'0.5rem 1.3rem', borderRadius:'4px', textDecoration:'none',
        border:'1px solid rgba(99,102,241,0.35)', color:'rgba(99,102,241,0.8)',
        fontSize:'0.85rem', fontFamily:'Share Tech Mono, monospace',
        textTransform:'uppercase', letterSpacing:'0.08em',
        background:'rgba(99,102,241,0.07)'
      }}>↗ METEORA SOL/USDC POOLS</a>`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Meteora Link eingefügt:', c.includes('METEORA SOL/USDC'))