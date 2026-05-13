const fs = require('fs')

const content = `import { Connection, PublicKey } from '@solana/web3.js'

const RPC = process.env.HELIUS_RPC || 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const CLMM_PROGRAM = new PublicKey('CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK')
const SOL_USDC_POOL  = new PublicKey('2QdhepnKRTLjjSqPL1PtKNwqrUkoLee5Gqs8bvZhRdMv')

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    const conn = new Connection(RPC, 'confirmed')
    const info = await conn.getAccountInfo(SOL_USDC_POOL)
    if (!info) return res.status(404).json({ error: 'Pool nicht gefunden' })

    const d = info.data
    // Raydium CLMM PoolState Layout (nach IDL)
    const tickSpacing  = d.readUInt16LE(235)
    const tickCurrent  = d.readInt32LE(269)
    const sqrtPriceX64 = BigInt('0x' + Buffer.from(d.slice(253, 269)).reverse().toString('hex'))

    // sqrtPriceX64 -> Preis
    const sqrtPrice = Number(sqrtPriceX64) / Math.pow(2, 64)
    // SOL=9 decimals, USDC=6 decimals → factor 10^3
    const price = (sqrtPrice * sqrtPrice) * Math.pow(10, 3)

    res.json({
      pool: SOL_USDC_POOL.toBase58(),
      tickCurrent,
      tickSpacing,
      price: price.toFixed(4),
      sqrtPriceX64: sqrtPriceX64.toString()
    })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}
`

fs.writeFileSync('api/raydium-pool-state.js', content)
console.log('✅ api/raydium-pool-state.js erstellt')