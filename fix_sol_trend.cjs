const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// 1. solTrend State hinzufuegen nach erstem useState
c = c.replace(
  'const [solVolume, setSolVolume] = useState(null)',
  'const [solVolume, setSolVolume] = useState(null)\n  const [solTrend, setSolTrend] = useState(null)'
)

// 2. Trend fetch - Binance 24h change
const fetchTrend = `
  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT')
        const d = await r.json()
        setSolTrend(parseFloat(d.priceChangePercent))
      } catch(e) {}
    }
    load()
    const iv = setInterval(load, 60000)
    return () => clearInterval(iv)
  }, [])\n`

// Nach dem solVolume useEffect einfuegen
c = c.replace(
  "}, [])\n  useEffect(() => {\n    const iv = setInterval(() => {\n      if (pool.refreshBalances)",
  `}, [])${fetchTrend}  useEffect(() => {\n    const iv = setInterval(() => {\n      if (pool.refreshBalances)`
)

// 3. Meteora Link + Trend nebeneinander in flex div
c = c.replace(
  `}}>↗ METEORA 10 BIN</a>`,
  `}}>↗ METEORA 10 BIN</a>
      {solTrend !== null && (
        <div style={{
          padding:'0.45rem 0.9rem', borderRadius:'6px', fontWeight:700, fontSize:'0.9rem',
          fontFamily:'Share Tech Mono, monospace',
          border: solTrend >= 0 ? '2px solid rgba(0,255,136,0.4)' : '2px solid rgba(255,34,68,0.4)',
          background: solTrend >= 0 ? 'rgba(0,255,136,0.07)' : 'rgba(255,34,68,0.07)',
          color: solTrend >= 0 ? '#00ff88' : '#ff2244'
        }}>{solTrend >= 0 ? '▲' : '▼'} {Math.abs(solTrend).toFixed(2)}%</div>
      )}`
)

// 4. Beide in flex div wrappen
c = c.replace(
  `<a href="https://www.meteora.ag/dlmm/BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y?referrer=pools"`,
  `<div style={{display:'flex', gap:'0.4rem', alignItems:'center'}}>\n      <a href="https://www.meteora.ag/dlmm/BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y?referrer=pools"`
)
c = c.replace(
  `}}>↗ METEORA 10 BIN</a>
      {solTrend !== null`,
  `}}>↗ METEORA 10 BIN</a>
      {solTrend !== null`
)
// flex div schliessen nach trend box
c = c.replace(
  `color: solTrend >= 0 ? '#00ff88' : '#ff2244'\n        }}>{solTrend >= 0 ? '▲' : '▼'} {Math.abs(solTrend).toFixed(2)}%</div>\n      )}`,
  `color: solTrend >= 0 ? '#00ff88' : '#ff2244'\n        }}>{solTrend >= 0 ? '▲' : '▼'} {Math.abs(solTrend).toFixed(2)}%</div>\n      )}\n      </div>`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ SOL Trend eingebaut:', c.includes('solTrend'))