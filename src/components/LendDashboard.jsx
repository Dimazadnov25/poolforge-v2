import{useState,useEffect}from'react'
import{useWallet,useConnection,useAnchorWallet}from'@solana/wallet-adapter-react'
import{MarginfiClient,getConfig}from'@mrgnlabs/marginfi-client-v2'

export default function LendDashboard({usdcBalance=0}){
  const{publicKey}=useWallet()
  const anchorWallet=useAnchorWallet()
  const{connection}=useConnection()
  const[apy,setApy]=useState(7.5)
  const[balance,setBalance]=useState(0)
  const[amount,setAmount]=useState('')
  const[loading,setLoading]=useState(false)
  const[status,setStatus]=useState('')
  const[client,setClient]=useState(null)
  const[mfAccount,setMfAccount]=useState(null)

  useEffect(()=>{fetchApy()},[])
  useEffect(()=>{if(anchorWallet&&publicKey)initClient()},[anchorWallet?.publicKey?.toBase58()])

  async function fetchApy(){
    try{const r=await fetch('/api/marginfi-lend?action=apy');const d=await r.json();if(d.apy)setApy(parseFloat(d.apy))}catch{}
  }

  async function initClient(){
    try{
      const config=getConfig('production')
      const opts={commitment:'confirmed',skipPreflight:false}
      const mfClient=await MarginfiClient.fetch(config,anchorWallet,connection,opts)
      setClient(mfClient)
      const bank=mfClient.getBankByTokenSymbol('USDC')
      if(!bank){console.warn('USDC bank not found');return}
      const accounts=await mfClient.getMarginfiAccountsForAuthority(publicKey)
      if(accounts?.length>0){
        setMfAccount(accounts[0])
        const bal=accounts[0].activeBalances.find(b=>b.bankPk.equals(bank.address))
        if(bal){
          const{assets}=bal.computeQuantityUi(bank)
          setBalance(assets.toNumber())
        }
      }
    }catch(e){
      console.error('MarginFi init:',e)
      // Retry mit anderem commitment
      try{
        const config=getConfig('production')
        const mfClient=await MarginfiClient.fetch(config,anchorWallet,connection,{commitment:'finalized'})
        setClient(mfClient)
      }catch(e2){console.error('MarginFi retry failed:',e2.message)}
    }
  }

  async function doAction(action){
    if(!publicKey||!amount||!client)return
    setLoading(true);setStatus('Wird vorbereitet...')
    try{
      const bank=client.getBankByTokenSymbol('USDC')
      if(!bank)throw new Error('USDC Bank nicht gefunden')
      let acc=mfAccount
      if(!acc){
        setStatus('Erstelle MarginFi Account...')
        acc=await client.createMarginfiAccount()
        setMfAccount(acc)
      }
      if(action==='deposit'){
        setStatus('Einzahlen...')
        await acc.deposit(parseFloat(amount),bank.address)
      }else{
        setStatus('Abheben...')
        await acc.withdraw(parseFloat(amount),bank.address)
      }
      setStatus('Erfolg!')
      setAmount('')
      setTimeout(()=>{initClient();setStatus('')},3000)
    }catch(e){setStatus('Fehler: '+e.message)}
    setLoading(false)
  }

  const yearly=apy&&balance>0?(balance*(apy/100)).toFixed(2):'0.00'
  const btnActive=!loading&&!!publicKey&&!!amount&&!!client

  return(
    <div style={{background:'var(--card)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
        <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}>
          <span style={{fontSize:'1.1rem'}}>💵</span>
          <h3 style={{margin:0,fontSize:'0.95rem',fontWeight:'bold'}}>USDC Lend</h3>
          <span style={{fontSize:'0.7rem',color:'var(--muted)',background:'var(--surface)',padding:'0.1rem 0.4rem',borderRadius:'4px'}}>MarginFi</span>
        </div>
        <span style={{background:'rgba(0,200,100,0.15)',color:'#00c864',padding:'0.2rem 0.7rem',borderRadius:'20px',fontSize:'0.8rem',fontWeight:'bold'}}>
          {apy.toFixed(2)}% APY
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
        <button onClick={()=>doAction('withdraw')} disabled={!btnActive}
          style={{padding:'0.6rem 0.9rem',borderRadius:'8px',border:'1px solid var(--border)',background:'transparent',color:'var(--text)',fontWeight:'bold',cursor:'pointer',fontSize:'0.8rem',opacity:!btnActive?0.5:1}}>
          Abheben
        </button>
      </div>
      {status&&<div style={{fontSize:'0.78rem',marginTop:'0.25rem',color:status.startsWith('Fehler')?'#ff5555':'#00c864'}}>{status}</div>}
      {!publicKey&&<div style={{fontSize:'0.75rem',color:'var(--muted)',textAlign:'center',paddingTop:'0.25rem'}}>Wallet verbinden um zu lenden</div>}
      {publicKey&&!client&&<div style={{fontSize:'0.72rem',color:'var(--muted)',textAlign:'center',paddingTop:'0.25rem'}}>MarginFi wird geladen...</div>}
    </div>
  )
}