import{useState,useEffect}from'react'
import{useWallet,useConnection}from'@solana/wallet-adapter-react'
import{Transaction,VersionedTransaction}from'@solana/web3.js'

export default function LendDashboard({usdcBalance=0}){
  const{publicKey,sendTransaction}=useWallet()
  const{connection}=useConnection()
  const[rate,setRate]=useState(1)
  const[supplyRate,setSupplyRate]=useState(0)
  const[jlBalance,setJlBalance]=useState(0)
  const[amount,setAmount]=useState('')
  const[loading,setLoading]=useState(false)
  const[status,setStatus]=useState('')

  useEffect(()=>{fetchRate()},[])
  useEffect(()=>{if(publicKey)fetchBalance();const t=setInterval(()=>{if(publicKey)fetchBalance()},5000);return()=>clearInterval(t)},[publicKey?.toBase58()])

  async function fetchRate(){
    try{
      const r=await fetch('/api/marginfi-lend?action=apy')
      const d=await r.json()
      if(d.rate)setRate(d.rate)
      if(d.supplyRate)setSupplyRate(d.supplyRate)
    }catch{}
  }

  async function fetchBalance(){
    if(!publicKey)return
    try{
      const r=await fetch('/api/marginfi-lend?action=balance&wallet='+publicKey.toBase58())
      const d=await r.json()
      setJlBalance(d.balance||0)
    }catch{setJlBalance(0)}
  }

  async function doAction(action){
    if(!publicKey||!amount)return
    setLoading(true);setStatus('Wird vorbereitet...')
    try{
      const r=await fetch('/api/marginfi-lend',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action,amount:parseFloat(amount),userPublicKey:publicKey.toBase58()})
      })
      const d=await r.json()
      if(d.error)throw new Error(d.error)
      const txData=d.transaction||d.tx
      if(!txData)throw new Error('Keine Transaktion erhalten')
      const buf=Buffer.from(txData,'base64')
      let tx
      try{tx=VersionedTransaction.deserialize(buf)}catch{tx=Transaction.from(buf)}
      const sig=await sendTransaction(tx,connection)
      await connection.confirmTransaction(sig,'confirmed')
      setStatus('Erfolg!')
      setAmount('')
      setTimeout(()=>{fetchBalance();fetchRate();setStatus('')},3000)
    }catch(e){setStatus('Fehler: '+e.message)}
    setLoading(false)
  }

  // jlUSDC * rate = aktueller USDC Wert
  const currentValue=jlBalance*rate
  // Zuwachs seit Launch in %
  const growth=((rate-1)*100).toFixed(3)
  // Jahresertrag
  const yearly=(currentValue*(supplyRate/100)).toFixed(2)
  const btnActive=!loading&&!!publicKey&&!!amount

  return(
    <div style={{background:'var(--card)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <span style={{fontSize:'1.1rem'}}>💵</span>
          <h3 style={{margin:0,fontSize:'0.95rem',fontWeight:'bold'}}>USDC Lend</h3>
          <span style={{fontSize:'0.7rem',color:'var(--muted)',background:'var(--surface)',padding:'0.1rem 0.4rem',borderRadius:'4px'}}>Jupiter</span>
        </div>
        <span style={{background:'rgba(0,200,100,0.15)',color:'#00c864',padding:'0.2rem 0.7rem',borderRadius:'20px',fontSize:'0.8rem',fontWeight:'bold'}}>
          +{growth}% Zuwachs
        </span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1rem'}}>
        <div style={{background:'var(--surface)',borderRadius:'8px',padding:'0.75rem',textAlign:'center'}}>
          <div style={{color:'var(--muted)',fontSize:'0.72rem',marginBottom:'0.3rem'}}>Eingezahlt</div>
          <div style={{fontWeight:'bold',fontSize:'1.05rem'}}>{currentValue.toFixed(6)} USDC</div>
          <div style={{color:'var(--muted)',fontSize:'0.68rem'}}>{jlBalance.toFixed(6)} jlUSDC</div>
        </div>
        <div style={{background:'var(--surface)',borderRadius:'8px',padding:'0.75rem',textAlign:'center'}}>
          <div style={{color:'var(--muted)',fontSize:'0.72rem',marginBottom:'0.3rem'}}>Jahresertrag</div>
          <div style={{fontWeight:'bold',fontSize:'1.05rem',color:'#00c864'}}>+{yearly} USDC</div>
          <div style={{color:'var(--muted)',fontSize:'0.68rem'}}>{supplyRate.toFixed(2)}% p.a.</div>
        </div>
      </div>
      {publicKey&&usdcBalance>0&&(
        <div style={{fontSize:'0.75rem',color:'var(--muted)',marginBottom:'0.4rem'}}>
          Wallet: <span style={{color:'var(--text)',fontWeight:'bold'}}>{usdcBalance.toFixed(2)} USDC</span>
        </div>
      )}
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem'}}>
        <div style={{flex:1,position:'relative',display:'flex'}}>
          <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
            placeholder="USDC Betrag" disabled={loading||!publicKey}
            style={{flex:1,padding:'0.6rem 3.5rem 0.6rem 0.75rem',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)',fontSize:'0.875rem',outline:'none',width:'100%'}}/>
          <button onClick={()=>setAmount(usdcBalance.toFixed(6))} disabled={!publicKey||usdcBalance===0}
            style={{position:'absolute',right:'6px',top:'50%',transform:'translateY(-50%)',padding:'0.15rem 0.4rem',borderRadius:'4px',border:'1px solid #00c864',background:'transparent',color:'#00c864',fontWeight:'bold',cursor:'pointer',fontSize:'0.7rem'}}>MAX</button>
        </div>
        <button onClick={()=>doAction('deposit')} disabled={!btnActive}
          style={{padding:'0.6rem 0.9rem',borderRadius:'8px',border:'none',background:'#00c864',color:'#000',fontWeight:'bold',cursor:'pointer',fontSize:'0.8rem',opacity:!btnActive?0.5:1}}>
          Einzahlen
        </button>
        <button onClick={()=>{setAmount(jlBalance.toFixed(6))}} disabled={!publicKey||jlBalance===0}
          style={{padding:'0.6rem 0.5rem',borderRadius:'8px',border:'1px solid #f59e0b',background:'transparent',color:'#f59e0b',fontWeight:'bold',cursor:'pointer',fontSize:'0.75rem',whiteSpace:'nowrap',opacity:(!publicKey||jlBalance===0)?0.5:1}}>
          MAX↑
        </button>
        <button onClick={()=>doAction('withdraw')} disabled={!btnActive}
          style={{padding:'0.6rem 0.9rem',borderRadius:'8px',border:'1px solid var(--border)',background:'transparent',color:'var(--text)',fontWeight:'bold',cursor:'pointer',fontSize:'0.8rem',opacity:!btnActive?0.5:1}}>
          Abheben
        </button>
      </div>
      {status&&<div style={{fontSize:'0.78rem',marginTop:'0.25rem',color:status.startsWith('Fehler')?'#ff5555':'#00c864'}}>{status}</div>}
      {!publicKey&&<div style={{fontSize:'0.75rem',color:'var(--muted)',textAlign:'center',paddingTop:'0.25rem'}}>Wallet verbinden um zu lenden</div>}
    </div>
  )
}

