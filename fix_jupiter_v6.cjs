const fs = require('fs')
const file = 'api/jupiter-stake.js'

const newApi = `export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { inputMint, outputMint, amount, userPublicKey } = req.body

    // Schritt 1: Quote holen
    const quoteResp = await fetch(
      'https://quote-api.jup.ag/v6/quote?inputMint=' + inputMint +
      '&outputMint=' + outputMint +
      '&amount=' + amount +
      '&slippageBps=50'
    )
    const quote = await quoteResp.json()
    if (quote.error) return res.status(400).json({ error: quote.error })

    // Schritt 2: Swap Transaction bauen
    const swapResp = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey: userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto'
      })
    })
    const swap = await swapResp.json()
    if (swap.error) return res.status(400).json({ error: swap.error })
    if (!swap.swapTransaction) return res.status(400).json({ error: 'No transaction', data: swap })

    res.status(200).json({ swapTransaction: swap.swapTransaction })
  } catch(e) { res.status(500).json({ error: e.message }) }
}`

fs.writeFileSync(file, newApi)
console.log('✅ Jupiter v6 API eingebaut')