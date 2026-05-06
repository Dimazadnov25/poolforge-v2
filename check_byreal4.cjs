const { Connection, PublicKey } = require('@solana/web3.js')
const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const conn = new Connection(RPC)

async function check() {
  // Position Account (281 bytes)
  const posAddr = new PublicKey('7HZNXH6ZDxGhvPSgcvsiHvMBCyb8dvf9ZL4gwRkjRmbh')
  const pos = await conn.getAccountInfo(posAddr)
  const d = pos.data
  console.log('=== POSITION ACCOUNT (281 bytes) ===')
  console.log('Voll Hex:', d.toString('hex'))
  console.log('\n--- Alle Int32 Werte (mögliche Ticks) ---')
  for (let i = 0; i <= d.length - 4; i += 4) {
    const v = d.readInt32LE(i)
    if (v >= -887272 && v <= 887272 && v !== 0) {
      console.log(`  offset ${i}: ${v} (möglicher Tick)`)
    }
  }
  console.log('\n--- Alle UInt128 (mögliche Liquidity) ---')
  for (let i = 0; i <= d.length - 16; i += 8) {
    const lo = d.readBigUInt64LE(i)
    if (lo > 0n && lo < 100000000000000000000n) {
      console.log(`  offset ${i}: ${lo.toString()} (mögliche Liquidity)`)
    }
  }

  // Pool Account (1544 bytes) - currentTick finden
  const poolAddr = new PublicKey('9GTj99g9tbz9U6UYDsX6YeRTgUnkYG6GTnHv3qLa5aXq')
  const pool = await conn.getAccountInfo(poolAddr)
  const p = pool.data
  console.log('\n=== POOL ACCOUNT - currentTick Kandidaten ===')
  for (let i = 0; i <= p.length - 4; i += 4) {
    const v = p.readInt32LE(i)
    if (v >= -100000 && v <= 100000 && v !== 0) {
      console.log(`  offset ${i}: ${v}`)
    }
  }
  
  // Wallet alle Byreal Positionen suchen
  console.log('\n=== Alle Byreal Accounts der Wallet ===')
  const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
  const accs = await conn.getProgramAccounts(BYREAL, {
    filters: [{ memcmp: { offset: 8, bytes: 'BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj' } }]
  })
  console.log('Gefunden (offset 8):', accs.length)
  const accs2 = await conn.getProgramAccounts(BYREAL, {
    filters: [{ memcmp: { offset: 0, bytes: 'BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj' } }]
  })
  console.log('Gefunden (offset 0):', accs2.length)
}
check().catch(console.error)