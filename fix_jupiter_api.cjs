const fs = require('fs')
const file = 'api/jupiter-stake.js'

const newApi = `export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const { inputMint, outputMint, amount, userPublicKey } = req.body

    // Quote holen
    const quoteUrl = 'https://quote-api.jup.ag/v6/quote?inputMint=' + inputMint +
      '&outputMint=' + outputMint +
      '&amount=' + amount +
      '&slippageBps=100&onlyDirectRoutes=false'

    const quoteResp = await fetch(quoteUrl, {
      headers: { 'Accept': 'application/json' }
    })
    if (!quoteResp.ok) {
      const txt = await quoteResp.text()
      return res.status(400).json({ error: 'Quote HTTP ' + quoteResp.status, detail: txt.substring(0,200) })
    }
    const quote = await quoteResp.json()
    if (quote.error) return res.status(400).json({ error: quote.error })

    // Swap Transaction bauen
    const swapResp = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        quoteResponse: quote,
        userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 100000
      })
    })
    if (!swapResp.ok) {
      const txt = await swapResp.text()
      return res.status(400).json({ error: 'Swap HTTP ' + swapResp.status, detail: txt.substring(0,200) })
    }
    const swap = await swapResp.json()
    if (!swap.swapTransaction) return res.status(400).json({ error: 'No transaction', data: swap })

    res.status(200).json({ swapTransaction: swap.swapTransaction })
  } catch(e) {
    res.status(500).json({ error: e.message, stack: e.stack?.substring(0,300) })
  }
}`

fs.writeFileSync(file, newApi)
console.log('✅ Jupiter API neu geschrieben')