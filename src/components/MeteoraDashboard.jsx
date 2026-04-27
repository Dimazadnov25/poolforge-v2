import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'

const POOL_ADDRESS = '5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6'
const API = 'https://poolforge-v2.vercel.app'

export default function MeteoraDashboard({ solPrice }) {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 60000)
    return () => clearInterval(interval)
  }, [])

  async function fetchStatus() {
    try {
      const r = await fetch(API + '/api/meteora-rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })
      const data = await r.json()
      setStatus(data)
    } catch(e) {
      console.error(e)
    }
  }

  async function setOperator() {
    if (!wallet.connected) return
    setLoading(true)
    setMsg('Operator wird gesetzt...')
    try {
      const r = await fetch(API + '/api/meteora-set-operator', { method: 'POST' })
      const { transaction } = await r.json()
      const tx = Transaction.from(Buffer.from(transaction, 'base64'))
      const signed = await wallet.signTransaction(tx)
      const sig = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(sig)
      setMsg('? Operator gesetzt! Auto-Rebalance aktiv!')
    } catch(e) {
      setMsg('? Fehler: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{background:'var(--surface)',borderRadius:'12px',padding:'1.5rem',marginBottom:'1rem'}}>
      <h3 style={{margin:'0 0 1rem',color:'var(--text)'}}>?? Meteora DLMM Position</h3>
      
      {status && (
        <div>
          <div style={{display:'flex',gap:'1rem',marginBottom:'1rem',flexWrap:'wrap'}}>
            <div style={{background: status.status === 'in_range' ? '#1a3a1a' : '#3a1a1a', padding:'0.75rem 1rem',borderRadius:'8px',flex:1}}>
              <div style={{fontSize:'0.75rem',color:'var(--muted)',marginBottom:'4px'}}>Status</div>
              <div style={{color: status.status === 'in_range' ? '#4ade80' : '#f87171', fontWeight:'bold'}}>
                {status.status === 'in_range' ? '? In Range' : '?? Out of Range'}
              </div>
            </div>
            <div style={{background:'var(--bg)',padding:'0.75rem 1rem',borderRadius:'8px',flex:1}}>
              <div style={{fontSize:'0.75rem',color:'var(--muted)',marginBottom:'4px'}}>Active Bin</div>
              <div style={{color:'var(--text)',fontWeight:'bold'}}>{status.activeBin}</div>
            </div>
            <div style={{background:'var(--bg)',padding:'0.75rem 1rem',borderRadius:'8px',flex:2}}>
              <div style={{fontSize:'0.75rem',color:'var(--muted)',marginBottom:'4px'}}>Range</div>
              <div style={{color:'var(--text)',fontWeight:'bold'}}>{status.position?.lower} ? {status.position?.upper}</div>
            </div>
          </div>

          {status.status === 'needs_rebalance' && (
            <div style={{background:'#3a1a1a',padding:'1rem',borderRadius:'8px',marginBottom:'1rem'}}>
              <p style={{color:'#f87171',margin:'0 0 0.5rem'}}>?? Position ist out of range!</p>
              <p style={{color:'var(--muted)',margin:0,fontSize:'0.85rem'}}>Neue Range wird: {status.activeBin - 4} ? {status.activeBin + 4}</p>
            </div>
          )}
        </div>
      )}

      <button
        onClick={setOperator}
        disabled={loading || !wallet.connected}
        style={{background:'linear-gradient(135deg,#9945FF,#14F195)',border:'none',borderRadius:'8px',padding:'0.75rem 1.5rem',color:'#fff',fontWeight:'bold',cursor:'pointer',width:'100%'}}
      >
        {loading ? 'Wird ausgeführt...' : '? Auto-Rebalance aktivieren (einmalig)'}
      </button>

      {msg && <p style={{color:'var(--muted)',marginTop:'0.5rem',fontSize:'0.85rem'}}>{msg}</p>}
    </div>
  )
}
