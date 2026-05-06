const fs = require('fs')

// 1. alert-config.json (Startwert)
fs.writeFileSync('alert-config.json', JSON.stringify({ pct: null, refPrice: null, active: false }))
console.log('✅ alert-config.json')

// 2. API: Alert setzen (schreibt in Repo via GitHub API)
const setAlert = `export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { pct, refPrice, active } = req.method === 'POST' ? req.body : req.query
  const token = process.env.GITHUB_TOKEN
  const repo = 'Dimazadnov25/poolforge-v2'
  
  // Aktuelle Datei holen (für SHA)
  const getRes = await fetch(\`https://api.github.com/repos/\${repo}/contents/alert-config.json\`, {
    headers: { Authorization: \`token \${token}\`, Accept: 'application/vnd.github.v3+json' }
  })
  const fileData = await getRes.json()
  
  const content = Buffer.from(JSON.stringify({ pct: Number(pct), refPrice: Number(refPrice), active: active !== 'false' })).toString('base64')
  
  await fetch(\`https://api.github.com/repos/\${repo}/contents/alert-config.json\`, {
    method: 'PUT',
    headers: { Authorization: \`token \${token}\`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Update alert config', content, sha: fileData.sha })
  })
  
  res.json({ ok: true })
}
`
fs.writeFileSync('api/save-alert.js', setAlert)
console.log('✅ api/save-alert.js')

// 3. GitHub Actions Workflow erweitern
const workflow = `name: Position Monitor
on:
  schedule:
    - cron: '*/5 * * * *'
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Check Position & Price Alert
        run: node monitor.cjs
        env:
          VITE_RPC_URL: \${{ secrets.VITE_RPC_URL }}
          NTFY_CHANNEL: poolforge-dzad
`
fs.writeFileSync('.github/workflows/monitor.yml', workflow)
console.log('✅ .github/workflows/monitor.yml')

// 4. monitor.cjs (läuft in GitHub Actions)
const monitorCjs = `const https = require('https')
const fs = require('fs')

const NTFY = 'poolforge-dzad'

function sendAlert(title, msg, priority = 'high') {
  return new Promise((resolve) => {
    const data = Buffer.from(msg)
    const req = https.request({
      hostname: 'ntfy.sh', port: 443, path: '/' + NTFY, method: 'POST',
      headers: { 'Title': title, 'Priority': priority, 'Content-Length': data.length }
    }, resolve)
    req.write(data)
    req.end()
  })
}

async function fetchJSON(url) {
  const r = await fetch(url)
  return r.json()
}

async function main() {
  // 1. SOL Preis holen
  const priceData = await fetchJSON('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
  const currentPrice = parseFloat(priceData.price)
  console.log('SOL Preis:', currentPrice)

  // 2. Alert Config lesen
  const config = JSON.parse(fs.readFileSync('alert-config.json', 'utf8'))
  console.log('Alert Config:', config)

  if (config.active && config.pct && config.refPrice) {
    const change = (currentPrice - config.refPrice) / config.refPrice * 100
    const absChange = Math.abs(change)
    console.log('Preisänderung:', absChange.toFixed(2) + '%', '/ Schwelle:', config.pct + '%')
    if (absChange >= config.pct) {
      const dir = change > 0 ? '📈 gestiegen' : '📉 gefallen'
      await sendAlert(
        'PoolForge Preis Alert',
        'SOL ist ' + dir + ' um ' + absChange.toFixed(2) + '%!\\nRef: $' + config.refPrice + ' → Jetzt: $' + currentPrice.toFixed(2) + '\\nhttps://poolforge-v2.vercel.app',
        'urgent'
      )
      console.log('✅ ntfy gesendet!')
    }
  }

  // 3. Position Monitor (bestehend)
  const monRes = await fetchJSON('https://poolforge-v2.vercel.app/api/monitor-position')
  console.log('Position:', monRes)
  if (monRes.inRange === false) {
    await sendAlert('🚨 OUT OF RANGE!', 'Position sofort prüfen!\\nhttps://poolforge-v2.vercel.app', 'urgent')
  } else if (parseFloat(monRes.pct) < 10) {
    await sendAlert('⚠️ Position ' + monRes.pct + '%', 'Nahe am Rand!\\nhttps://poolforge-v2.vercel.app', 'high')
  }
}

main().catch(console.error)
`
fs.writeFileSync('monitor.cjs', monitorCjs)
console.log('✅ monitor.cjs')

// 5. PriceAlert Komponente - ruft jetzt save-alert API auf
const comp = `import { useState, useEffect, useRef } from 'react'

export default function PriceAlert({ solPrice }) {
  const [activeAlert, setActiveAlert] = useState(null)
  const [refPrice, setRefPrice] = useState(null)
  const [saving, setSaving] = useState(false)

  const activateAlert = async (pct) => {
    if (activeAlert === pct) {
      setActiveAlert(null)
      setRefPrice(null)
      setSaving(true)
      await fetch('/api/save-alert?pct=0&refPrice=0&active=false')
      setSaving(false)
    } else {
      setActiveAlert(pct)
      setRefPrice(solPrice)
      setSaving(true)
      await fetch('/api/save-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pct, refPrice: solPrice, active: true })
      })
      setSaving(false)
    }
  }

  if (!solPrice) return null
  const change = refPrice ? ((solPrice - refPrice) / refPrice * 100) : null

  return (
    <div style={{marginTop:'0.75rem', display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap'}}>
      <span style={{color:'#64748b', fontSize:'0.75rem'}}>🔔 ntfy:</span>
      {[1, 2, 3, 5].map(pct => (
        <button key={pct} onClick={() => activateAlert(pct)} disabled={saving} style={{
          padding:'0.3rem 0.75rem', borderRadius:'999px',
          border: activeAlert === pct ? '1.5px solid #f59e0b' : '1.5px solid rgba(255,255,255,0.1)',
          background: activeAlert === pct ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
          color: activeAlert === pct ? '#f59e0b' : '#94a3b8',
          fontWeight: activeAlert === pct ? 700 : 400,
          fontSize:'0.8rem', cursor: saving ? 'wait' : 'pointer', transition:'all 0.2s'
        }}>
          {activeAlert === pct ? '🔔' : '🔕'} {pct}%
        </button>
      ))}
      {activeAlert && refPrice && change !== null && (
        <span style={{fontSize:'0.75rem', color: Math.abs(change) > activeAlert * 0.7 ? '#fb923c' : '#64748b'}}>
          Ref: \${refPrice.toFixed(2)} | {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          {saving ? ' ⟳' : ' ✅ aktiv (PC aus OK)'}
        </span>
      )}
    </div>
  )
}
`
fs.writeFileSync('src/components/PriceAlert.jsx', comp)
console.log('✅ PriceAlert.jsx')

// 6. In PoolDashboard einbauen falls noch nicht drin
let pd = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
if (!pd.includes('PriceAlert')) {
  pd = pd.replace(
    /import ByrealDashboard from '.\/ByrealDashboard'/,
    "import ByrealDashboard from './ByrealDashboard'\nimport PriceAlert from './PriceAlert'"
  )
  pd = pd.replace(
    /(<\/div>\s*\n\s*\{wallet\.connected)/,
    "</div>\n            <PriceAlert solPrice={pool.solPrice} />\n\n            {wallet.connected"
  )
  fs.writeFileSync('src/components/PoolDashboard.jsx', pd)
  console.log('✅ In PoolDashboard eingebaut')
} else {
  console.log('ℹ️ Bereits vorhanden')
}