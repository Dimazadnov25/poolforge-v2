import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useState, useCallback, useEffect } from 'react'
import { usePool } from '../hooks/usePool'
import PoolStats from './PoolStats'
import PositionDetails from './PositionDetails'
import SwapWidget from './SwapWidget'
import LendDashboard from './LendDashboard'
import MeteoraDashboard from './MeteoraDashboard'

export default function PoolDashboard() {
  const [solVolume, setSolVolume] = useState(null)
  useEffect(() => {
    const fetchVolume = async () => {
      try {
        const r = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT')
        const d = await r.json()
        if (d.quoteVolume) setSolVolume(parseFloat(d.quoteVolume))
      } catch(e) {}
    }
    fetchVolume()
    const iv = setInterval(fetchVolume, 60000)
    return () => clearInterval(iv)
  }, [])

  const wallet = useWallet()
  const pool = usePool()
  const [positionData, setPositionData] = useState({})

  const handlePositionUpdate = useCallback((mint, details) => {
    setPositionData(prev => ({ ...prev, [mint]: details }))
  }, [])

  const totalEarned = Object.values(positionData).reduce((acc, d) => {
    if (!d) return acc
    return acc + (parseFloat(d.feeOwedA || 0) / 1e9) * (pool.solPrice || 0) + parseFloat(d.feeOwedB || 0) / 1e6
  }, 0)

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <svg width="28" height="28" viewBox="0 0 397 311" style={{marginRight:'8px'}} xmlns="http://www.w3.org/2000/svg">
            <path d="M64.6 237.9a9 9 0 016.3-2.6h314.4c4 0 6 4.8 3.2 7.6l-62.4 62.4a9 9 0 01-6.3 2.6H5.4c-4 0-6-4.8-3.2-7.6l62.4-62.4z" fill="url(#a)"/>
            <path d="M64.6 2.6A9.1 9.1 0 0170.9 0h314.4c4 0 6 4.8 3.2 7.6L326.1 70a9 9 0 01-6.3 2.6H5.4C1.4 72.6-.6 67.8 2.2 65L64.6 2.6z" fill="url(#b)"/>
            <path d="M326.1 119.7a9 9 0 00-6.3-2.6H5.4c-4 0-6 4.8-3.2 7.6l62.4 62.4a9 9 0 006.3 2.6h314.4c4 0 6-4.8 3.2-7.6l-62.4-62.4z" fill="url(#c)"/>
            <defs>
              <linearGradient id="a" x1="-7" y1="296" x2="381" y2="296" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
              <linearGradient id="b" x1="-7" y1="36" x2="381" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
              <linearGradient id="c" x1="-7" y1="155" x2="381" y2="155" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
            </defs>
          </svg>
          <span className="logo">PoolForge</span>
          <span className="pair-badge">SOL / USDC</span>
        </div>
        <WalletMultiButton />
      </header>

      <div style={{display:'flex',alignItems:'center',gap:'0.75rem',flexWrap:'wrap'}}>
              {pool.solPrice && (
                <div className="price-ticker">
                  SOL <strong style={{color:'#06b6d4',fontSize:'2rem'}}>${pool.solPrice.toFixed(2)}</strong>
                </div>
              )}
              {solVolume != null && (
                <div className="price-ticker" style={{fontSize:'1rem',padding:'0.5rem 1.2rem',display:'flex',flexDirection:'column',alignItems:'center',gap:'0.2rem'}}>
                  <span style={{color:'#94a3b8',fontSize:'0.75rem',letterSpacing:'0.05em',textTransform:'uppercase'}}>Vol 24h</span>
                  <strong style={{color:'#10b981',fontSize:'1.6rem'}}>
                    ${solVolume>=1e9?(solVolume/1e9).toFixed(2)+'B':solVolume>=1e6?(solVolume/1e6).toFixed(1)+'M':solVolume.toFixed(0)}
                  </strong>
                </div>
              )}
            </div>

      

      {wallet.connected && (
        <div className="balances">
          <span>SOL: <strong>{pool.solBalance != null ? pool.solBalance.toFixed(4) : '�'}</strong></span>
          <span>USDC: <strong>{pool.usdcBalance != null ? pool.usdcBalance.toFixed(2) : '�'}</strong></span>
          
        </div>
      )}

      {pool.error && <div className="error-banner">{pool.error}</div>}
      {pool.txStatus && <div className={'tx-status tx-status--' + pool.txStatus}>{pool.txStatus}</div>}

      {wallet.connected ? (
        <div>
          {pool.positions.length > 0 && (
            <div className="positions-list" style={{marginBottom:'1rem'}}>
              {pool.positions.map(p => (
                <PositionDetails
                  key={p.mint}
                  position={p}
                  poolState={pool.poolState}
                  solBalance={pool.solBalance}
                  usdcBalance={pool.usdcBalance}
                  solPrice={pool.solPrice}
                  fetchPosition={pool.fetchPosition}
                  onClose={pool.closePosition}
                  onCollect={pool.collectFees}
                  onAddLiquidity={pool.addLiquidity}
                  onRebalance={pool.rebalancePosition}
                  onUpdateFees={pool.updateFees}
                  onUpdate={handlePositionUpdate}
                />
              ))}
            </div>
          )}
                    <MeteoraDashboard solPrice={pool.solPrice} />
          <LendDashboard usdcBalance={pool.usdcBalance} />
          
          <SwapWidget solPrice={pool.solPrice} solBalance={pool.solBalance} usdcBalance={pool.usdcBalance} />
        </div>
      ) : (
        <div className="connect-cta">
          <p>Connect your Phantom wallet to manage SOL/USDC liquidity</p>
          <WalletMultiButton />
        </div>
      )}
    </div>
  )
}




