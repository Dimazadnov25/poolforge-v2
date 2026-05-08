const fs = require('fs')

// 1. Font in index.html einbinden
let html = fs.readFileSync('index.html', 'utf8')
if (!html.includes('dseg')) {
  html = html.replace(
    '</head>',
    '  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/dseg@0.46.0/css/dseg.min.css">\n</head>'
  )
  fs.writeFileSync('index.html', html)
  console.log('✅ DSEG Font eingebunden')
}

// 2. SOL Preis und Vol 24h Zahlen auf DSEG7 setzen
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// SOL Preis Zahl
c = c.replace(
  /fontFamily:'Orbitron,monospace'[^}]*}}\$\{pool\.solPrice\.toFixed\(2\)\}/,
  m => m.replace("fontFamily:'Orbitron,monospace'", "fontFamily:'DSEG7 Classic, monospace'")
)

// Vol 24h Zahl
c = c.replace(
  /fontFamily:'Orbitron,monospace'[^}]*}}\s*\$\{solVolume/,
  m => m.replace("fontFamily:'Orbitron,monospace'", "fontFamily:'DSEG7 Classic, monospace'")
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Casio Font auf SOL Preis + Vol angewendet')