const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `setLoading(true); setStatus('...')
    try {
      const balResp = await fetch('/api/sol-price')
      const solBal = await connection.getBalance(publicKey)
      const amountRaw = Math.max(0, solBal - 30000000) // 0.03 SOL Reserve
      if (amountRaw <= 0) { setStatus('❌ zu wenig SOL'); setLoading(false); return }
      const r = await fetch('/api/jupiter-stake', {`,
  `setLoading(true); setStatus('...')
    try {
      console.log('STEP 1: getBalance...')
      const solBal = await connection.getBalance(publicKey)
      console.log('STEP 2: solBal =', solBal)
      const amountRaw = Math.max(0, solBal - 30000000)
      console.log('STEP 3: amountRaw =', amountRaw)
      if (amountRaw <= 0) { setStatus('❌ zu wenig SOL'); setLoading(false); return }
      console.log('STEP 4: API call...')
      const r = await fetch('/api/jupiter-stake', {`
)

c = c.replace(
  `const d = await r.json()
      if (d.error) throw new Error(d.error)
      const tx = VersionedTransaction.deserialize(Buffer.from(d.swapTransaction, 'base64'))
      const sig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(sig, 'confirmed')
      setStatus('✅')`,
  `const d = await r.json()
      console.log('STEP 5: API response:', JSON.stringify(d).substring(0,200))
      if (d.error) throw new Error(d.error)
      console.log('STEP 6: deserialize TX...')
      const tx = VersionedTransaction.deserialize(Buffer.from(d.swapTransaction, 'base64'))
      console.log('STEP 7: sendTransaction...')
      const sig = await sendTransaction(tx, connection)
      console.log('STEP 8: sig =', sig)
      await connection.confirmTransaction(sig, 'confirmed')
      console.log('STEP 9: confirmed!')
      setStatus('✅')`
)

fs.writeFileSync(file, c)
console.log('✅ Step logs eingebaut')