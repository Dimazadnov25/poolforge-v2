import{useState,useEffect}from'react'
import{useWallet,useConnection}from'@solana/wallet-adapter-react'
import{Transaction,PublicKey}from'@solana/web3.js'

const USDC_MINT=new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const ATA_PROG=new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bE1')
const TOKEN_PROG=new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

function getATA(owner){
  const[a]=PublicKey.findProgramAddressSync([owner.toBuffer(),TOKEN_PROG.toBuffer(),USDC_MINT.toBuffer()],ATA_PROG)
  return a
}

export default function LendDashboard(){
  const{publicKey,sendTransaction}=useWallet()
  const{connection}=useConnection()
  const[apy,setApy]=useState(null)
  const[balance,setBalance]=useState(0)
  const[walletUsdc,setWalletUsdc]=useState(0)
  const[amount,setAmount]=useState('')
  const[loading,setLoading]=useState(false)
  const[status,setStatus]=useState('')

  useEffect(()=>{fetchApy()},[])
  useEffect(()=>{if(publicKey){fetchBalance();fetchWalletUsdc()}},[publicKey])

  async function fetchApy(){
    try{const r=await fetch('/api/marginfi-lend?action=apy');const d=await r.json();setApy(d.apy)}
    catch{setApy(7.5)}
  }
  async function fetchBalance(){
    if(!publicKey)return
    try{const r=await fetch('/api/marginfi-lend?action=balance&wallet='+publicKey.toBase58());const d=await r.json();setBalance(d.balance||0)}
    catch{}
  }
  async function fetchWalletUsdc(){
    if(!publicKey)return
    try{
      const ata=getATA(publicKey)
      const info=await connection.getTokenAccountBalance(ata)
      setWalletUsdc(info.value.uiAmount||0)
    }catch{setWalletUsdc(0)}
  }
  async function doAction(action){
    if(!publicKey||!amount)return
    setLoading(true);setStatus('Transaktion wird vorbereitet...')
    try{
      const r=await fetch('/api/marginfi-lend',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,amount:parseFloat(amount),userPublicKey:publicKey.toBase58()})})
      const d=await r.json()
      if(d.error)throw new Error(d.error)
      const tx=Transaction.from(Buffer.from(d.transaction,'base64'))
      const sig=await sendTransaction(tx,connection)
      await connection.confirmTransaction(sig,'confirmed')
      setStatus('Erfolg! '+sig.slice(0,8)+'...')
      setAmount('')
      setTimeout(()=>{fetchBalance();fetchWalletUsdc();setStatus('')},3000)
    }catch(e){setStatus('Fehler: '+e.message)}
    setLoading(false)
  }

  const yearly=apy&&balance>0?(balance*(apy/100)).toFixed(2):'0.00'

  return(
    <div style={{background:'var(--card)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <span style={{fontSize:'1.1rem'}}>💵</span>
          <h3 style={{margin:0,fontSize:'0.95rem',fontWeight:'bold'}}>USDC Lend</h3>
          <span style={{fontSize:'0.7rem',color:'var(--muted)',background:'var(--surface)',padding:'0.1rem 0.4rem',borderRadius:'4px'}}>MarginFi</span>
        </div>
        <span style={{background:'rgba(0,200,100,0.15)',color:'#00c864',padding:'0.2rem 0.7rem',borderRadius:'20px',fontSize:'0.8rem',fontWeight:'bold'}}>
          {apy!=null?apy.toFixed(2)+'% APY':'...'}
        </span>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1rem'}}>
        <div style={{background:'var(--surface)',borderRadius:'8px',padding:'0.75rem',textAlign:'center'}}>
          <div style={{color:'var(--muted)',fontSize:'0.72rem',marginBottom:'0.3rem'}}>Eingezahlt</div>
          <div style={{fontWeight:'bold',fontSize:'1.05rem'}}>{balance.toFixed(2)} USDC</div>
        </div>
        <div style={{background:'var(--surface)',borderRadius:'8px',padding:'0.75rem',textAlign:'center'}}>
          <div style={{color:'var(--muted)',fontSize:'0.72rem',marginBottom:'0.3rem'}}>Jahresertrag</div>
          <div style={{fontWeight:'bold',fontSize:'1.05rem',color:'#00c864'}}>+{yearly} USDC</div>
        </div>
      </div>

      {publicKey&&walletUsdc>0&&(
        <div style={{fontSize:'0.75rem',color:'var(--muted)',marginBottom:'0.4rem'}}>
          Wallet: <span style={{color:'var(--text)',fontWeight:'bold'}}>{walletUsdc.toFixed(2)} USDC</span>
        </div>
      )}

      <div style={{display:'flex',gap:'0.5rem',marginBottom:'0.5rem'}}>
        <div style={{flex:1,position:'relative',display:'flex'}}>
          <input
            type="number"
            value={amount}
            onChange={e=>setAmount(e.target.value)}
            placeholder="USDC Betrag"
            disabled={loading||!publicKey}
            style={{flex:1,padding:'0.6rem 3.5rem 0.6rem 0.75rem',borderRadius:'8px',border:'1px solid var(--border)',background:'var(--surface)',color:'var(--text)',fontSize:'0.875rem',outline:'none',width:'100%'}}
          />
          <button
            onClick={()=>setAmount(walletUsdc.toFixed(6))}
            disabled={!publicKey||walletUsdc===0}
            style={{position:'absolute',right:'6px',top:'50%',transform:'translateY(-50%)',padding:'0.15rem 0.4rem',borderRadius:'4px',border:'1px solid #00c864',background:'transparent',color:'#00c864',fontWeight:'bold',cursor:'pointer',fontSize:'0.7rem'}}
          >MAX</button>
        </div>
        <button onClick={()=>doAction('deposit')} disabled={loading||!publicKey||!amount}
          style={{padding:'0.6rem 0.9rem',borderRadius:'8px',border:'none',background:'#00c864',color:'#000',fontWeight:'bold',cursor:'pointer',fontSize:'0.8rem',opacity:(loading||!publicKey||!amount)?0.5:1}}>
          Einzahlen
        </button>
        <button onClick={()=>doAction('withdraw')} disabled={loading||!publicKey||!amount}
          style={{padding:'0.6rem 0.9rem',borderRadius:'8px',border:'1px solid var(--border)',background:'transparent',color:'var(--text)',fontWeight:'bold',cursor:'pointer',fontSize:'0.8rem',opacity:(loading||!publicKey||!amount)?0.5:1}}>
          Abheben
        </button>
      </div>

      {status&&<div style={{fontSize:'0.78rem',marginTop:'0.25rem',color:status.startsWith('Fehler')?'#ff5555':'#00c864'}}>{status}</div>}
      {!publicKey&&<div style={{fontSize:'0.75rem',color:'var(--muted)',textAlign:'center',paddingTop:'0.25rem'}}>Wallet verbinden um zu lenden</div>}
    </div>
  )
}