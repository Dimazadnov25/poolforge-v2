import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction } from '@solana/web3.js'

const MARGINFI_PROGRAM = new PublicKey('MFv2hWf31Z9kbCa1snEPdcgp7NQijNiKBBCBJSP5SBe')
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

export default function LendDashboard({ pool }) {
  const [apy, setApy] = useState(null)
  const [depositedUsdc, setDepositedUsdc] = useState(0)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [pnl, setPnl] = useState(null)
  const { connection } = useConnection()
  const wallet = useWallet()

  useEffect(() => {
    fetchApy()
  }, [])

  const fetchApy = async () => {
    try {
      const resp = await fetch('https://app.marginfi.com/api/banks')
      const data = await resp.json()
      const usdc = data?.find?.(b => b.mint === USDC_MINT || b.tokenSymbol === 'USDC')
      if (usdc) setApy((usdc.lendingRate * 100).toFixed(2))
    } catch (e) {
      setApy('~5.2')
    }
  }

  const handleDeposit = async () => {
    if (!wallet?.publicKey || !amount) return
    try {
      setLoading(true)
      const resp = await fetch('/api/marginfi-lend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          amount: parseFloat(amount),
          userPublicKey: wallet.publicKey.toBase58()
        })
      })
      const data = await resp.json()
      if (data.error) throw new Error(data.error)
      const tx = Transaction.from(Buffer.from(data.transaction, 'base64'))
      const signed = await wallet.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      const latest = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature: sig, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight }, 'confirmed')
      setAmount('')
      alert('USDC erfolgreich eingezahlt!')
      setTimeout(() => window.location.reload(), 2000)
    } catch (e) {
      alert('Fehler: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!wallet?.publicKey || !amount) return
    try {
      setLoading(true)
      const resp = await fetch('/api/marginfi-lend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdraw',
          amount: parseFloat(amount),
          userPublicKey: wallet.publicKey.toBase58()
        })
      })
      const data = await resp.json()
      if (data.error) throw new Error(data.error)
      const tx = Transaction.from(Buffer.from(data.transaction, 'base64'))
      const signed = await wallet.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      const latest = await connection.getLatestBlockhash()
      await connection.confirmTransaction({ signature: sig, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight }, 'confirmed')
      setAmount('')
      alert('USDC erfolgreich abgehoben!')
      setTimeout(() => window.location.reload(), 2000)
    } catch (e) {
      alert('Fehler: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{marginTop:'1rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.75rem'}}>
        <h3 style={{margin:0}}>USDC Lend</h3>
        <span style={{fontSize:'0.75rem',padding:'0.2rem 0.5rem',borderRadius:'999px',background:'rgba(34,197,94,0.2)',color:'#22c55e'}}>MarginFi</span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.5rem',marginBottom:'0.75rem'}}>
        <div style={{background:'var(--surface)',borderRadius:'8px',padding:'0.5rem'}}>
          <div style={{color:'var(--muted)',fontSize:'0.75rem'}}>APY</div>
          <div style={{color:'#22c55e',fontWeight:'bold',fontSize:'1.1rem'}}>{apy ? `${apy}%` : '...'}</div>
        </div>
        <div style={{background:'var(--surface)',borderRadius:'8px',padding:'0.5rem'}}>
          <div style={{color:'var(--muted)',fontSize:'0.75rem'}}>USDC Wallet</div>
          <div style={{color:'var(--text)',fontWeight:'bold'}}>{(pool?.usdcBalance||0).toFixed(2)}</div>
        </div>
      </div>

      <div style={{marginBottom:'0.5rem'}}>
        <div style={{display:'flex',gap:'0.5rem',alignItems:'center',marginBottom:'0.25rem'}}>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="USDC Betrag"
            style={{flex:1,padding:'0.3rem',borderRadius:'6px',border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)'}}
          />
          <button type="button" onClick={() => setAmount((pool?.usdcBalance||0).toFixed(2))}
            style={{padding:'0.2rem 0.4rem',borderRadius:'6px',border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)',cursor:'pointer',fontSize:'0.7rem'}}>MAX</button>
        </div>
        <div style={{display:'flex',gap:'0.5rem'}}>
          <button type="button" className="btn btn-blue" style={{flex:1}} onClick={handleDeposit} disabled={loading||!amount}>
            {loading ? '...' : 'Einzahlen'}
          </button>
          <button type="button" className="btn btn-yellow" style={{flex:1}} onClick={handleWithdraw} disabled={loading||!amount}>
            {loading ? '...' : 'Abheben'}
          </button>
        </div>
      </div>

      <div style={{fontSize:'0.7rem',color:'var(--muted)',textAlign:'center'}}>
        Zinsen werden automatisch akkumuliert
      </div>
    </div>
  )
}