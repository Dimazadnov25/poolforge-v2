const { Connection, PublicKey } = require('@solana/web3.js')
const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const conn = new Connection(RPC)

async function check() {
  // Erst als Transaction prüfen
  const sig = '3EPqtTKja3qhANTuigvsuCnkWtLiwKj9W9yenhBKMLGeM7jsHrfW88jbqhFNmZzexTHfXnTaYLESeEiYPUYC7y7E'
  console.log('Prüfe als Transaction...')
  const tx = await conn.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 })
  if (tx) {
    console.log('✅ Transaction gefunden!')
    console.log('Program IDs:', [...new Set(tx.transaction.message.instructions.map(i => i.programId?.toBase58()).filter(Boolean))])
    const logs = tx.meta?.logMessages || []
    logs.slice(0,10).forEach(l => console.log('LOG:', l))
    return
  }

  // Dann als Account prüfen
  console.log('Prüfe als Account...')
  try {
    const addr = new PublicKey(sig)
    const info = await conn.getAccountInfo(addr)
    if (!info) { console.log('Auch kein Account'); return }
    console.log('Owner:', info.owner.toBase58())
    console.log('Data length:', info.data.length)
  } catch(e) { console.log('Kein gültiger Pubkey') }
}
check().catch(console.error)