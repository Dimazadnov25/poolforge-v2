const { Connection, PublicKey } = require('@solana/web3.js')
const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const conn = new Connection(RPC)
const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
const TOKEN22 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const WALLET = new PublicKey('ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy')

async function check() {
  // Raw lesen statt parsed
  const accounts = await conn.getTokenAccountsByOwner(WALLET, { programId: TOKEN22 })
  console.log('Token-2022 Accounts (raw):', accounts.value.length)

  for (const { pubkey, account } of accounts.value) {
    const d = account.data
    // SPL Token Account Layout: mint=0..32, owner=32..64, amount=64..72
    const mint = new PublicKey(d.slice(0, 32))
    const amount = d.readBigUInt64LE(64)
    console.log(`\nAccount: ${pubkey.toBase58()}`)
    console.log(`  Mint: ${mint.toBase58()}`)
    console.log(`  Amount: ${amount}`)

    if (amount === 1n) {
      console.log('  🎯 NFT! Suche Position PDA...')
      const [posPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('position'), mint.toBuffer()],
        BYREAL
      )
      const posInfo = await conn.getAccountInfo(posPda)
      if (posInfo) {
        console.log('  ✅ Position PDA:', posPda.toBase58())
        console.log('  Data length:', posInfo.data.length)
        const pd = posInfo.data
        // Tick-Kandidaten
        for (let off = 0; off < pd.length - 3; off += 1) {
          const v = pd.readInt32LE(off)
          if (v >= -500000 && v <= 500000 && Math.abs(v) > 1000) {
            console.log(`    Tick? byte ${off}: ${v}`)
          }
        }
      } else {
        console.log('  ❌ Kein Position PDA bei:', posPda.toBase58())
      }
    }
  }

  // Auch bekannte Position direkt auslesen
  console.log('\n--- Bekannte Position 7HZNXH6Z... ---')
  const posInfo = await conn.getAccountInfo(new PublicKey('7HZNXH6ZDxGhvPSgcvsiHvMBCyb8dvf9ZL4gwRkjRmbh'))
  if (posInfo) {
    const d = posInfo.data
    console.log('Full hex:', d.toString('hex'))
    console.log('Tick-Kandidaten:')
    for (let off = 0; off < d.length - 3; off++) {
      const v = d.readInt32LE(off)
      if (v >= -500000 && v <= 500000 && Math.abs(v) > 1000) {
        console.log(`  byte ${off}: ${v}`)
      }
    }
  }
}
check().catch(console.error)