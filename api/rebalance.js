import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import bs58 from 'bs58'

const RPC = process.env.VITE_RPC_URL || 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const SECRET = process.env.REBALANCE_PRIVATE_KEY
const POOL = new PublicKey('5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6')
const DLMM_PROGRAM = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo')
const THRESHOLD_PCT = 0.01

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).end()

  const { secret } = req.body
  if (secret !== process.env.CRON_SECRET) return res.status(401).json({ error: 'Unauthorized' })

  try {
    if (!SECRET) return res.status(500).json({ error: 'No private key' })

    const keypair = Keypair.fromSecretKey(bs58.decode(SECRET))
    const connection = new Connection(RPC, 'confirmed')
    const wallet = keypair.publicKey

    // SOL Preis holen
    const priceResp = await fetch('https://api.coinbase.com/v2/prices/SOL-USD/spot')
    const priceData = await priceResp.json()
    const solPrice = parseFloat(priceData.data.amount)

    // Pool State lesen (active bin bei offset 76)
    const poolInfo = await connection.getAccountInfo(POOL)
    if (!poolInfo) return res.status(500).json({ error: 'Pool nicht gefunden' })
    const activeBinId = poolInfo.data.readInt32LE(76)

    // Position suchen
    // Alle Positionen der Wallet suchen - verschiedene Größen probieren
    const accounts = await connection.getProgramAccounts(DLMM_PROGRAM, {
      filters: [
        { memcmp: { offset: 40, bytes: wallet.toBase58() } }
      ]
    })

    if (accounts.length === 0) {
      return res.json({ ok: true, status: 'Keine Position gefunden', solPrice, activeBinId })
    }

    const posAccount = accounts[0]
    const lowerBinId = posAccount.account.data.readInt32LE(7912)
    const upperBinId = posAccount.account.data.readInt32LE(7916)

    // Prüfen ob rebalance nötig
    const lowerThreshold = lowerBinId + Math.ceil((upperBinId - lowerBinId) * THRESHOLD_PCT)
    const upperThreshold = upperBinId - Math.ceil((upperBinId - lowerBinId) * THRESHOLD_PCT)

    const needsRebalance = activeBinId <= lowerThreshold || activeBinId >= upperThreshold

    return res.json({
      ok: true,
      solPrice,
      activeBinId,
      lowerBinId,
      upperBinId,
      lowerThreshold,
      upperThreshold,
      needsRebalance,
      position: posAccount.pubkey.toBase58(),
      status: needsRebalance ? '⚠️ REBALANCE NÖTIG' : '✅ In Range'
    })

  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}