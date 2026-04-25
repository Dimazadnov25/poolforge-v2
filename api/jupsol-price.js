export default async function handler(req, res) {
  try {
    const r = await fetch('https://public.jupiterapi.com/quote?inputMint=jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v&outputMint=So11111111111111111111111111111111111111112&amount=1000000000')
    const d = await r.json()
    const solPerJupsol = parseInt(d.outAmount) / 1e9
    res.status(200).json({ solPerJupsol })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}