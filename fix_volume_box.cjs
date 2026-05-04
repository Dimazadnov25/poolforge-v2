const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

// 1. useState/useEffect import ergänzen
if (!c.includes('useEffect') && !c.includes('useState')) {
  c = c.replace("import React from 'react'", "import React, { useState, useEffect } from 'react'")
} else if (!c.includes('useEffect')) {
  c = c.replace(/import React,\s*\{([^}]+)\}/, (m, g) => `import React, { ${g.trim()}, useEffect }`)
} else if (!c.includes('useState')) {
  c = c.replace(/import React,\s*\{([^}]+)\}/, (m, g) => `import React, { ${g.trim()}, useState }`)
}

// 2. Volume State + Fetch direkt nach der ersten Zeile der Komponente einfügen
// Finde den Anfang der Komponente (export default function PoolDashboard)
const volumeCode = `
  const [solVolume, setSolVolume] = useState(null)

  useEffect(() => {
    const fetchVolume = async () => {
      try {
        const r = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT')
        const d = await r.json()
        if (d.quoteVolume) setSolVolume(parseFloat(d.quoteVolume))
      } catch (e) { /* silent */ }
    }
    fetchVolume()
    const iv = setInterval(fetchVolume, 60000)
    return () => clearInterval(iv)
  }, [])

`

// Nach der ersten öffnenden Zeile der Komponente einfügen (nach "export default function PoolDashboard(...) {")
c = c.replace(
  /export default function PoolDashboard\s*\([^)]*\)\s*\{/,
  m => m + volumeCode
)

// 3. Volume-Kasten neben den Preis einfügen
const oldPrice = `{pool.solPrice && (
              <div className="price-ticker">
                SOL <strong style={{color:'#06b6d4', fontSize:'2rem'}}>${pool.solPrice.toFixed(2)}</strong>

              </div>
            )}`

const newPrice = `<div style={{display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap'}}>
              {pool.solPrice && (
                <div className="price-ticker">
                  SOL <strong style={{color:'#06b6d4', fontSize:'2rem'}}>\${pool.solPrice.toFixed(2)}</strong>
                </div>
              )}
              {solVolume != null && (
                <div className="price-ticker" style={{fontSize:'0.85rem', padding:'0.35rem 0.75rem', display:'flex', flexDirection:'column', alignItems:'center', gap:'0.1rem'}}>
                  <span style={{color:'#94a3b8', fontSize:'0.7rem', letterSpacing:'0.05em', textTransform:'uppercase'}}>Vol 24h</span>
                  <strong style={{color:'#10b981'}}>
                    \${solVolume >= 1e9 ? (solVolume/1e9).toFixed(2)+'B' : solVolume >= 1e6 ? (solVolume/1e6).toFixed(1)+'M' : solVolume.toFixed(0)}
                  </strong>
                </div>
              )}
            </div>`

if (c.includes(oldPrice)) {
  c = c.replace(oldPrice, newPrice)
  console.log('✅ Preis-Block ersetzt')
} else {
  console.log('❌ Preis-Block nicht gefunden – zeige Rohinhalt:')
  console.log(JSON.stringify(c.substring(c.indexOf('price-ticker') - 50, c.indexOf('price-ticker') + 200)))
}

fs.writeFileSync(path, c)
console.log('✅ PoolDashboard.jsx gespeichert')