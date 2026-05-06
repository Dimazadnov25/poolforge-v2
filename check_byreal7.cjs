const { Connection, PublicKey } = require('@solana/web3.js')
const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const conn = new Connection(RPC)
const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
const TOKEN22 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')
const TOKEN_PROG = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

// Signer der TX - das ist die eigentliche Byreal Wallet
const WALLET = new PublicKey('ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy')

async function check() {
  console.log('Suche in Wallet:', WALLET.toBase58())
  
  // Token-2022
  const t22 = await conn.getParsedTokenAccountsByOwner(WALLET, { programId: TOKEN22 })
  console.log('Token-2022 Accounts:', t22.value.length)
  t22.value.forEach(t => {
    const i = t.account.data.parsed.info
    console.log(`  Mint: ${i.mint} | Amount: ${i.tokenAmount.uiAmount}`)
  })

  // Standard Token
  const t1 = await conn.getParsedTokenAccountsByOwner(WALLET, { programId: TOKEN_PROG })
  console.log('Token Accounts:', t1.value.length)
  t1.value.filter(t => t.account.data.parsed.info.tokenAmount.uiAmount === 1).forEach(t => {
    console.log(`  NFT Mint: ${t.account.data.parsed.info.mint}`)
  })

  // Direkt Position PDA von dem bekannten Position Account ableiten
  console.log('\n--- Bekannte Position direkt lesen ---')
  const posAddr = new PublicKey('7HZNXH6ZDxGhvPSgcvsiHvMBCyb8dvf9ZL4gwRkjRmbh')
  const posInfo = await conn.getAccountInfo(posAddr)
  if (posInfo) {
    const d = posInfo.data
    console.log('Owner:', posInfo.owner.toBase58())
    console.log('Full hex:', d.toString('hex'))
    
    // Alle 4-byte Werte als Ticks prüfen
    console.log('\nTick-Kandidaten (-500000 bis +500000, nicht 0):')
    for (let off = 0; off < d.length - 3; off += 1) {
      const v = d.readInt32LE(off)
      if (v >= -500000 && v <= 500000 && Math.abs(v) > 1000) {
        console.log(`  byte ${off}: ${v}`)
      }
    }
  }
}
check().catch(console.error)