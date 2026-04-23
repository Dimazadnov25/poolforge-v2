import { useState } from 'react';

export default function OpenPositionForm({ pool, solPrice, onOpen, loading }) {
  const [priceLower, setPriceLower] = useState('');
  const [priceUpper, setPriceUpper] = useState('');
  const [solAmount, setSolAmount] = useState('');

  const currentPrice = pool?.currentPrice || 0;
  const decAdj = 1e-3;
  const sqrtP = Math.sqrt(currentPrice * decAdj);
  const sqrtPl = priceLower ? Math.sqrt(parseFloat(priceLower) * decAdj) : 0;
  const sqrtPu = priceUpper ? Math.sqrt(parseFloat(priceUpper) * decAdj) : 0;
  const lamports = solAmount ? Math.floor(parseFloat(solAmount) * 1e9) : 0;
  const liqAmount = (sqrtPu > sqrtP && lamports > 0) ? Math.floor(lamports * sqrtP * sqrtPu / (sqrtPu - sqrtP)) : 0;
  const usdcNeeded = (liqAmount > 0 && sqrtP > sqrtPl) ? (liqAmount * (sqrtP - sqrtPl) / 1e6).toFixed(2) : '0.00';

  const handleSubmit = () => {
    if (!priceLower || !priceUpper || !solAmount) return;
    onOpen({ priceLower: parseFloat(priceLower), priceUpper: parseFloat(priceUpper), solAmount: parseFloat(solAmount) });
  };

  return (
    <div className="open-position-form">
      <h3>Open Position</h3>
      {pool && <p style={{color:'var(--muted)',marginBottom:'1rem',fontSize:'0.85rem'}}>Current price: <span style={{color:'var(--green)'}}></span> USDC/SOL</p>}
      <div className="form-row">
        <div className="form-group">
          <label>Min Price (USDC per SOL)</label>
          <input type="number" value={priceLower} onChange={e => setPriceLower(e.target.value)} placeholder="e.g. 80" />
        </div>
        <div className="form-group">
          <label>Max Price (USDC per SOL)</label>
          <input type="number" value={priceUpper} onChange={e => setPriceUpper(e.target.value)} placeholder="e.g. 95" />
        </div>
      </div>
      <div className="form-group" style={{marginBottom:'1rem'}}>
        <label>SOL Amount</label>
        <input type="number" value={solAmount} onChange={e => setSolAmount(e.target.value)} placeholder="e.g. 0.1" />
      </div>
      {usdcNeeded !== '0.00' && (
        <div className="usdc-hint">≈ {usdcNeeded} USDC required</div>
      )}
      <button className="btn-open" onClick={handleSubmit} disabled={loading || !priceLower || !priceUpper || !solAmount}>
        {loading ? 'Processing...' : 'Open Position'}
      </button>
    </div>
  );
}
