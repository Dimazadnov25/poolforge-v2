export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { action, amount, userPublicKey } = req.body
  try {
    // MarginFi SDK integration via their API
    const resp = await fetch(`https://app.marginfi.com/api/transaction/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount,
        userPublicKey
      })
    })
    const data = await resp.json()
    if (!resp.ok) throw new Error(data.message || 'MarginFi API error')
    return res.json(data)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}