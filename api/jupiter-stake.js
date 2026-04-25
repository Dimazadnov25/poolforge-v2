export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { inputMint, outputMint, amount, userPublicKey } = req.body
    console.log('Stake swap request:', inputMint, outputMint, amount)
    const quoteUrl = 'https://lite.jup.ag/swap/v1/quote?inputMint=' + inputMint + '&outputMint=' + outputMint + '&amount=' + amount + '&slippageBps=50'
    console.log('Quote URL:', quoteUrl)
    const quoteResp = await fetch(quoteUrl)
    console.log('Quote status:', quoteResp.status)
    const quote = await quoteResp.json()
    console.log('Quote keys:', Object.keys(quote))
    if (quote.error) return res.status(400).json({ error: 'Quote: ' + quote.error })
    const swapResp = await fetch('https://lite.jup.ag/swap/v1/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quoteResponse: quote, userPublicKey, wrapAndUnwrapSol: true })
    })
    const swapData = await swapResp.json()
    console.log('Swap keys:', Object.keys(swapData))
    if (!swapData.swapTransaction) return res.status(400).json({ error: 'No tx', data: swapData })
    res.status(200).json(swapData)
  } catch (e) {
    console.error('Error:', e.message)
    res.status(500).json({ error: e.message })
  }
}