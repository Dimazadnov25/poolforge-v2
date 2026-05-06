const { Connection, PublicKey } = require('@solana/web3.js')
const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const conn = new Connection(RPC)
const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
const WALLET = new PublicKey('BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj')
const TOKEN22 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')

async function check() {
  // Token-2022 Accounts suchen
  const tokens = await conn.getParsedTokenAccountsByOwner(WALLET, { programId: TOKEN22 })
  console.log('Token-2022 Accounts:', tokens.value.length)
  
  for (const t of tokens.value) {
    const info = t.account.data.parsed.info
    const amount = info.tokenAmount.uiAmount
    const mint = info.mint
    console.log(`\nMint: ${mint} | Amount: ${amount}`)
    
    // Position PDA ableiten
    const mintPk = new PublicKey(mint)
    const [posPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('position'), mintPk.toBuffer()],
      BYREAL
    )
    const posInfo = await conn.getAccountInfo(posPda)
    if (posInfo) {
      console.log('  ✅ Position PDA:', posPda.toBase58())
      console.log('  Data length:', posInfo.data.length)
      const d = posInfo.data
      
      // Liquidity @ offset 80
      const liq = d.readBigUInt64LE(80)
      console.log('  Liquidity:', liq.toString())
      
      // Tick-Kandidaten
      for (let off = 80; off <= 160; off += 4) {
        const v = d.readInt32LE(off)
        if (v >= -887272 && v <= 887272 && v !== 0 && Math.abs(v) > 100) {
          console.log(`  Tick? offset ${off}: ${v}`)
        }
      }
    } else {
      console.log('  ❌ Kein Position PDA')
    }
  }
}
check().catch(console.error)