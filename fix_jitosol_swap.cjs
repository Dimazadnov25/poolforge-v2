const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// useState/useConnection/useWallet imports prüfen
if (!c.includes('useState')) c = c.replace("import React", "import React, { useState }")

// Den externen Jupiter-Link ersetzen durch internen Swap-Button
const oldLink = `<a href="https://jup.ag/swap/SOL-JitoSOL" target="_blank" rel="noreferrer" style={{fontSize:'0.6rem',padding:'0.15rem 0.4rem',borderRadius:'3px',border:'1px solid rgba(0,255,255,0.3)',background:'rgba(0,255,255,0.05)',color:'#00ffff',fontFamily:'Share Tech Mono,monospace',textDecoration:'none'}}>MAX SOL → JitoSOL</a>`

const newBtn = `<SwapButton />`

// SwapButton Komponente am Ende der Datei vor export einfügen
const swapComp = `
function SwapButton() {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = React.useState(false)
  const [status, setStatus] = React.useState('')
  async function doSwap() {
    if (!publicKey) return
    setLoading(true); setStatus('...')
    try {
      const balResp = await fetch('/api/sol-price')
      const solBal = await connection.getBalance(publicKey)
      const amountRaw = Math.max(0, solBal - 30000000) // 0.03 SOL Reserve
      if (amountRaw <= 0) { setStatus('❌ zu wenig SOL'); setLoading(false); return }
      const r = await fetch('/api/jupiter-stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputMint: 'So11111111111111111111111111111111111111112',
          outputMint: 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
          amount: amountRaw,
          userPublicKey: publicKey.toBase58()
        })
      })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      const { VersionedTransaction } = await import('@solana/web3.js')
      const tx = VersionedTransaction.deserialize(Buffer.from(d.swapTransaction, 'base64'))
      const sig = await sendTransaction(tx, connection)
      await connection.confirmTransaction(sig, 'confirmed')
      setStatus('✅'); setTimeout(() => { setStatus(''); window.location.reload() }, 2000)
    } catch(e) { setStatus('❌ ' + e.message) }
    setLoading(false)
  }
  return (
    <button onClick={doSwap} disabled={loading || !publicKey} style={{
      fontSize:'0.6rem',padding:'0.15rem 0.4rem',borderRadius:'3px',
      border:'1px solid rgba(0,255,255,0.3)',background:'rgba(0,255,255,0.05)',
      color:'#00ffff',fontFamily:'Share Tech Mono,monospace',cursor:'pointer'
    }}>
      {loading ? status : 'MAX SOL → JitoSOL'}
    </button>
  )
}
`

if (!c.includes(oldLink)) { console.log('❌ Link nicht gefunden — exakter Text:'); console.log(JSON.stringify(c.substring(c.indexOf('jup.ag')-50, c.indexOf('jup.ag')+200))); process.exit(1) }

c = c.replace(oldLink, newBtn)

// SwapButton vor dem letzten `export default` einfügen
c = c.replace(/export default function Pool/, swapComp + '\nexport default function Pool')

fs.writeFileSync(file, c)
console.log('✅ JitoSOL Swap intern umgebaut (0.03 SOL Reserve)')