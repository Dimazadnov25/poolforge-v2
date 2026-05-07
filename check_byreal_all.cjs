const { Connection, PublicKey } = require('@solana/web3.js')
const conn = new Connection('https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2')
const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
const TOKEN22 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const WALLET = new PublicKey('ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy')

async function check() {
  const accounts = await conn.getTokenAccountsByOwner(WALLET, { programId: TOKEN22 })
  let total = 0
  for (const { account } of accounts.value) {
    const d = account.data
    const amount = d.readBigUInt64LE(64)
    if (amount !== 1n) continue
    const mint = new PublicKey(d.slice(0, 32))
    const [posPda] = PublicKey.findProgramAddressSync([Buffer.from('position'), mint.toBuffer()], BYREAL)
    const posInfo = await conn.getAccountInfo(posPda)
    if (!posInfo) continue
    const pd = posInfo.data
    const fee = Number(pd.readBigUInt64LE(216)) / 1e6
    console.log(`Position: ${posPda.toBase58().slice(0,8)}... | Fee: $${fee.toFixed(4)}`)
    total += fee
  }
  console.log(`\nTotal: $${total.toFixed(4)}`)
}
check().catch(console.error)