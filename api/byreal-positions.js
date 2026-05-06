import { Connection, PublicKey } from '@solana/web3.js'

const RPC = process.env.VITE_RPC_URL || 'https://api.mainnet-beta.solana.com'
const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
const TOKEN22 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')

function tickToPrice(tick) {
  return Math.pow(1.0001, tick) * 1000
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { wallet } = req.query
  if (!wallet) return res.status(400).json({ error: 'wallet required' })

  try {
    const conn = new Connection(RPC, 'confirmed')
    const walletPk = new PublicKey(wallet)
    const tokenAccounts = await conn.getTokenAccountsByOwner(walletPk, { programId: TOKEN22 })
    const positions = []

    for (const { account } of tokenAccounts.value) {
      const d = account.data
      const amount = d.readBigUInt64LE(64)
      if (amount !== 1n) continue

      const mint = new PublicKey(d.slice(0, 32))
      const [posPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('position'), mint.toBuffer()],
        BYREAL
      )
      const posInfo = await conn.getAccountInfo(posPda)
      if (!posInfo) continue

      const pd = posInfo.data
      const tickLower = pd.readInt32LE(73)
      const tickUpper = pd.readInt32LE(77)
      const liquidity = pd.readBigUInt64LE(80)

      // Pool aus Position (bytes 8-40)
      const poolPk = new PublicKey(pd.slice(8, 40))
      const poolInfo = await conn.getAccountInfo(poolPk)

      let currentTick = null
      let inRange = null
      if (poolInfo) {
        currentTick = poolInfo.data.readInt32LE(269)
        inRange = currentTick >= tickLower && currentTick <= tickUpper
      }

      positions.push({
        positionPda: posPda.toBase58(),
        mint: mint.toBase58(),
        pool: poolPk.toBase58(),
        tickLower,
        tickUpper,
        liquidity: liquidity.toString(),
        priceLower: tickToPrice(tickLower).toFixed(2),
        priceUpper: tickToPrice(tickUpper).toFixed(2),
        currentTick,
        currentPrice: currentTick !== null ? tickToPrice(currentTick).toFixed(2) : null,
        inRange,
      })
    }

    res.json({ positions })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}