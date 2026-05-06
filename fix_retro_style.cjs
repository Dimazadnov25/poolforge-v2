const fs = require('fs')

// 1. index.css - Retro Fonts + Farben
const css = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg: #080808;
  --bg2: #0d0d0d;
  --card: #111111;
  --border: rgba(0,255,255,0.15);
  --cyan: #00ffff;
  --red: #ff2244;
  --green: #00ff88;
  --muted: #444;
  --text: #e0e0e0;
  --font-mono: 'Share Tech Mono', monospace;
  --font-display: 'Orbitron', monospace;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-mono);
  overflow-x: hidden;
}

/* Scrollbar retro */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--cyan); border-radius: 2px; }

/* Wallet button override */
.wallet-adapter-button {
  background: transparent !important;
  border: 1px solid var(--cyan) !important;
  color: var(--cyan) !important;
  font-family: var(--font-mono) !important;
  font-size: 0.7rem !important;
  padding: 0.3rem 0.6rem !important;
  height: auto !important;
  border-radius: 4px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.05em !important;
}
.wallet-adapter-button:hover {
  background: rgba(0,255,255,0.1) !important;
}

/* Scanline overlay */
body::after {
  content: '';
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px);
  pointer-events: none;
  z-index: 9999;
}
`
// Lese aktuelle CSS und ersetze
let existingCss = ''
try { existingCss = fs.readFileSync('src/index.css', 'utf8') } catch(e) {}
fs.writeFileSync('src/index.css', css)
console.log('✅ index.css Retro Style')

// 2. ByrealDashboard - klein
const byreal = `export default function ByrealDashboard() {
  return (
    <a href="https://www.byreal.io/en/portfolio" target="_blank" rel="noreferrer" style={{
      display:'inline-flex', alignItems:'center', gap:'0.4rem',
      padding:'0.3rem 0.8rem', borderRadius:'4px', textDecoration:'none',
      border:'1px solid rgba(0,255,255,0.3)', color:'rgba(0,255,255,0.7)',
      fontSize:'0.7rem', fontFamily:'Share Tech Mono, monospace',
      textTransform:'uppercase', letterSpacing:'0.08em',
      background:'rgba(0,255,255,0.05)'
    }}>↗ BYREAL PORTFOLIO</a>
  )
}
`
fs.writeFileSync('src/components/ByrealDashboard.jsx', byreal)
console.log('✅ ByrealDashboard klein')

// 3. PoolDashboard - Swap nach oben, Retro Styles
let pd = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// SwapWidget vor PositionDetails verschieben - Swap nach oben
pd = pd.replace(
  `      {/* BYREAL */}
      <ByrealDashboard />

      {/* SWAP */}
      <SwapWidget solPrice={pool.solPrice} solBalance={pool.solBalance} usdcBalance={pool.usdcBalance} />`,
  `      {/* SWAP */}
      <SwapWidget solPrice={pool.solPrice} solBalance={pool.solBalance} usdcBalance={pool.usdcBalance} />

      {/* BYREAL */}
      <ByrealDashboard />`
)

// Hintergrundfarbe anpassen
pd = pd.replace(
  "background:'#0f172a'",
  "background:'#080808'"
)
pd = pd.replace(
  "background:'#1e293b'",
  "background:'#111111'"
)

fs.writeFileSync('src/components/PoolDashboard.jsx', pd)
console.log('✅ Swap nach oben + Retro Farben')