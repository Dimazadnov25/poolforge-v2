import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'

export default function OpenPositionForm({ pool, solPrice, onOpen, loading }) {
  const [solAmount, setSolAmount] = useState('')
  const [range, setRange] = useState(3)
  const [swapping, setSwapping] = useState(false)
  const { connection } = useConnection()
  const wallet = useWallet()

  const doSwap = async (inputMint, outputMint, amount) => {
    if (!wallet?.publicKey) return
    try {
      setSwapping(true)
      const amountLamports = Math.floor(amount * (inputMint === 'So11111111111111111111111111111111111111112' ? 1e9 : 1e6))
      const resp = await fetch('/api/jupiter-stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputMint, outputMint, amount: amountLamports, userPublicKey: wallet.publicKey.toBase58() })
      })
      const data = await resp.json()
      if (data.error) throw new Error(data.error)
      const { VersionedTransaction } = await import('@solana/web3.js')
      const tx = VersionedTransaction.deserialize(Buffer.from(data.swapTransaction, 'base64'))
      const signed = await wallet.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      const latest = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature: sig, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight }, 'confirmed')
      if (pool?.refreshBalances) await pool.refreshBalances()
    } catch (e) {
      alert('Swap Fehler: ' + e.message)
    } finally {
      setSwapping(false)
    }
  }

  const currentPrice = pool?.poolState?.currentPrice || pool?.currentPrice || solPrice || 0
  const priceLower = currentPrice * (1 - range / 100)
  const priceUpper = currentPrice * (1 + range / 100)

  const calcUsdcNeeded = (sol, r) => {
    if (!currentPrice || !sol || !r) return null
    const p = currentPrice
    const pl = p * (1 - r / 100)
    const pu = p * (1 + r / 100)
    const sqrtP = Math.sqrt(p * 1e-3)
    const sqrtPl = Math.sqrt(pl * 1e-3)
    const sqrtPu = Math.sqrt(pu * 1e-3)
    const lam = parseFloat(sol) * 1e9
    if (isNaN(lam) || lam <= 0) return null
    const liq = lam * sqrtP * sqrtPu / (sqrtPu - sqrtP)
    return liq * (sqrtP - sqrtPl) / 1e6
  }

  const handleMaxSol = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const max = Math.max(0, (pool?.solBalance || 0) - 0.01)
    setSolAmount(max.toFixed(4))
  }

  const handleMaxUsdc = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const usdcAvailable = pool?.usdcBalance || 0
    if (!currentPrice || !usdcAvailable) return
    const p = currentPrice
    const pl = p * (1 - range / 100)
    const pu = p * (1 + range / 100)
    const sqrtP = Math.sqrt(p * 1e-3)
    const sqrtPl = Math.sqrt(pl * 1e-3)
    const sqrtPu = Math.sqrt(pu * 1e-3)
    const liq = usdcAvailable * 1e6 / (sqrtP - sqrtPl)
    const solNeeded = liq * (1 / sqrtP - 1 / sqrtPu) / 1e9
    const solAvail = Math.max(0, (pool?.solBalance || 0) - 0.01)
    setSolAmount(Math.min(solNeeded, solAvail).toFixed(4))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!solAmount || !onOpen) return
    onOpen({ priceLower, priceUpper, solAmount: parseFloat(solAmount) })
  }

  const usdc = calcUsdcNeeded(solAmount, range)
  const usdcAvail = pool?.usdcBalance || 0
  const hasEnough = usdc !== null && usdcAvail >= usdc

  return (
    <div className="card" style={{marginTop:'1rem'}}>
      <h3 style={{marginBottom:'1rem'}}>Open Position</h3>

      <div style={{marginBottom:'0.75rem'}}>
        <div style={{color:'var(--muted)', fontSize:'0.75rem', marginBottom:'0.25rem'}}>Range</div>
        <div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>
          {[0.5,1,2,3,5].map(r => (
            <button type="button" key={r} onClick={() => setRange(r)}
              className={range === r ? 'btn btn-blue' : 'btn btn-secondary'}
              style={{padding:'0.25rem 0.5rem', fontSize:'0.8rem'}}>
              {r}%
            </button>
          ))}
        </div>
      </div>

      <div style={{marginBottom:'0.5rem', color:'var(--muted)', fontSize:'0.75rem'}}>
        Range: ${priceLower.toFixed(2)} — ${priceUpper.toFixed(2)}
      </div>

      <div style={{marginBottom:'0.75rem'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.25rem'}}>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>SOL Amount</div>
          <div style={{display:'flex', gap:'0.25rem'}}>
            <button type="button" onClick={handleMaxSol} style={{padding:'0.2rem 0.4rem', borderRadius:'6px', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', cursor:'pointer', fontSize:'0.7rem'}}>MAX SOL</button>
            <button type="button" onClick={handleMaxUsdc} style={{padding:'0.2rem 0.4rem', borderRadius:'6px', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', cursor:'pointer', fontSize:'0.7rem'}}>MAX USDC</button>
          </div>
        </div>
        <input
          type="number"
          value={solAmount}
          onChange={e => setSolAmount(e.target.value)}
          placeholder="0.00"
          style={{width:'100%', padding:'0.5rem', borderRadius:'8px', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:'1rem'}}
        />
      </div>

      {usdc !== null && solAmount && (
        <div style={{
          marginBottom:'0.75rem',
          padding:'0.5rem',
          borderRadius:'8px',
          border:`2px solid ${hasEnough ? '#06b6d4' : '#ef4444'}`,
          background: hasEnough ? 'rgba(6,182,212,0.1)' : 'rgba(239,68,68,0.1)',
          color: hasEnough ? '#06b6d4' : '#ef4444',
          fontSize:'0.8rem',
          textAlign:'center'
        }}>
          USDC benötigt: {usdc.toFixed(2)} — Verfügbar: {usdcAvail.toFixed(2)} {hasEnough ? '✅' : '❌'}
        </div>
      )}

      <button type="button" className="btn btn-blue" onClick={handleSubmit} disabled={loading || !solAmount} style={{width:'100%'}}>
        {loading ? 'Opening...' : 'Open Position'}
      </button>
    </div>
  )
}