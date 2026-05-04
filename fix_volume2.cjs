const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

// 1. useState/useEffect sicherstellen
if (!c.includes('useEffect') && c.includes("import React from 'react'")) {
  c = c.replace("import React from 'react'", "import React, { useState, useEffect } from 'react'")
} else if (!c.includes('useEffect') && !c.includes('useState')) {
  c = c.replace(/import React,\s*\{([^}]+)\}/, (m,g) => `import React, { ${g.trim()}, useState, useEffect }`)
} else if (!c.includes('useEffect')) {
  c = c.replace(/import React,\s*\{([^}]+)\}/, (m,g) => `import React, { ${g.trim()}, useEffect }`)
} else if (!c.includes('useState')) {
  c = c.replace(/import React,\s*\{([^}]+)\}/, (m,g) => `import React, { ${g.trim()}, useState }`)
}

// 2. Volume-Hook nach der Komponenten-Definition einfügen (nach erstem "{" der Funktion)
const volumeHook = `
  const [solVolume, setSolVolume] = React.useState(null)
  React.useEffect(() => {
    const fetchVolume = async () => {
      try {
        const r = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT')
        const d = await r.json()
        if (d.quoteVolume) setSolVolume(parseFloat(d.quoteVolume))
      } catch(e) {}
    }
    fetchVolume()
    const iv = setInterval(fetchVolume, 60000)
    return () => clearInterval(iv)
  }, [])
`

if (!c.includes('solVolume')) {
  // Nach "export default function PoolDashboard" den ersten { finden und Hook einfügen
  c = c.replace(/(export default function PoolDashboard[^{]*\{)/, `$1${volumeHook}`)
  console.log('✅ Volume Hook eingefügt')
} else {
  console.log('ℹ️ Volume Hook bereits vorhanden')
}

// 3. Preis-Block per Regex ersetzen (CRLF-sicher)
const priceRegex = /\{pool\.solPrice\s*&&\s*\(\s*[\r\n]+\s*<div className="price-ticker">\s*[\r\n]+\s*SOL[\s\S]*?<\/div>\s*[\r\n]+\s*\)\s*\}/

const newBlock = `<div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
              {pool.solPrice && (
                <div className="price-ticker">
                  SOL <strong style={{color:'#06b6d4',fontSize:'2rem'}}>\${pool.solPrice.toFixed(2)}</strong>
                </div>
              )}
              {solVolume != null && (
                <div className="price-ticker" style={{fontSize:'0.85rem',padding:'0.35rem 0.75rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.1rem'}}>
                  <span style={{color:'#94a3b8',fontSize:'0.7rem',letterSpacing:'0.05em',textTransform:'uppercase'}}>Vol 24h</span>
                  <strong style={{color:'#10b981'}}>
                    \${solVolume>=1e9?(solVolume/1e9).toFixed(2)+'B':solVolume>=1e6?(solVolume/1e6).toFixed(1)+'M':solVolume.toFixed(0)}
                  </strong>
                </div>
              )}
            </div>`

if (priceRegex.test(c)) {
  c = c.replace(priceRegex, newBlock)
  console.log('✅ Preis-Block ersetzt')
} else {
  console.log('❌ Preis-Block Regex kein Match')
  // Fallback: Zeige den genauen Bereich
  const idx = c.indexOf('price-ticker')
  console.log('Rohinhalt um price-ticker:', JSON.stringify(c.substring(idx-80, idx+200)))
}

fs.writeFileSync(path, c)
console.log('✅ Gespeichert')