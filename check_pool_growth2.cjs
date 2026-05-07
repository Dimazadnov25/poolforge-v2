const { Connection, PublicKey } = require('@solana/web3.js')
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2')
const Q64 = 2n ** 64n

async function check() {
  const poolPk = new PublicKey('9GTj99g9tbz9U6UYDsX6YeRTgUnkYG6GTnHv3qLa5aXq')
  const poolInfo = await conn.getAccountInfo(poolPk)
  if (!poolInfo) { console.log('Pool nicht gefunden'); return }
  const p = poolInfo.data
  console.log('Pool size:', p.length)
  
  console.log('\n=== Q64 Werte im Pool (feeGrowthGlobal Kandidaten) ===')
  for (let i = 0; i <= p.length - 16; i += 8) {
    const lo = p.readBigUInt64LE(i)
    const asQ64 = Number(lo) / Number(Q64)
    if (asQ64 > 0.000001 && asQ64 < 10000) {
      console.log(`  offset ${i}: lo=${lo} Q64=${asQ64.toFixed(8)}`)
    }
  }
}
check().catch(console.error)