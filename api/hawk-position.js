export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=30')
  try {
    const HAWK_WALLET = 'ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy'
    const r = await fetch(`https://pro-api.solscan.io/v2.0/account/balance?address=${HAWK_WALLET}`, {
      headers: { 'token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' }
    })
    const d = await r.json()
    console.log(JSON.stringify(d).substring(0, 200))
    res.json(d)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}