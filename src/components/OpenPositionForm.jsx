import { useState } from 'react'

export default function OpenPositionForm({ pool, solPrice, onOpen, loading }) {
  const [solAmount, setSolAmount] = useState('')
  const [range, setRange] = useState(3)

  const currentPrice = pool?.currentPrice || solPrice || 0
  const priceLower = (currentPrice * (1 - range / 100)).toFixed(2)
  const priceUpper = (currentPrice * (1 + range / 100)).toFixed(2)

  const handleOpen = () => {
    if (!solAmount || !currentPrice) return
    onOpen({ priceLower: parseFloat(priceLower), priceUpper: parseFloat(priceUpper), solAmount: parseFloat(solAmount) })
  }

  return (
    <div className="card" style={{marginTop:'1rem'}}>
      <h3 style={{marginBottom:'1rem', color:'var(--text)'}}>Open Position</h3>
      <div style={{marginBottom:'1rem'}}>
        <div style={{color:'var(--muted)', fontSize:'0.75rem', marginBottom:'0.5rem'}}>Range Width</div>
        <div style={{display:'flex', gap:'0.5rem'}}>
          {[1,2,3,5].map(r => (
            <button
              key={r}
              className={'btn ' + (range === r ? 'btn-blue' : 'btn-secondary')}
              onClick={() => setRange(r)}
              style={{flex:1}}
            >{r}%</button>
          ))}
        </div>
      </div>
      <div style={{marginBottom:'1rem', display:'flex', justifyContent:'space-between'}}>
        <div>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>Min Price</div>
          <div style={{color:'#06b6d4', fontWeight:'bold'}}>${priceLower}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>Max Price</div>
          <div style={{color:'#06b6d4', fontWeight:'bold'}}>${priceUpper}</div>
        </div>
      </div>
      <div style={{marginBottom:'1rem'}}>
        <div style={{color:'var(--muted)', fontSize:'0.75rem', marginBottom:'0.25rem'}}>SOL Amount</div>
        <input
          type="number"
          value={solAmount}
          onChange={e => setSolAmount(e.target.value)}
          placeholder="0.00"
          style={{width:'100%', padding:'0.5rem', borderRadius:'8px', border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text)', fontSize:'1rem'}}
        />
      </div>
      <button className="btn btn-blue" onClick={handleOpen} disabled={loading || !solAmount} style={{width:'100%'}}>
        {loading ? 'Opening...' : 'Open Position'}
      </button>
    </div>
  )
}