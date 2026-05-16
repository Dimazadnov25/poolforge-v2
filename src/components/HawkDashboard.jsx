import { useState, useEffect } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'

const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'
const HAWK_WALLET = 'ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy'
const DLMM_PROGRAM = 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

export default function HawkDashboard({ solPrice }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const conn = new Connection(RPC, 'confirmed')
        const accounts = await conn.getParsedTokenAccountsByOwner(
          new PublicKey(HAWK_WALLET),
          { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
        )
        let totalUsdc = 0
        let totalSolVal = 0
        for (const acc of accounts.value) {
          const info = acc.account.data.parsed?.info
          if (!info) continue
          const mint = info.mint
          const amt = info.tokenAmount?.uiAmount || 0
          if (mint === USDC_MINT) totalUsdc += amt
        }
        const solBal = await conn.getBalance(new PublicKey(HAWK_WALLET))
        totalSolVal = (solBal / 1e9) * (solPrice || 0)
        setData({ usdc: totalUsdc, solVal: totalSolVal, total: totalUsdc + totalSolVal })
      } catch(e) { console.error(e) }
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [solPrice])

  return (
    <a href="https://www.hawkfi.ag/dashboard" target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
      <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.75rem',border:'1px solid rgba(0,255,255,0.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.3rem'}}>
          <span style={{fontSize:'0.65rem',color:'#00ffff',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>HAWK</span>
          <span style={{fontSize:'0.6rem',color:'#444',fontFamily:'Share Tech Mono,monospace'}}>↗ dashboard</span>
        </div>
        {loading ? (
          <div style={{color:'#444',fontFamily:'Share Tech Mono,monospace',fontSize:'0.8rem'}}>laden...</div>
        ) : data ? (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.4rem'}}>
            <div>
              <div style={{fontSize:'0.6rem',color:'#888',fontFamily:'Share Tech Mono,monospace'}}>USDC</div>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>${data.usdc.toFixed(2)}</div>
            </div>
            <div>
              <div style={{fontSize:'0.6rem',color:'#888',fontFamily:'Share Tech Mono,monospace'}}>SOL WERT</div>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>${data.solVal.toFixed(2)}</div>
            </div>
          </div>
        ) : (
          <div style={{color:'#ff2244',fontFamily:'Share Tech Mono,monospace',fontSize:'0.8rem'}}>Fehler</div>
        )}
      </div>
    </a>
  )
}