import { Connection, PublicKey } from '@solana/web3.js'

const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
// Pyth SOL/USD Price Account on-chain
const PYTH_SOL_USD = new PublicKey('H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG')

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=10')
  try {
    const conn = new Connection(RPC, 'confirmed')
    const info = await conn.getAccountInfo(PYTH_SOL_USD)
    if (!info) return res.status(500).json({ error: 'Account not found' })
    // Pyth price account layout: price at offset 208 (i64), expo at offset 20 (i32)
    const price = Number(info.data.readBigInt64LE(208))
    const expo = info.data.readInt32LE(20)
    const solPrice = Math.abs(price * Math.pow(10, expo))
    res.json({ price: solPrice })
  } catch(e) {
    res.status(500).json({ error: e.message })
  }
}