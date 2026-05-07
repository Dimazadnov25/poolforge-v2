import fs from 'fs'
import path from 'path'

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
    const priceRes = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
    const priceData = await priceRes.json()
    const currentPrice = parseFloat(priceData.price)

    if (isNaN(currentPrice)) {
      // Fallback CoinGecko
      const r2 = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd')
      const d2 = await r2.json()
      if (!d2?.solana?.usd) return res.json({ ok: true, message: 'Price unavailable' })
    }

    // Alert Config lesen
    const configPath = path.join(process.cwd(), 'alert-config.json')
    let config = { active: false }
    try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')) } catch(e) {}

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