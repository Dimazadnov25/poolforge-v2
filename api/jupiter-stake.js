export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { inputMint, outputMint, amount, userPublicKey } = req.body
    const quoteResp = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=50`
    )
    const quote = await quoteResp.json()
    if (quote.error) return res.status(400).json({ error: quote.error })
    const swapResp = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteResponse: quote, userPublicKey, wrapAndUnwrapSol: true })
    })
    const swapData = await swapResp.json()
    if (!swapData.swapTransaction) return res.status(400).json({ error: 'No swap transaction', data: swapData })
    res.status(200).json(swapData)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}