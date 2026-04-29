import { useEffect, useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'

export default function PositionDetails({ position, poolState, solBalance, usdcBalance, solPrice, fetchPosition, onClose, onCollect, onAddLiquidity, onRebalance, onUpdate, onUpdateFees }) {
  const [details, setDetails] = useState(null)
  const [addAmount, setAddAmount] = useState('')
  const [refreshing, setRefreshing] = useState(false)
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
      setTimeout(() => window.location.reload(), 2000)
    } catch (e) {
      alert('Swap Fehler: ' + e.message)
    } finally {
      setSwapping(false)
    }
  }

  useEffect(() => {
    if (position?.mint) {
      const load = () => fetchPosition(position.mint).then(d => {
        setDetails(d)
        if (onUpdate) onUpdate(position.mint, d)
      })
      load()
      const interval = setInterval(load, 60000)
      return () => clearInterval(interval)
    }
  }, [position?.mint])

  if (!details) return <div className="card" style={{marginTop:'0.5rem'}}>Loading...</div>

  const inRange = poolState?.currentPrice >= details.priceLower && poolState?.currentPrice <= details.priceUpper
  const feeA = parseFloat(details.feeOwedA || 0) / 1e9
  const feeB = parseFloat(details.feeOwedB || 0) / 1e6
  const feeUSD = feeA * (poolState?.currentPrice || 0) + feeB
  const posValue = details.solAmount * (poolState?.currentPrice || 0) + details.usdcAmount

  return (
    <div className="card" style={{marginTop:'0.5rem'}}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.5rem'}}>
        <span style={{fontSize:'0.75rem', color:'var(--muted)'}}>{position.mint.slice(0,8)}...{position.mint.slice(-4)}</span>
        <span style={{fontSize:'0.75rem', padding:'0.1rem 0.5rem', borderRadius:'999px', background: inRange ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: inRange ? '#22c55e' : '#ef4444'}}>
          {inRange ? '? In Range' : '? Out of Range'}
        </span>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'0.75rem'}}>
        <div style={{background:'var(--surface)', borderRadius:'8px', padding:'0.5rem'}}>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>Min Price</div>
          <span style={{color:'var(--text)', fontWeight:'bold'}}>${details.priceLower.toFixed(2)}</span>
        </div>
        <div style={{background:'var(--surface)', borderRadius:'8px', padding:'0.5rem'}}>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>Max Price</div>
          <span style={{color:'var(--text)', fontWeight:'bold'}}>${details.priceUpper.toFixed(2)}</span>
        </div>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', marginBottom:'0.75rem'}}>
        <div style={{background:'var(--surface)', borderRadius:'8px', padding:'0.5rem'}}>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>Value</div>
          <div style={{color:'var(--green)', fontWeight:'bold'}}>${posValue.toFixed(2)}</div>
          <div style={{color:'var(--muted)', fontSize:'0.7rem'}}>{details.solAmount.toFixed(4)} SOL + {details.usdcAmount.toFixed(2)} USDC</div>
        </div>
        <div style={{background:'var(--surface)', borderRadius:'8px', padding:'0.5rem'}}>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>Fees</div>
          <div style={{color:'var(--green)', fontWeight:'bold'}}>${feeUSD.toFixed(4)}</div>
          <div style={{color:'var(--muted)', fontSize:'0.7rem'}}>{feeA.toFixed(6)} SOL + {feeB.toFixed(4)} USDC</div>
        </div>
      </div>

      <div style={{marginBottom:'0.5rem'}}>
        <div style={{display:'flex', gap:'0.5rem', alignItems:'center', marginBottom:'0.25rem'}}>
          <input
            type="number"
            value={addAmount}
            onChange={e => setAddAmount(e.target.value)}
            placeholder="SOL"
            style={{flex:1, padding:'0.3rem', borderRadius:'6px', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)'}}
          />
          <div style={{display:'flex',gap:'0.25rem'}}>
            <button type="button" onClick={(e)=>{e.stopPropagation();setAddAmount(Math.max(0,(solBalance||0)-0.01).toFixed(4))}} style={{padding:'0.2rem 0.4rem',borderRadius:'6px',border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)',cursor:'pointer',fontSize:'0.7rem'}}>MAX SOL</button>
            <button type="button" onClick={(e)=>{e.stopPropagation();if(!details||!poolState?.currentPrice) return;const p=poolState.currentPrice;const pl=details.priceLower;const pu=details.priceUpper;const sqrtP=Math.sqrt(p*1e-3);const sqrtPl=Math.sqrt(pl*1e-3);const sqrtPu=Math.sqrt(pu*1e-3);const usdcAvail=usdcBalance||0;const liq=usdcAvail*1e6/(sqrtP-sqrtPl);const solNeeded=liq*(1/sqrtP-1/sqrtPu)/1e9;setAddAmount(Math.min(solNeeded,Math.max(0,(solBalance||0)-0.01)).toFixed(4))}} style={{padding:'0.2rem 0.4rem',borderRadius:'6px',border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)',cursor:'pointer',fontSize:'0.7rem'}}>MAX USDC</button>
          </div>
        </div>
        {addAmount && details && poolState?.currentPrice && (() => {
          const p=poolState.currentPrice;const pl=details.priceLower;const pu=details.priceUpper;
          const sqrtP=Math.sqrt(p*1e-3);const sqrtPl=Math.sqrt(pl*1e-3);const sqrtPu=Math.sqrt(pu*1e-3);
          const lam=parseFloat(addAmount)*1e9;
          const liq=lam*sqrtP*sqrtPu/(sqrtPu-sqrtP);
          const usdcNeeded=liq*(sqrtP-sqrtPl)/1e6;
          const solNeeded=parseFloat(addAmount);
          const hasSOL=(solBalance||0)>=solNeeded+0.01;
          const hasUSDC=(usdcBalance||0)>=usdcNeeded;
          const ok=hasSOL&&hasUSDC;
          return <div style={{marginBottom:'0.25rem',padding:'0.4rem',borderRadius:'8px',border:'2px solid '+(ok?'#22c55e':'#ef4444'),background:ok?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)',color:ok?'#22c55e':'#ef4444',fontSize:'0.75rem',textAlign:'center'}}>
            SOL: {solNeeded.toFixed(4)} {hasSOL?'?':'?'} | USDC: {usdcNeeded.toFixed(2)} {hasUSDC?'?':'?'}
            {!hasSOL && <div style={{marginTop:'0.25rem'}}><button type="button" onClick={()=>doSwap('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v','So11111111111111111111111111111111111111112',(solNeeded+0.01-(solBalance||0)+0.005))} disabled={swapping} style={{padding:'0.2rem 0.5rem',borderRadius:'6px',background:'#ef4444',color:'white',border:'none',cursor:'pointer',fontSize:'0.7rem'}}>{swapping?'...':'USDC ? SOL swappen'}</button></div>}
            {!hasUSDC && <div style={{marginTop:'0.25rem'}}><button type="button" onClick={()=>doSwap('So11111111111111111111111111111111111111112','EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',(usdcNeeded-(usdcBalance||0))/( solPrice||86)*1.01)} disabled={swapping} style={{padding:'0.2rem 0.5rem',borderRadius:'6px',background:'#ef4444',color:'white',border:'none',cursor:'pointer',fontSize:'0.7rem'}}>{swapping?'...':'SOL ? USDC swappen'}</button></div>}
          </div>
        })()}
        <button type="button" className="btn btn-blue" style={{width:'100%'}}
          onClick={(e) => { e.stopPropagation(); if (addAmount && onAddLiquidity) { onAddLiquidity(position.mint, parseFloat(addAmount)); setAddAmount('') } }}>
          Add Liquidity
        </button>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'0.5rem'}}>
        <button type="button" className="btn btn-green" onClick={() => onCollect && onCollect(position.mint)}>Collect Fees</button>
        <button type="button" className="btn btn-yellow" onClick={() => onRebalance && onRebalance(position.mint, 0.03)}>Rebalance 3%</button>
        <button type="button" className="btn btn-yellow" onClick={() => onRebalance && onRebalance(position.mint, 0.02)}>Rebalance 2%</button>
        <button type="button" className="btn btn-yellow" onClick={() => onRebalance && onRebalance(position.mint, 0.01)}>Rebalance 1%</button>
        <button type="button" className="btn btn-red" onClick={() => onClose && onClose(position.mint)}>Close Position</button>
      </div>
    </div>
  )
}
