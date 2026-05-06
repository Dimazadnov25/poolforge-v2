const fs = require('fs')

// ============ 1. API ROUTE ============
const api = `import { Connection, PublicKey } from '@solana/web3.js'

const RPC = process.env.VITE_RPC_URL || 'https://api.mainnet-beta.solana.com'
const BYREAL = new PublicKey('REALQqNEomY6cQGZJUGwywTBD2UmDT32rZcNnfxQ5N2')
const TOKEN22 = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')

function tickToPrice(tick) {
  // SOL/USDC: 9 decimals SOL, 6 decimals USDC
  return Math.pow(1.0001, tick) * 1000
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { wallet } = req.query
  if (!wallet) return res.status(400).json({ error: 'wallet required' })

  try {
    const conn = new Connection(RPC, 'confirmed')
    const walletPk = new PublicKey(wallet)

    // Token-2022 Accounts holen (raw)
    const tokenAccounts = await conn.getTokenAccountsByOwner(walletPk, { programId: TOKEN22 })
    const positions = []

    for (const { account } of tokenAccounts.value) {
      const d = account.data
      const amount = d.readBigUInt64LE(64)
      if (amount !== 1n) continue

      const mint = new PublicKey(d.slice(0, 32))
      const [posPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('position'), mint.toBuffer()],
        BYREAL
      )
      const posInfo = await conn.getAccountInfo(posPda)
      if (!posInfo) continue

      const pd = posInfo.data
      const tickLower = pd.readInt32LE(73)
      const tickUpper = pd.readInt32LE(77)
      const liquidity = pd.readBigUInt64LE(80)

      // Pool Account aus Position ableiten (bytes 8-39 = pool pubkey)
      const poolPk = new PublicKey(pd.slice(8, 40))
      const poolInfo = await conn.getAccountInfo(poolPk)
      
      let currentTick = null
      let inRange = null
      if (poolInfo) {
        // currentTick aus Pool suchen (offset 912 aus unserer Analyse)
        currentTick = poolInfo.data.readInt32LE(912)
        inRange = currentTick >= tickLower && currentTick <= tickUpper
      }

      positions.push({
        positionPda: posPda.toBase58(),
        mint: mint.toBase58(),
        pool: poolPk.toBase58(),
        tickLower,
        tickUpper,
        liquidity: liquidity.toString(),
        priceLower: tickToPrice(tickLower).toFixed(2),
        priceUpper: tickToPrice(tickUpper).toFixed(2),
        currentTick,
        currentPrice: currentTick !== null ? tickToPrice(currentTick).toFixed(2) : null,
        inRange,
      })
    }

    res.json({ positions })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
`
fs.writeFileSync('api/byreal-positions.js', api)
console.log('✅ api/byreal-positions.js erstellt')

// ============ 2. KOMPONENTE ============
const comp = `import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export default function ByrealDashboard({ solPrice }) {
  const { publicKey } = useWallet()
  const [positions, setPositions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!publicKey) return
    const fetch_ = async () => {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch('/api/byreal-positions?wallet=' + publicKey.toBase58())
        const d = await r.json()
        if (d.error) throw new Error(d.error)
        setPositions(d.positions || [])
      } catch(e) { setError(e.message) }
      finally { setLoading(false) }
    }
    fetch_()
    const iv = setInterval(fetch_, 30000)
    return () => clearInterval(iv)
  }, [publicKey])

  if (!publicKey) return null

  return (
    <div style={{marginTop:'1.5rem', background:'var(--card-bg,#1e293b)', borderRadius:'1rem', padding:'1.25rem', border:'1px solid rgba(255,255,255,0.07)'}}>
      <div style={{display:'flex', alignItems:'center', gap:'0.6rem', marginBottom:'1rem'}}>
        <img src="https://www.byreal.io/favicon.ico" width="20" height="20" style={{borderRadius:'4px'}} onError={e=>e.target.style.display='none'} />
        <span style={{fontWeight:700, fontSize:'1rem', color:'#e2e8f0'}}>Byreal Positionen</span>
        {loading && <span style={{fontSize:'0.75rem', color:'#64748b', marginLeft:'auto'}}>⟳ lädt...</span>}
      </div>

      {error && <div style={{color:'#f87171', fontSize:'0.85rem'}}>{error}</div>}

      {!loading && positions.length === 0 && !error && (
        <div style={{color:'#64748b', fontSize:'0.85rem'}}>Keine Byreal Positionen gefunden</div>
      )}

      {positions.map((p, i) => (
        <div key={i} style={{
          background:'rgba(255,255,255,0.04)',
          borderRadius:'0.75rem',
          padding:'1rem',
          marginBottom:'0.75rem',
          border: p.inRange === true ? '1px solid rgba(16,185,129,0.3)' : p.inRange === false ? '1px solid rgba(248,113,113,0.3)' : '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.6rem'}}>
            <span style={{fontSize:'0.8rem', color:'#94a3b8', fontFamily:'monospace'}}>
              {p.positionPda.slice(0,6)}...{p.positionPda.slice(-4)}
            </span>
            <span style={{
              fontSize:'0.75rem', fontWeight:600, padding:'0.2rem 0.6rem', borderRadius:'999px',
              background: p.inRange === true ? 'rgba(16,185,129,0.15)' : p.inRange === false ? 'rgba(248,113,113,0.15)' : 'rgba(100,116,139,0.15)',
              color: p.inRange === true ? '#10b981' : p.inRange === false ? '#f87171' : '#64748b'
            }}>
              {p.inRange === true ? '✓ In Range' : p.inRange === false ? '✗ Out of Range' : '— unbekannt'}
            </span>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.5rem', fontSize:'0.82rem'}}>
            <div style={{textAlign:'center'}}>
              <div style={{color:'#64748b', fontSize:'0.7rem', marginBottom:'0.2rem'}}>Min Preis</div>
              <div style={{color:'#e2e8f0', fontWeight:600}}>\${p.priceLower}</div>
            </div>
            <div style={{textAlign:'center', borderLeft:'1px solid rgba(255,255,255,0.06)', borderRight:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{color:'#64748b', fontSize:'0.7rem', marginBottom:'0.2rem'}}>Aktuell</div>
              <div style={{color:'#06b6d4', fontWeight:700}}>\${p.currentPrice || '—'}</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{color:'#64748b', fontSize:'0.7rem', marginBottom:'0.2rem'}}>Max Preis</div>
              <div style={{color:'#e2e8f0', fontWeight:600}}>\${p.priceUpper}</div>
            </div>
          </div>

          <div style={{marginTop:'0.6rem', paddingTop:'0.6rem', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', justifyContent:'space-between', fontSize:'0.78rem', color:'#64748b'}}>
            <span>Ticks: {p.tickLower} / {p.tickUpper}</span>
            <a href={\`https://www.byreal.io/en/position/\${p.positionPda}\`} target="_blank" rel="noreferrer" style={{color:'#6366f1', textDecoration:'none'}}>↗ Byreal</a>
          </div>
        </div>
      ))}
    </div>
  )
}
`
fs.writeFileSync('src/components/ByrealDashboard.jsx', comp)
console.log('✅ src/components/ByrealDashboard.jsx erstellt')

// ============ 3. IN POOLDASHBOARD EINBAUEN ============
let pd = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

if (!pd.includes('ByrealDashboard')) {
  pd = pd.replace(
    "import LendDashboard from './LendDashboard'",
    "import LendDashboard from './LendDashboard'\nimport ByrealDashboard from './ByrealDashboard'"
  )
  // Nach MeteoraDashboard einbauen
  pd = pd.replace(
    /<MeteoraDashboard solPrice={pool\.solPrice}[^/]*\/>/,
    m => m + '\n            <ByrealDashboard solPrice={pool.solPrice} />'
  )
  fs.writeFileSync('src/components/PoolDashboard.jsx', pd)
  console.log('✅ ByrealDashboard in PoolDashboard eingebaut')
} else {
  console.log('ℹ️ ByrealDashboard bereits vorhanden')
}