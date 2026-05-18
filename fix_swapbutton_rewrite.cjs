const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// Alten SwapButton komplett ersetzen
const oldStart = c.indexOf('function SwapButton()')
const oldEnd = c.indexOf('\nexport default function Pool')
if (oldStart === -1) { console.log('❌ SwapButton nicht gefunden'); process.exit(1) }

const oldBlock = c.substring(oldStart, oldEnd)

const newBlock = `function SwapButton() {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [txt, setTxt] = React.useState('MAX SOL \u2192 JitoSOL')
  async function doSwap() {
    if (!publicKey) { setTxt('Wallet!'); setTimeout(()=>setTxt('MAX SOL \u2192 JitoSOL'),3000); return }
    setTxt('Balance...')
    try {
      const solBal = await connection.getBalance(publicKey)
      const amountRaw = solBal - 30000000
      if (amountRaw <= 0) { setTxt('Zu wenig SOL'); setTimeout(()=>setTxt('MAX SOL \u2192 JitoSOL'),3000); return }
      setTxt('Quote...')
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
      if (d.error) { setTxt('API: ' + d.error.substring(0,20)); setTimeout(()=>setTxt('MAX SOL \u2192 JitoSOL'),5000); return }
      setTxt('Signieren...')
      const tx = VersionedTransaction.deserialize(Buffer.from(d.swapTransaction, 'base64'))
      const sig = await sendTransaction(tx, connection)
      setTxt('Warten...')
      await connection.confirmTransaction(sig, 'confirmed')
      setTxt('✅ OK')
      setTimeout(()=>{ setTxt('MAX SOL \u2192 JitoSOL'); window.location.reload() }, 2000)
    } catch(e) {
      setTxt(e.message.substring(0,25))
      setTimeout(()=>setTxt('MAX SOL \u2192 JitoSOL'), 5000)
    }
  }
  return (
    <button onClick={doSwap} style={{
      fontSize:'0.6rem',padding:'0.15rem 0.4rem',borderRadius:'3px',
      border:'1px solid rgba(0,255,255,0.3)',background:'rgba(0,255,255,0.05)',
      color:'#00ffff',fontFamily:'Share Tech Mono,monospace',cursor:'pointer',
      minWidth:'120px'
    }}>{txt}</button>
  )
}

`

c = c.substring(0, oldStart) + newBlock + c.substring(oldEnd)
fs.writeFileSync(file, c)
console.log('✅ SwapButton neu geschrieben')