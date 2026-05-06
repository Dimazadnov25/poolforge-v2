const { Connection, PublicKey } = require('@solana/web3.js')
const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const conn = new Connection(RPC)

async function check() {
  const sig = '3EPqtTKja3qhANTuigvsuCnkWtLiwKj9W9yenhBKMLGeM7jsHrfW88jbqhFNmZzexTHfXnTaYLESeEiYPUYC7y7E'
  const tx = await conn.getParsedTransaction(sig, { maxSupportedTransactionVersion: 0 })

  console.log('\n=== ALLE ACCOUNTS IN TX ===')
  const keys = tx.transaction.message.accountKeys
  keys.forEach((k, i) => console.log(`[${i}] ${k.pubkey.toBase58()} writable=${k.writable} signer=${k.signer}`))

  console.log('\n=== POST BALANCES (neue Accounts) ===')
  const pre = tx.meta.preBalances
  const post = tx.meta.postBalances
  keys.forEach((k, i) => {
    if (pre[i] === 0 && post[i] > 0) console.log(`NEU erstellt: ${k.pubkey.toBase58()} (${post[i]} lamports)`)
  })

  console.log('\n=== ALLE LOGS ===')
  tx.meta.logMessages.forEach(l => console.log(l))

  console.log('\n=== INNER INSTRUCTIONS ===')
  tx.meta.innerInstructions?.forEach(ii => {
    ii.instructions.forEach(ix => console.log('inner:', JSON.stringify(ix).substring(0, 200)))
  })
}
check().catch(console.error)