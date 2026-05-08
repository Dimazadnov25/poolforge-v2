const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// 1. Trend fetch useEffect hinzufuegen - nach solVolume useEffect
const trendEffect = `
  useEffect(() => {
    const loadTrend = async () => {
      try {
        const r = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT')
        const d = await r.json()
        setSolTrend(parseFloat(d.priceChangePercent))
      } catch(e) {}
    }
    loadTrend()
    const iv = setInterval(loadTrend, 60000)
    return () => clearInterval(iv)
  }, [])
`

// Vor dem ersten return einfuegen
const returnIdx = c.lastIndexOf('return (')
c = c.slice(0, returnIdx) + trendEffect + c.slice(returnIdx)

// 2. Meteora + Trend Box nebeneinander
c = c.replace(
  `}}>↗ METEORA 10 BIN</a>`,
  `}}>↗ METEORA 10 BIN</a></div>`
)
c = c.replace(
  `<a href="https://www.meteora.ag/dlmm/BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y?referrer=pools"`,
  `<div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
      <a href="https://www.meteora.ag/dlmm/BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y?referrer=pools"`
)

// Trend Box nach dem schliessenden </a></div>
c = c.replace(
  `}}>↗ METEORA 10 BIN</a></div>`,
  `}}>↗ METEORA 10 BIN</a>
      {solTrend !== null && (
        <div style={{
          padding:'0.45rem 0.9rem', borderRadius:'6px', fontWeight:700, fontSize:'0.9rem',
          fontFamily:'Share Tech Mono, monospace',
          border: solTrend >= 0 ? '2px solid rgba(0,255,136,0.4)' : '2px solid rgba(255,34,68,0.4)',
          background: solTrend >= 0 ? 'rgba(0,255,136,0.07)' : 'rgba(255,34,68,0.07)',
          color: solTrend >= 0 ? '#00ff88' : '#ff2244'
        }}>{solTrend >= 0 ? '▲' : '▼'} {Math.abs(solTrend).toFixed(2)}%</div>
      )}
      </div>`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Trend Effect:', c.includes('priceChangePercent'))
console.log('✅ Flex Div:', c.includes("display:'flex',gap:'0.4rem'"))
console.log('✅ Trend Box:', c.includes('solTrend >= 0'))