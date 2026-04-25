export default async function handler(req, res) {
  try {
    const r = await fetch('https://public.jupiterapi.com/price?ids=jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v&vsToken=USDC')
    const d = await r.json()
    res.status(200).json(d)
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}