import { useEffect, useState } from 'react'

export default function PositionDetails({ position, poolState, fetchPosition, onClose, onCollect, onAddLiquidity, onRebalance, onUpdate, onUpdateFees }) {
  const [details, setDetails] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

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
  }, [position, fetchPosition])

  if (!details) return <div className="position-card"><p style={{color:'var(--muted)'}}>Loading...</p></div>

  const isInRange = poolState?.currentPrice >= details.priceLower && poolState?.currentPrice <= details.priceUpper
  const positionValueUSD = (details.solAmount || 0) * (poolState?.currentPrice || 0) + (details.usdcAmount || 0)
  const earnedSOL = parseFloat(details.feeOwedA || 0) / 1e9
  const earnedUSDC = parseFloat(details.feeOwedB || 0) / 1e6
  const earnedUSD = earnedSOL * (poolState?.currentPrice || 0) + earnedUSDC

  const handleRefreshFees = async () => {
    if (!onUpdateFees) return
    setRefreshing(true)
    await onUpdateFees(position.mint)
    await new Promise(r => setTimeout(r, 3000))
    const updated = await fetchPosition(position.mint)
    if (updated) { setDetails(updated); if (onUpdate) onUpdate(position.mint, updated) }
    setRefreshing(false)
  }

  return (
    <div className="position-card">
      <div className="position-header">
        <span className="position-mint">{position.mint.slice(0,6)}...{position.mint.slice(-4)}</span>
        <span className={'badge ' + (isInRange ? 'badge-green' : 'badge-red')}>{isInRange ? 'IN RANGE' : 'OUT OF RANGE'}</span>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'0.75rem'}}>
        <div>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>Value</div>
          <div style={{color:'var(--green)', fontWeight:'bold', fontSize:'2rem'}}>${positionValueUSD.toFixed(2)}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>Earned</div>
          <div style={{color:'var(--green)', fontWeight:'bold', fontSize:'2rem'}}>${earnedUSD.toFixed(4)}</div>
        </div>
      </div>
      <div className="position-grid">
        <span className="label">Min Price</span><span className="value" style={{color:isInRange ? '#06b6d4' : '#ef4444', fontSize:'1.5rem', fontWeight:'bold'}}>${details.priceLower.toFixed(2)}</span>
        <span className="label" style={{color:"#06b6d4",fontWeight:"bold"}}>Current</span><span className="value" style={{color:"#06b6d4",fontWeight:"bold"}}>${pool?.solPrice?.toFixed(2)}</span>
        <span className="label">Max Price</span><span className="value" style={{color:isInRange ? '#06b6d4' : '#ef4444', fontSize:'1.5rem', fontWeight:'bold'}}>${details.priceUpper.toFixed(2)}</span>
      </div>
      <div>
        <button className="btn btn-blue" onClick={() => { const amt = prompt('SOL amount to add:'); if (amt && onAddLiquidity) onAddLiquidity(position.mint, parseFloat(amt)) }}>Add Liquidity</button>
        <button className="btn btn-green" onClick={() => onCollect && onCollect(position.mint)}>Collect Fees</button>
        <button className="btn btn-yellow" onClick={() => onRebalance && onRebalance(position.mint, 0.03)}>Rebalance 3%</button>
        <button className="btn btn-yellow" onClick={() => onRebalance && onRebalance(position.mint, 0.02)}>Rebalance 2%</button>
        <button className="btn btn-yellow" onClick={() => onRebalance && onRebalance(position.mint, 0.01)}>Rebalance 1%</button>
        <button className="btn btn-red" onClick={() => onClose && onClose(position.mint)}>Close Position</button>
      </div>
    </div>
  )
}