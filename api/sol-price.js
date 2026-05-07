export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=30')
  try {
    const r = await fetch('https://hermes.pyth.network/v2/updates/price/latest?ids[]=0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d')
    const d = await r.json()
    const price = d.parsed[0].price.price * Math.pow(10, d.parsed[0].price.expo)
    res.json({ price: Math.abs(price) })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}