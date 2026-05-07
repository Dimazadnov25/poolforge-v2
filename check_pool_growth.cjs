const { Connection, PublicKey } = require('@solana/web3.js')
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2')
const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
const TOKEN22 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const WALLET = new PublicKey('ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy')
const Q64 = 2n ** 64n

async function check() {
  const accounts = await conn.getTokenAccountsByOwner(WALLET, { programId: TOKEN22 })
  for (const { account } of accounts.value) {
    const d = account.data
    if (d.readBigUInt64LE(64) !== 1n) continue
    const mint = new PublicKey(d.slice(0, 32))
    const [posPda] = PublicKey.findProgramAddressSync([Buffer.from('position'), mint.toBuffer()], BYREAL)
    const posInfo = await conn.getAccountInfo(posPda)
    if (!posInfo) continue
    const pd = posInfo.data

    const liquidity = pd.readBigUInt64LE(80)
    const feeGrowthCheckpointA = pd.readBigUInt64LE(88)  // Q64
    const feeGrowthCheckpointB = pd.readBigUInt64LE(104) // Q64
    const feeOwedA = pd.readBigUInt64LE(83)
    const feeOwedB = pd.readBigUInt64LE(216)

    console.log('liquidity:', liquidity.toString())
    console.log('feeGrowthCheckpointA (offset 88):', feeGrowthCheckpointA.toString())
    console.log('feeGrowthCheckpointB (offset 104):', feeGrowthCheckpointB.toString())
    console.log('feeOwedA (SOL):', (Number(feeOwedA)/1e9).toFixed(6))
    console.log('feeOwedB (USDC):', (Number(feeOwedB)/1e6).toFixed(4))

    // Pool lesen
    const poolPk = new PublicKey(pd.slice(8, 40))
    const poolInfo = await conn.getAccountInfo(poolPk)
    if (!poolInfo) { console.log('Pool nicht gefunden'); continue }
    const p = poolInfo.data
    console.log('\n=== POOL - alle u128 Werte (feeGrowthGlobal) ===')
    for (let i = 0; i <= p.length - 16; i += 8) {
      const lo = p.readBigUInt64LE(i)
      const hi = p.readBigUInt64LE(i + 8)
      const val = lo + hi * (2n ** 64n)
      if (val > 0n && val < BigInt(1e30)) {
        const asQ64 = Number(lo) / Number(Q64)
        if (asQ64 > 0.0001 && asQ64 < 1000) {
          console.log(`  offset ${i}: Q64=${asQ64.toFixed(8)}`)
        }
      }
    }
  }
}
check().catch(console.error)