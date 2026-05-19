import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js'
import bs58 from 'bs58'

const RPC = process.env.VITE_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const SECRET = process.env.REBALANCE_PRIVATE_KEY

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).end()

  // Sicherheits-Check
  const { secret } = req.body
  if (secret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' })

  try {
    if (!SECRET) return res.status(500).json({ error: 'No private key configured' })

    const keypair = Keypair.fromSecretKey(bs58.decode(SECRET))
    const connection = new Connection(RPC, 'confirmed')

    // SOL Preis holen
    const priceResp = await fetch('https://api.coinbase.com/v2/prices/SOL-USD/spot')
    const priceData = await priceResp.json()
    const solPrice = parseFloat(priceData.data.amount)

    res.json({
      ok: true,
      wallet: keypair.publicKey.toBase58(),
      solPrice,
      message: 'Rebalance wallet aktiv'
    })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}