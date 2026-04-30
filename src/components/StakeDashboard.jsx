import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

const JUPSOL_MINT = 'jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v'
const JUPSOL_APY = 6.4

async function getATA(mint, owner) {
  const ASSOC = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  const TOKEN = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN.toBuffer(), mint.toBuffer()],
    ASSOC
  )
  return ata
}

export default function StakeDashboard({ solPrice, solBalance }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [jupsolBalance, setJupsolBalance] = useState(null)
  const [jupsolPrice, setJupsolPrice] = useState(null)
  const [solAmount, setSolAmount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const r = await fetch('/api/jupsol-price')
        const d = await r.json()
        if (d.solPerJupsol) setJupsolPrice(d.solPerJupsol)
      } catch (e) {}
    }
    fetchPrice()
    const interval = setInterval(fetchPrice, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet?.publicKey || !connection) return
      try {
        const mint = new PublicKey(JUPSOL_MINT)
        const ata = await getATA(mint, wallet.publicKey)
        const info = await connection.getParsedAccountInfo(ata)
        const bal = info?.value?.data?.parsed?.info?.tokenAmount?.uiAmount || 0
        setJupsolBalance(bal)
      } catch (e) { setJupsolBalance(0) }
    }
    fetchBalance()
    const interval = setInterval(fetchBalance, 15000)
    return () => clearInterval(interval)
  }, [wallet?.publicKey, connection])

  const doSwap = async (inputMint, outputMint) => {
    if (!solAmount || !wallet?.publicKey) return
    try {
      setLoading(true)
      const amountLamports = Math.floor(parseFloat(solAmount) * 1e9)
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
      setSolAmount('')
    } catch (e) {
      alert('Fehler: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleStake = () => doSwap('So11111111111111111111111111111111111111112', 'jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v')
  const handleUnstake = () => doSwap('jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v', 'So11111111111111111111111111111111111111112')

  const jupsolValueSOL = jupsolBalance && jupsolPrice ? jupsolBalance * jupsolPrice : 0
  const jupsolValueUSD = jupsolValueSOL && solPrice ? jupsolValueSOL * solPrice : 0
  const yearlyYield = jupsolValueUSD * (JUPSOL_APY / 100)

  return (
    <div className="card" style={{marginTop:'1rem'}}>
      <h3 style={{marginBottom:'1rem', color:'var(--text)'}}>SOL Staking</h3>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem', background:'var(--surface)', borderRadius:'12px', padding:'1rem'}}>
        <div>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>Staked SOL</div>
          <div style={{color:'var(--green)', fontWeight:'bold', fontSize:'1.5rem'}}>{jupsolValueSOL > 0 ? jupsolValueSOL.toFixed(10) : '—'} SOL</div>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>${jupsolValueUSD.toFixed(4)} USD</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>SOL 24h</div>
          <div style={{color: solPrice > 82 ? 'var(--green)' : '#f87171', fontWeight:'bold', fontSize:'1.5rem'}}>{solPrice ? (((solPrice - 82) / 82) * 100).toFixed(2) : '—'}%</div>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>${jupsolValueUSD.toFixed(2)} Wert</div>
        </div>
      </div>
      {jupsolPrice && (
        <div style={{marginBottom:'1rem', color:'var(--muted)', fontSize:'0.8rem', textAlign:'center'}}>
          1 jupSOL = ${jupsolPrice.toFixed(4)}
        </div>
      )}
      <div style={{marginBottom:'1rem'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.25rem'}}>
          <div style={{color:'var(--muted)',fontSize:'0.75rem'}}>SOL Amount</div>
          <div style={{display:'flex',gap:'0.4rem'}}>
            <button onClick={()=>setSolAmount(Math.max(0,(solBalance||0)-0.01).toFixed(4))} style={{padding:'0.2rem 0.4rem',borderRadius:'6px',border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)',cursor:'pointer',fontSize:'0.7rem'}}>MAX SOL</button>
            <button onClick={()=>setSolAmount(jupsolBalance>0?jupsolBalance.toFixed(6):'0')} disabled={!jupsolBalance} style={{padding:'0.2rem 0.4rem',borderRadius:'6px',border:'1px solid #f59e0b',background:'transparent',color:'#f59e0b',cursor:'pointer',fontSize:'0.7rem',opacity:jupsolBalance>0?1:0.5}}>MAX jupSOL</button>
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
      <div style={{display:'flex', gap:'0.5rem'}}>
        <button className="btn btn-blue" onClick={handleStake} style={{flex:1}} disabled={loading || !solAmount}>
          {loading ? '...' : 'SOL → jupSOL'}
        </button>
        <button className="btn btn-secondary" onClick={handleUnstake} style={{flex:1}} disabled={loading || !solAmount}>
          {loading ? '...' : 'jupSOL → SOL'}
        </button>
      </div>
      <div style={{marginTop:'0.75rem', color:'var(--muted)', fontSize:'0.7rem', textAlign:'center'}}>
        Kein Private Key • Alles über Phantom
      </div>
    </div>
  )
}