const { Connection, PublicKey } = require('@solana/web3.js')
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2')
const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
const TOKEN22 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const WALLET = new PublicKey('ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy')

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
    
    // 0.00486 SOL = 4860000 lamports
    // 0.47 USDC = 470000 micro-USDC
    // Suche nach Werten nahe diesen Zahlen (±50%)
    console.log('Suche SOL fee (~4860000 lamports):')
    for (let i = 0; i <= pd.length - 8; i++) {
      const v = Number(pd.readBigUInt64LE(i))
      if (v > 2000000 && v < 10000000) {
        console.log(`  offset ${i}: ${v} lamports = ${(v/1e9).toFixed(6)} SOL`)
      }
    }
    console.log('\nSuche USDC fee (~470000):')
    for (let i = 0; i <= pd.length - 8; i++) {
      const v = Number(pd.readBigUInt64LE(i))
      if (v > 200000 && v < 900000) {
        console.log(`  offset ${i}: ${v} = $${(v/1e6).toFixed(4)} USDC`)
      }
    }
  }
}
check().catch(console.error)