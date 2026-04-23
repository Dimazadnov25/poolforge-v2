export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { inputMint, outputMint, amount, userPublicKey } = req.body
    const quoteResp = await fetch(
      `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=100`
    )
    const quote = await quoteResp.json()
    const swapResp = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteResponse: quote, userPublicKey, wrapAndUnwrapSol: true })
    })
    const swapData = await swapResp.json()
    res.status(200).json(swapData)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}