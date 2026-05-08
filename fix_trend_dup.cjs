const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

const dup = `
      {solTrend !== null && (
        <div style={{
          padding:'0.45rem 0.9rem', borderRadius:'6px', fontWeight:700, fontSize:'0.9rem',
          fontFamily:'Share Tech Mono, monospace',
          border: solTrend >= 0 ? '2px solid rgba(0,255,136,0.4)' : '2px solid rgba(255,34,68,0.4)',
          background: solTrend >= 0 ? 'rgba(0,255,136,0.07)' : 'rgba(255,34,68,0.07)',
          color: solTrend >= 0 ? '#00ff88' : '#ff2244'
        }}>{solTrend >= 0 ? '▲' : '▼'} {Math.abs(solTrend).toFixed(2)}%</div>
      )}`

c = c.replace(dup, '')
fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Duplikat entfernt, Anzahl solTrend blocks:', (c.match(/solTrend !== null/g)||[]).length)