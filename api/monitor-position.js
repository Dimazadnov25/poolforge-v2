const NTFY = 'poolforge-dzad'

async function sendAlert(title, msg, priority = 'urgent') {
  await fetch('https://ntfy.sh/' + NTFY, {
    method: 'POST',
    headers: { 'Title': title, 'Priority': priority, 'Tags': 'warning' },
    body: msg
  })
}

export default async function handler(req, res) {
  try {
    // SOL Preis holen
    let currentPrice = null
    try {
      const r1 = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
      const d1 = await r1.json()
      if (d1.price) currentPrice = parseFloat(d1.price)
    } catch(e) {}
    if (!currentPrice) {
      try {
        const r2 = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
        const d2 = await r2.json()
        if (d2?.solana?.usd) currentPrice = d2.solana.usd
      } catch(e) {}
    }
    if (!currentPrice) return res.json({ ok: true, message: 'Price unavailable' })

    // Alert Config von GitHub lesen
    let config = { active: false }
    try {
      const r = await fetch('https://raw.githubusercontent.com/Dimazadnov25/poolforge-v2/main/alert-config.json?t=' + Date.now())
      config = await r.json()
    } catch(e) {}

    if (config.active && config.pct && config.refPrice) {
      const change = (currentPrice - config.refPrice) / config.refPrice * 100
      const absChange = Math.abs(change)
      if (absChange >= config.pct) {
        const dir = change > 0 ? '📈 gestiegen' : '📉 gefallen'
        await sendAlert(
          'PoolForge Alert',
          'SOL ist ' + dir + ' um ' + absChange.toFixed(2) + '%!\nRef: $' + config.refPrice.toFixed(2) + ' → Jetzt: $' + currentPrice.toFixed(2) + '\nhttps://poolforge-v2.vercel.app'
        )
        return res.json({ ok: true, alerted: true, change: absChange.toFixed(2), currentPrice })
      }
    }

    res.json({ ok: true, currentPrice, refPrice: config.refPrice, pct: config.pct, active: config.active })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}