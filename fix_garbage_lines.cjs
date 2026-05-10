const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

const GARBAGE = `\n}+(tvl/1e6).toFixed(1)+'M':':\n      </div>\n      {solTrend !== null && (\n        <div style={{\n          padding:'0.45rem 0.9rem', borderRadius:'6px', fontWeight:700, fontSize:'1.35rem',\n          fontFamily:'Share Tech Mono, monospace',\n          border: solTrend >= 0 ? '2px solid rgba(0,255,136,0.4)' : '2px solid rgba(255,34,68,0.4)',\n          background: solTrend >= 0 ? 'rgba(0,255,136,0.07)' : 'rgba(255,34,68,0.07)',\n          color: solTrend >= 0 ? '#00ff88' : '#ff2244'\n        }}>{solTrend >= 0 ? '▲' : '▼'} {Math.abs(solTrend).toFixed(2)}%</div>\n      )}`

const idx = c.indexOf(GARBAGE)
if (idx === -1) {
  // Versuche nur die erste Zeile zu finden
  const idx2 = c.indexOf("\n}+(tvl/1e6)")
  if (idx2 === -1) { console.log('Nichts gefunden'); process.exit(1) }
  // Finde Ende: nach dem letzten )}
  const after = c.substring(idx2)
  const endMatch = after.match(/\)\}(\n|\r\n)/)
  if (!endMatch) { console.log('Kein Ende gefunden'); process.exit(1) }
  const endIdx = idx2 + after.indexOf(endMatch[0]) + endMatch[0].length
  c = c.substring(0, idx2) + c.substring(endIdx)
  console.log('✅ Garbage via Fallback entfernt')
} else {
  c = c.replace(GARBAGE, '')
  console.log('✅ Garbage direkt entfernt')
}

fs.writeFileSync(path, c)