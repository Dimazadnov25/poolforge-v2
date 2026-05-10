import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useState, useCallback, useEffect } from 'react'
import { usePool } from '../hooks/usePool'
import PositionDetails from './PositionDetails'
import SwapWidget from './SwapWidget'
import ByrealDashboard from './ByrealDashboard'
import PriceAlert from './PriceAlert'

export default function PoolDashboard() {
  const [solVolume, setSolVolume] = useState(null)
  const [solTvl, setSolTvl] = useState(null)
  const [solTrend, setSolTrend] = useState(null)
  const [swapSuggest, setSwapSuggest] = useState(null)
  const [positionData, setPositionData] = useState({})
  const wallet = useWallet()
  const pool = usePool()

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

  useEffect(() => {
    const iv = setInterval(() => {
      if (pool.refreshBalances) pool.refreshBalances()
    }, 3000)
    return () => clearInterval(iv)
  }, [pool.refreshBalances])

  const handlePositionUpdate = useCallback((mint, details) => {
    setPositionData(prev => ({ ...prev, [mint]: details }))
  }, [])

  
  useEffect(() => {
    const loadTrend = async () => {
      try {
        const r = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT')
        const d = await r.json()
        setSolTrend(parseFloat(d.priceChangePercent))
      } catch(e) {}
    }
    loadTrend()
    const iv = setInterval(loadTrend, 60000)
    return () => clearInterval(iv)
  }, [])
return (
    <div style={{maxWidth:'430px',margin:'0 auto',padding:'0.6rem 0.75rem',background:'#080808',minHeight:'100dvh',display:'flex',flexDirection:'column',gap:'0.5rem'}}>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.4rem'}}>
          <svg width="18" height="18" viewBox="0 0 397 311" xmlns="http://www.w3.org/2000/svg">
            <path d="M64.6 237.9a9 9 0 016.3-2.6h314.4c4 0 6 4.8 3.2 7.6l-62.4 62.4a9 9 0 01-6.3 2.6H5.4c-4 0-6-4.8-3.2-7.6l62.4-62.4z" fill="url(#a)"/>
            <path d="M64.6 2.6A9.1 9.1 0 0170.9 0h314.4c4 0 6 4.8 3.2 7.6L326.1 70a9 9 0 01-6.3 2.6H5.4C1.4 72.6-.6 67.8 2.2 65L64.6 2.6z" fill="url(#b)"/>
            <path d="M326.1 119.7a9 9 0 00-6.3-2.6H5.4c-4 0-6 4.8-3.2 7.6l62.4 62.4a9 9 0 006.3 2.6h314.4c4 0 6-4.8 3.2-7.6l-62.4-62.4z" fill="url(#c)"/>
            <defs>
              <linearGradient id="a" x1="-7" y1="296" x2="381" y2="296" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
              <linearGradient id="b" x1="-7" y1="36" x2="381" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
              <linearGradient id="c" x1="-7" y1="155" x2="381" y2="155" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
            </defs>
          </svg>
          <span style={{fontWeight:700,fontSize:'1.425rem',color:'#e2e8f0',fontFamily:'Orbitron,monospace'}}>PoolForge</span>
          <span style={{fontSize:'0.975rem',background:'rgba(0,255,255,0.1)',color:'#00ffff',padding:'0.1rem 0.35rem',borderRadius:'4px',fontFamily:'Share Tech Mono,monospace'}}>SOL/USDC</span>
        </div>
        <WalletMultiButton />
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
        {pool.solPrice && (
          <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.5rem',border:'1px solid rgba(0,255,255,0.3)'}}>
            <div style={{fontSize:'0.65rem',color:'#ff2244',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>SOL</div>
        {solTvl && (
          <div style={{
            background: 'rgba(0,255,255,0.05)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'inline-block',
            marginLeft: '16px'
          }}>
            <div style={{color:'#ff2244', fontSize:'0.75rem', marginBottom:'4px'}}>SOLANA TVL</div>
            <strong style={{color:'#00ffff', fontSize:'1.6rem'}}>
              ${solTvl >= 1e9
                ? (solTvl / 1e9).toFixed(2) + 'B'
                : solTvl >= 1e6
                  ? (solTvl / 1e6).toFixed(1) + 'M'
                  : solTvl.toFixed(0)}
            </strong>
          </div>
        )}
        {solTvl && (
          <div style={{
            background: 'rgba(0,255,255,0.05)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'inline-block',
            marginLeft: '16px'
          }}>
            <div style={{color:'#ff2244', fontSize:'0.75rem', marginBottom:'4px'}}>SOLANA TVL</div>
            <strong style={{color:'#00ffff', fontSize:'1.6rem'}}>
              ${solTvl >= 1e9
                ? (solTvl / 1e9).toFixed(2) + 'B'
                : solTvl >= 1e6
                  ? (solTvl / 1e6).toFixed(1) + 'M'
                  : solTvl.toFixed(0)}
            </strong>
          </div>
        )}
            <div style={{fontSize:'2.2rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>${pool.solPrice.toFixed(2)}</div>
          </div>
        )}
        {solVolume != null && (
          <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.5rem 0.6rem',border:'1px solid rgba(0,255,255,0.15)'}}>
            <div style={{fontSize:'0.9rem',color:'#444',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>Vol 24h</div>
            <div style={{fontSize:'2.1rem',fontWeight:700,color:'#00ff88',fontFamily:'Orbitron,monospace'}}>
              ${solVolume>=1e9?(solVolume/1e9).toFixed(1)+'B':solVolume>=1e6?(solVolume/1e6).toFixed(0)+'M':solVolume.toFixed(0)}
            </div>
          </div>
        )}
      </div>

      <PriceAlert solPrice={pool.solPrice} />
      <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>
      <ByrealDashboard />
      </div>
      {solTrend !== null && (
        <div style={{
          padding:'0.45rem 0.9rem', borderRadius:'6px', fontWeight:700, fontSize:'1.35rem',
          fontFamily:'Share Tech Mono, monospace',
          border: solTrend >= 0 ? '2px solid rgba(0,255,136,0.4)' : '2px solid rgba(255,34,68,0.4)',
          background: solTrend >= 0 ? 'rgba(0,255,136,0.07)' : 'rgba(255,34,68,0.07)',
          color: solTrend >= 0 ? '#00ff88' : '#ff2244'
        }}>{solTrend >= 0 ? '▲' : '▼'} {Math.abs(solTrend).toFixed(2)}%</div>
      )}

      {pool.error && <div style={{background:'rgba(255,34,68,0.1)',border:'1px solid rgba(255,34,68,0.3)',borderRadius:'0.5rem',padding:'0.4rem 0.6rem',color:'#ff2244',fontSize:'1.17rem',fontFamily:'Share Tech Mono,monospace'}}>{pool.error}</div>}
      {pool.txStatus && <div style={{background:'rgba(0,255,255,0.1)',borderRadius:'0.5rem',padding:'0.4rem 0.6rem',color:'#00ffff',fontSize:'1.17rem',fontFamily:'Share Tech Mono,monospace'}}>{pool.txStatus}</div>}

      <SwapWidget solPrice={pool.solPrice} solBalance={pool.solBalance} usdcBalance={pool.usdcBalance} />

      {wallet.connected && pool.positions.length > 0 && pool.positions.map(p => (
        <PositionDetails
          key={p.mint}
          position={p}
          poolState={pool.poolState}
          solBalance={pool.solBalance}
          usdcBalance={pool.usdcBalance}
          solPrice={pool.solPrice}
          fetchPosition={pool.fetchPosition}
          onClose={pool.closePosition}
          onCollect={async (...args) => {
            await pool.collectFees(...args)
            await new Promise(r => setTimeout(r, 3000))
            const bal = pool.solBalance || 0
            const excess = parseFloat((bal - 0.01).toFixed(4))
            if (excess > 0.001) setSwapSuggest(excess)
          }}
          onAddLiquidity={pool.addLiquidity}
          onRebalance={pool.rebalancePosition}
          onUpdateFees={pool.updateFees}
          onUpdate={handlePositionUpdate}
        />
      ))}

      {!wallet.connected && (
        <div style={{textAlign:'center',padding:'1.5rem 1rem'}}>
          <p style={{color:'#444',marginBottom:'1rem',fontSize:'1.275rem',fontFamily:'Share Tech Mono,monospace'}}>// WALLET VERBINDEN</p>
          <WalletMultiButton />
        </div>
      )}

      {swapSuggest && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}
          onClick={() => setSwapSuggest(null)}>
          <div style={{background:'#111',borderRadius:'0.75rem',padding:'1.5rem',maxWidth:'340px',width:'90%',border:'1px solid rgba(0,255,255,0.3)'}}
            onClick={e => e.stopPropagation()}>
            <div style={{fontSize:'1.5rem',fontWeight:700,color:'#00ffff',marginBottom:'0.75rem',fontFamily:'Orbitron,monospace'}}>SOL USDC</div>
            <div style={{color:'#888',fontSize:'1.275rem',marginBottom:'1.25rem',fontFamily:'Share Tech Mono,monospace'}}>
              Überschuss: <strong style={{color:'#00ffff'}}>{swapSuggest} SOL</strong><br/>Jetzt tauschen?
            </div>
            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={() => setSwapSuggest(null)} style={{flex:1,padding:'0.6rem',borderRadius:'4px',border:'1px solid #333',background:'transparent',color:'#444',cursor:'pointer',fontFamily:'Share Tech Mono,monospace'}}>NEIN</button>
              <button onClick={async () => { setSwapSuggest(null); await pool.swapSolToUsdc(swapSuggest) }} style={{flex:1,padding:'0.6rem',borderRadius:'4px',border:'1px solid #00ffff',background:'rgba(0,255,255,0.1)',color:'#00ffff',cursor:'pointer',fontFamily:'Orbitron,monospace',fontWeight:700}}>JA</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  React.useEffect(() => {
    const fetchTvl = async () => {
      try {
        const r = await fetch('https://api.llama.fi/v2/chains')
        const chains = await r.json()
        const sol = chains.find(ch => ch.name === 'Solana')
        if (sol?.tvl) setSolTvl(sol.tvl)
      } catch(e) { console.warn('TVL fetch error', e) }
    }
    fetchTvl()
    const id = setInterval(fetchTvl, 60000)
    return () => clearInterval(id)
  }, [])

  React.useEffect(() => {
    const fetchTvl = async () => {
      try {
        const r = await fetch('https://api.llama.fi/v2/chains')
        const chains = await r.json()
        const sol = chains.find(ch => ch.name === 'Solana')
        if (sol?.tvl) setSolTvl(sol.tvl)
      } catch(e) { console.warn('TVL fetch error', e) }
    }
    fetchTvl()
    const id = setInterval(fetchTvl, 60000)
    return () => clearInterval(id)
  }, [])
}