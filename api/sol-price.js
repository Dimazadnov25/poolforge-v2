export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=10')
  try {
    const r = await fetch('https://api.coinbase.com/v2/prices/SOL-USD/spot')
    const d = await r.json()
    const price = parseFloat(d.data.amount)
    if (price && price > 1) return res.json({ price })
    throw new Error('Invalid price')
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}