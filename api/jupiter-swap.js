export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { inputMint, outputMint, amount, userPublicKey } = req.body
    console.log('Jupiter swap request:', { inputMint, outputMint, amount, userPublicKey })
    
    const quoteUrl = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=100`
    const quoteResp = await fetch(quoteUrl)
    const quote = await quoteResp.json()
    console.log('Quote response:', JSON.stringify(quote).slice(0, 200))
    
    if (quote.error) {
      return res.status(400).json({ error: 'Quote failed: ' + quote.error })
    }

    const swapResp = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        quoteResponse: quote, 
        userPublicKey, 
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto'
      })
    })
    const swapData = await swapResp.json()
    console.log('Swap response keys:', Object.keys(swapData))
    
    if (!swapData.swapTransaction) {
      return res.status(400).json({ error: 'No swapTransaction in response', data: swapData })
    }
    
    res.status(200).json(swapData)
  } catch (e) {
    console.error('Jupiter error:', e.message)
    res.status(500).json({ error: e.message })
  }
}