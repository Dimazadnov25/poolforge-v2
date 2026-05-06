const fs = require('fs')

const newDashboard = `import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useState, useCallback, useEffect } from 'react'
import { usePool } from '../hooks/usePool'
import PositionDetails from './PositionDetails'
import SwapWidget from './SwapWidget'
import ByrealDashboard from './ByrealDashboard'
import PriceAlert from './PriceAlert'

export default function PoolDashboard() {
  const [solVolume, setSolVolume] = useState(null)
  const [tab, setTab] = useState('position')
  const [swapSuggest, setSwapSuggest] = useState(null)
  const [positionData, setPositionData] = useState({})

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

  const handlePositionUpdate = useCallback((mint, details) => {
    setPositionData(prev => ({ ...prev, [mint]: details }))
  }, [])

  const tabs = [
    { id: 'position', label: '📊 Position' },
    { id: 'swap', label: '💱 Swap' },
    { id: 'alert', label: '🔔 Alert' },
  ]

  return (
    <div style={{maxWidth:'430px', margin:'0 auto', height:'100dvh', display:'flex', flexDirection:'column', background:'#0f172a', overflow:'hidden'}}>
      
      {/* HEADER - kompakt */}
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0.6rem 1rem', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'center', gap:'0.4rem'}}>
          <svg width="20" height="20" viewBox="0 0 397 311" xmlns="http://www.w3.org/2000/svg">
            <path d="M64.6 237.9a9 9 0 016.3-2.6h314.4c4 0 6 4.8 3.2 7.6l-62.4 62.4a9 9 0 01-6.3 2.6H5.4c-4 0-6-4.8-3.2-7.6l62.4-62.4z" fill="url(#a)"/>
            <path d="M64.6 2.6A9.1 9.1 0 0170.9 0h314.4c4 0 6 4.8 3.2 7.6L326.1 70a9 9 0 01-6.3 2.6H5.4C1.4 72.6-.6 67.8 2.2 65L64.6 2.6z" fill="url(#b)"/>
            <path d="M326.1 119.7a9 9 0 00-6.3-2.6H5.4c-4 0-6 4.8-3.2 7.6l62.4 62.4a9 9 0 006.3 2.6h314.4c4 0 6-4.8 3.2-7.6l-62.4-62.4z" fill="url(#c)"/>
            <defs>
              <linearGradient id="a" x1="-7" y1="296" x2="381" y2="296" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
              <linearGradient id="b" x1="-7" y1="36" x2="381" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
              <linearGradient id="c" x1="-7" y1="155" x2="381" y2="155" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#9945FF"/><stop offset="1" stopColor="#14F195"/></linearGradient>
            </defs>
          </svg>
          <span style={{fontWeight:700, fontSize:'1rem', color:'#e2e8f0'}}>PoolForge</span>
          <span style={{fontSize:'0.7rem', background:'rgba(99,102,241,0.2)', color:'#818cf8', padding:'0.1rem 0.4rem', borderRadius:'4px'}}>SOL/USDC</span>
        </div>
        <WalletMultiButton style={{fontSize:'0.75rem', padding:'0.3rem 0.75rem', height:'auto'}} />
      </div>

      {/* PREIS + VOL - kompakt */}
      <div style={{display:'flex', gap:'0.5rem', padding:'0.6rem 1rem', flexShrink:0}}>
        {pool.solPrice && (
          <div style={{flex:1, background:'#1e293b', borderRadius:'0.75rem', padding:'0.6rem 0.75rem', border:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{fontSize:'0.65rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em'}}>SOL</div>
            <div style={{fontSize:'1.5rem', fontWeight:700, color:'#06b6d4'}}>\${pool.solPrice.toFixed(2)}</div>
          </div>
        )}
        {solVolume != null && (
          <div style={{flex:1, background:'#1e293b', borderRadius:'0.75rem', padding:'0.6rem 0.75rem', border:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{fontSize:'0.65rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em'}}>Vol 24h</div>
            <div style={{fontSize:'1.5rem', fontWeight:700, color:'#10b981'}}>
              \${solVolume>=1e9?(solVolume/1e9).toFixed(2)+'B':solVolume>=1e6?(solVolume/1e6).toFixed(1)+'M':solVolume.toFixed(0)}
            </div>
          </div>
        )}
        {wallet.connected && (
          <div style={{flex:1, background:'#1e293b', borderRadius:'0.75rem', padding:'0.6rem 0.75rem', border:'1px solid rgba(255,255,255,0.07)'}}>
            <div style={{fontSize:'0.65rem', color:'#64748b', marginBottom:'0.1rem'}}>SOL</div>
            <div style={{fontSize:'0.9rem', fontWeight:600, color:'#e2e8f0'}}>{pool.solBalance != null ? pool.solBalance.toFixed(3) : '—'}</div>
            <div style={{fontSize:'0.65rem', color:'#64748b', marginBottom:'0.1rem', marginTop:'0.2rem'}}>USDC</div>
            <div style={{fontSize:'0.9rem', fontWeight:600, color:'#e2e8f0'}}>{pool.usdcBalance != null ? pool.usdcBalance.toFixed(2) : '—'}</div>
          </div>
        )}
      </div>

      {/* TAB NAV */}
      <div style={{display:'flex', padding:'0 1rem', gap:'0.4rem', flexShrink:0}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:'0.5rem 0.25rem', borderRadius:'0.5rem', border:'none', cursor:'pointer', fontSize:'0.8rem', fontWeight: tab === t.id ? 700 : 400,
            background: tab === t.id ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
            color: tab === t.id ? '#818cf8' : '#64748b',
            transition:'all 0.2s'
          }}>{t.label}</button>
        ))}
      </div>

      {/* TAB CONTENT - scrollbar nur hier */}
      <div style={{flex:1, overflowY:'auto', padding:'0.75rem 1rem', paddingBottom:'1.5rem'}}>
        
        {/* POSITION TAB */}
        {tab === 'position' && (
          <div>
            {pool.error && <div style={{background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', borderRadius:'0.5rem', padding:'0.5rem', color:'#f87171', fontSize:'0.8rem', marginBottom:'0.5rem'}}>{pool.error}</div>}
            {pool.txStatus && <div style={{background:'rgba(99,102,241,0.1)', borderRadius:'0.5rem', padding:'0.5rem', color:'#818cf8', fontSize:'0.8rem', marginBottom:'0.5rem'}}>{pool.txStatus}</div>}
            
            {!wallet.connected && (
              <div style={{textAlign:'center', padding:'2rem 1rem'}}>
                <p style={{color:'#64748b', marginBottom:'1rem'}}>Wallet verbinden um loszulegen</p>
                <WalletMultiButton />
              </div>
            )}

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

            {wallet.connected && pool.positions.length === 0 && (
              <div style={{color:'#64748b', fontSize:'0.85rem', textAlign:'center', padding:'1rem'}}>Keine offenen Positionen</div>
            )}

            <ByrealDashboard />
          </div>
        )}

        {/* SWAP TAB */}
        {tab === 'swap' && (
          <SwapWidget solPrice={pool.solPrice} solBalance={pool.solBalance} usdcBalance={pool.usdcBalance} />
        )}

        {/* ALERT TAB */}
        {tab === 'alert' && (
          <div>
            <div style={{color:'#e2e8f0', fontWeight:600, marginBottom:'0.75rem', fontSize:'0.9rem'}}>Preis-Alert via ntfy</div>
            <p style={{color:'#64748b', fontSize:'0.8rem', marginBottom:'1rem'}}>Wähle eine Schwelle — du bekommst eine ntfy Notification wenn SOL sich um diesen Prozentsatz bewegt (auch wenn PC aus ist).</p>
            <PriceAlert solPrice={pool.solPrice} />
          </div>
        )}
      </div>

      {/* SWAP SUGGEST MODAL */}
      {swapSuggest && (
        <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}
          onClick={() => setSwapSuggest(null)}>
          <div style={{background:'#1e293b',borderRadius:'1rem',padding:'1.5rem',maxWidth:'340px',width:'90%',border:'1px solid rgba(99,102,241,0.4)',boxShadow:'0 0 40px rgba(99,102,241,0.2)'}}
            onClick={e => e.stopPropagation()}>
            <div style={{fontSize:'1.1rem',fontWeight:700,color:'#e2e8f0',marginBottom:'0.75rem'}}>💱 SOL → USDC</div>
            <div style={{color:'#94a3b8',fontSize:'0.9rem',marginBottom:'1.25rem'}}>
              Du hast <strong style={{color:'#06b6d4'}}>{swapSuggest} SOL</strong> über Minimum.<br/>Jetzt zu USDC tauschen?
            </div>
            <div style={{display:'flex',gap:'0.75rem'}}>
              <button onClick={() => setSwapSuggest(null)} style={{flex:1,padding:'0.6rem',borderRadius:'0.5rem',border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#64748b',cursor:'pointer'}}>Nein</button>
              <button onClick={async () => { setSwapSuggest(null); await pool.swapSolToUsdc(swapSuggest) }} style={{flex:1,padding:'0.6rem',borderRadius:'0.5rem',border:'none',background:'linear-gradient(135deg,#6366f1,#06b6d4)',color:'#fff',cursor:'pointer',fontWeight:600}}>Ja, swap!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
`

fs.writeFileSync('src/components/PoolDashboard.jsx', newDashboard)
console.log('✅ Mobile Tab-Layout geschrieben')