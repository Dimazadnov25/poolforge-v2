export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const { inputMint, outputMint, amount, userPublicKey } = req.body

    const quoteResp = await fetch(
      'https://api.jup.ag/swap/v1/quote?inputMint=' + inputMint +
      '&outputMint=' + outputMint +
      '&amount=' + amount +
      '&slippageBps=100'
    )
    const quote = await quoteResp.json()
    if (quote.error) return res.status(400).json({ error: quote.error })

    const swapResp = await fetch('https://api.jup.ag/swap/v1/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 100000
      })
    })
    const swap = await swapResp.json()
    if (!swap.swapTransaction) return res.status(400).json({ error: 'No transaction', data: swap })

    res.status(200).json({ swapTransaction: swap.swapTransaction })
  } catch(e) { res.status(500).json({ error: e.message }) }
}