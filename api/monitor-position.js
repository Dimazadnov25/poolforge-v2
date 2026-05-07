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
      const r = await fetch('https://price.jup.ag/v6/price?ids=SOL')
      const d = await r.json()
      if (d?.data?.SOL?.price) currentPrice = d.data.SOL.price
    } catch(e) {}
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