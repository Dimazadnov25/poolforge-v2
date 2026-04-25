import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'

const JUPSOL_MINT = 'jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v'
const JUPSOL_APY = 6.4

async function getATA(mint, owner) {
  const { PublicKey: PK } = await import('@solana/web3.js')
  const ASSOC = new PK('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
  const TOKEN = new PK('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
  const [ata] = PK.findProgramAddressSync(
    [owner.toBuffer(), TOKEN.toBuffer(), mint.toBuffer()],
    ASSOC
  )
  return ata
}

export default function StakeDashboard({ solPrice }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [jupsolBalance, setJupsolBalance] = useState(null)
  const [jupsolPrice, setJupsolPrice] = useState(null)
  const [solAmount, setSolAmount] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchJupsolPrice = async () => {
      try {
        const r = await fetch('https://api.jup.ag/price/v2?ids=jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v')
        const d = await r.json()
        const price = d?.data?.['jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v']?.price
        if (price) setJupsolPrice(parseFloat(price))
      } catch (e) {}
    }
    fetchJupsolPrice()
    const interval = setInterval(fetchJupsolPrice, 30000)
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

  const handleStake = async () => {
    if (!solAmount) return
    const amountLamports = Math.floor(parseFloat(solAmount) * 1e9)
    window.open(
      `https://jup.ag/swap/SOL-jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v?inAmount=${amountLamports}`,
      '_blank'
    )
  }

  const handleUnstake = async () => {
    if (!solAmount) return
    const amountLamports = Math.floor(parseFloat(solAmount) * 1e9)
    window.open(
      `https://jup.ag/swap/jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v-SOL?inAmount=${amountLamports}`,
      '_blank'
    )
  }

  const jupsolValueUSD = jupsolBalance && jupsolPrice ? jupsolBalance * jupsolPrice : 0
  const yearlyYield = jupsolValueUSD * (JUPSOL_APY / 100)

  return (
    <div className="card" style={{marginTop:'1rem'}}>
      <h3 style={{marginBottom:'1rem', color:'var(--text)'}}>SOL Staking</h3>

      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'1rem', background:'var(--surface)', borderRadius:'12px', padding:'1rem'}}>
        <div>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>jupSOL Balance</div>
          <div style={{color:'var(--green)', fontWeight:'bold', fontSize:'1.5rem'}}>{jupsolBalance != null ? jupsolBalance.toFixed(4) : '—'}</div>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>${jupsolValueUSD.toFixed(2)} USD</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>APY</div>
          <div style={{color:'#06b6d4', fontWeight:'bold', fontSize:'1.5rem'}}>{JUPSOL_APY}%</div>
          <div style={{color:'var(--muted)', fontSize:'0.75rem'}}>~${yearlyYield.toFixed(2)}/year</div>
        </div>
      </div>

      {jupsolPrice && (
        <div style={{marginBottom:'1rem', color:'var(--muted)', fontSize:'0.8rem', textAlign:'center'}}>
          1 jupSOL = ${jupsolPrice.toFixed(4)}
        </div>
      )}

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

      <div style={{display:'flex', gap:'0.5rem'}}>
        <button className="btn btn-blue" onClick={handleStake} style={{flex:1}} disabled={!solAmount}>
          SOL → jupSOL
        </button>
        <button className="btn btn-secondary" onClick={handleUnstake} style={{flex:1}} disabled={!solAmount}>
          jupSOL → SOL
        </button>
      </div>

      <div style={{marginTop:'0.75rem', color:'var(--muted)', fontSize:'0.7rem', textAlign:'center'}}>
        Swap via Jupiter • Kein Private Key • Alles über Phantom
      </div>
    </div>
  )
}