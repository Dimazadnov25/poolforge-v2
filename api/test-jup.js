export default async function handler(req, res) {
  try {
    const r = await fetch('https://api.jup.ag/swap/v1/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=100')
    const d = await r.json()
    res.json({ ok: !!d.outAmount, outAmount: d.outAmount, error: d.error })
  } catch(e) { res.status(500).json({ error: e.message }) }
}