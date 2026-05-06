const { Connection, PublicKey } = require('@solana/web3.js')
const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const conn = new Connection(RPC)
const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
const WALLET = new PublicKey('BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj')

async function check() {
  // 1. Alle NFTs im Wallet finden (amount=1 = Position NFT)
  const tokens = await conn.getParsedTokenAccountsByOwner(WALLET, { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') })
  const nfts = tokens.value.filter(t => t.account.data.parsed.info.tokenAmount.uiAmount === 1)
  console.log('NFTs im Wallet:', nfts.length)
  
  for (const nft of nfts) {
    const mint = new PublicKey(nft.account.data.parsed.info.mint)
    console.log('\nMint:', mint.toBase58())
    
    // Position PDA ableiten: ["position", mint] wie Whirlpool
    const [posPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('position'), mint.toBuffer()],
      BYREAL
    )
    const info = await conn.getAccountInfo(posPda)
    if (info) {
      console.log('  ✅ Position PDA gefunden:', posPda.toBase58())
      console.log('  Data length:', info.data.length)
      const d = info.data
      
      // Verschiedene Tick-Offsets testen
      console.log('  --- Tick-Kandidaten ---')
      for (let off = 80; off <= 160; off += 4) {
        const v = d.readInt32LE(off)
        if (v >= -887272 && v <= 887272 && v !== 0 && Math.abs(v) > 100) {
          console.log(`  offset ${off}: ${v}`)
        }
      }
      // Liquidity bei offset 80 (u64)
      const liq = d.readBigUInt64LE(80)
      console.log('  Liquidity (u64 @80):', liq.toString())
    } else {
      console.log('  ❌ Kein Position PDA gefunden')
    }
  }
}
check().catch(console.error)