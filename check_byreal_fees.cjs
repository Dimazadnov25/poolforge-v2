const { Connection, PublicKey } = require('@solana/web3.js')
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2')
const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
const TOKEN22 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const WALLET = new PublicKey('ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy')

async function check() {
  const accounts = await conn.getTokenAccountsByOwner(WALLET, { programId: TOKEN22 })
  for (const { account } of accounts.value) {
    const d = account.data
    const amount = d.readBigUInt64LE(64)
    if (amount !== 1n) continue
    const mint = new PublicKey(d.slice(0, 32))
    const [posPda] = PublicKey.findProgramAddressSync([Buffer.from('position'), mint.toBuffer()], BYREAL)
    const posInfo = await conn.getAccountInfo(posPda)
    if (!posInfo) continue
    console.log('Position PDA:', posPda.toBase58())
    const pd = posInfo.data
    console.log('Full hex:', pd.toString('hex'))
    console.log('\nMögliche Fee-Werte (u64):')
    for (let i = 0; i <= pd.length - 8; i += 8) {
      const v = pd.readBigUInt64LE(i)
      if (v > 0n && v < 1000000000000n) {
        console.log(`  offset ${i}: ${v} (${(Number(v)/1e9).toFixed(6)} SOL | ${(Number(v)/1e6).toFixed(6)} USDC)`)
      }
    }
  }
}
check().catch(console.error)