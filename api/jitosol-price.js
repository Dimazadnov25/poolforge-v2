export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=30')
  try {
    const r = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=jito-staked-sol&vs_currencies=usd')
    const d = await r.json()
    const price = d?.['jito-staked-sol']?.usd
    if (!price) throw new Error('no price')
    res.json({ price })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}