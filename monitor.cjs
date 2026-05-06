const https = require('https')
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
  // Mehrere Quellen versuchen
  let currentPrice = NaN
  try {
    const r1 = await fetchJSON('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
    currentPrice = parseFloat(r1.price)
  } catch(e) {}
  if (isNaN(currentPrice)) {
    try {
      const r2 = await fetchJSON('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      currentPrice = r2.solana.usd
    } catch(e) {}
  }
  if (isNaN(currentPrice)) {
    console.log('❌ Preis nicht verfügbar')
    process.exit(0)
  }
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
        'SOL ist ' + dir + ' um ' + absChange.toFixed(2) + '%!\nRef: $' + config.refPrice + ' → Jetzt: $' + currentPrice.toFixed(2) + '\nhttps://poolforge-v2.vercel.app',
        'urgent'
      )
      console.log('✅ ntfy gesendet!')
    }
  }

  // 3. Position Monitor (bestehend)
  const monRes = await fetchJSON('https://poolforge-v2.vercel.app/api/monitor-position')
  console.log('Position:', monRes)
  if (monRes.inRange === false) {
    await sendAlert('🚨 OUT OF RANGE!', 'Position sofort prüfen!\nhttps://poolforge-v2.vercel.app', 'urgent')
  } else if (parseFloat(monRes.pct) < 10) {
    await sendAlert('⚠️ Position ' + monRes.pct + '%', 'Nahe am Rand!\nhttps://poolforge-v2.vercel.app', 'high')
  }
}

main().catch(console.error)
