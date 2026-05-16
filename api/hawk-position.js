export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=30')
  try {
    const HAWK_WALLET = 'ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy'
    const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
    
    // Alle Token Accounts der Hawk Wallet
    const r = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'getTokenAccountsByOwner',
        params: [HAWK_WALLET, { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' }, { encoding: 'jsonParsed' }]
      })
    })
    const d = await r.json()
    const accounts = d.result?.value || []
    
    let usdc = 0
    let sol = 0
    
    for (const acc of accounts) {
      const info = acc.account.data.parsed?.info
      if (!info) continue
      if (info.mint === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v') {
        usdc += info.tokenAmount?.uiAmount || 0
      }
    }
    
    // SOL Balance
    const solR = await fetch(RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [HAWK_WALLET] })
    })
    const solD = await solR.json()
    sol = (solD.result?.value || 0) / 1e9
    
    res.json({ usdc, sol })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}