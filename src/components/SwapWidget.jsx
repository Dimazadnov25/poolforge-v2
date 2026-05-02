import{useState}from"react"
import{useWallet,useConnection}from"@solana/wallet-adapter-react"
import{VersionedTransaction}from"@solana/web3.js"

const TOKENS=[
  {symbol:"SOL",mint:"So11111111111111111111111111111111111111112",decimals:9},
  {symbol:"USDC",mint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",decimals:6},
  {symbol:"jupSOL",mint:"jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v",decimals:9},
]

export default function SwapWidget({solBalance,usdcBalance}){
  const{publicKey,sendTransaction}=useWallet()
  const{connection}=useConnection()
  const[from,setFrom]=useState(0)
  const[to,setTo]=useState(1)
  const[amount,setAmount]=useState("")
  const[loading,setLoading]=useState(false)
  const[status,setStatus]=useState("")

  const fromToken=TOKENS[from]
  const toToken=TOKENS[to]

  async function doSwap(){
    if(!publicKey||!amount)return
    setLoading(true);setStatus("Wird vorbereitet...")
    try{
      const amountRaw=Math.floor(parseFloat(amount)*Math.pow(10,fromToken.decimals))
      const r=await fetch("/api/jupiter-stake",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({inputMint:fromToken.mint,outputMint:toToken.mint,amount:amountRaw,userPublicKey:publicKey.toBase58()})
      })
      const d=await r.json()
      if(d.error)throw new Error(d.error)
      const tx=VersionedTransaction.deserialize(Buffer.from(d.swapTransaction,"base64"))
      const sig=await sendTransaction(tx,connection)
      await connection.confirmTransaction(sig,"confirmed")
      setStatus("Erfolg! ✅")
      setAmount("")
      setTimeout(()=>setStatus(""),3000)
    }catch(e){setStatus("Fehler: "+e.message)}
    setLoading(false)
  }

  return(
    <div className="card" style={{marginTop:"1rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"1rem"}}>
        <span style={{fontSize:"1.1rem"}}>⚡</span>
        <h3 style={{margin:0}}>Swap</h3>
        <span style={{fontSize:"0.7rem",color:"var(--muted)",background:"var(--surface)",padding:"0.1rem 0.4rem",borderRadius:"4px"}}>Jupiter</span>
      </div>

      <div style={{display:"flex",gap:"0.5rem",marginBottom:"0.75rem"}}>
        <select value={from} onChange={e=>{setFrom(parseInt(e.target.value));setAmount("")}}
          style={{flex:1,padding:"0.5rem",borderRadius:"8px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:"0.9rem"}}>
          {TOKENS.map((t,i)=>i!==to&&<option key={i} value={i}>{t.symbol}</option>)}
        </select>
        <button onClick={()=>{const tmp=from;setFrom(to);setTo(tmp);setAmount("")}}
          style={{padding:"0.5rem 0.75rem",borderRadius:"8px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",cursor:"pointer",fontSize:"1rem"}}>⇄</button>
        <select value={to} onChange={e=>setTo(parseInt(e.target.value))}
          style={{flex:1,padding:"0.5rem",borderRadius:"8px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:"0.9rem"}}>
          {TOKENS.map((t,i)=>i!==from&&<option key={i} value={i}>{t.symbol}</option>)}
        </select>
      </div>

      <div style={{position:"relative",marginBottom:"0.75rem"}}>
        <input type="number" value={amount} onChange={e=>setAmount(e.target.value)}
          placeholder={"Betrag "+fromToken.symbol} disabled={loading||!publicKey}
          style={{width:"100%",padding:"0.6rem 3.5rem 0.6rem 0.75rem",borderRadius:"8px",border:"1px solid var(--border)",background:"var(--surface)",color:"var(--text)",fontSize:"0.9rem",boxSizing:"border-box"}}/>
        <button onClick={()=>{
          if(fromToken.symbol==="SOL")setAmount(Math.max(0,(solBalance||0)-0.01).toFixed(4))
          else if(fromToken.symbol==="USDC")setAmount((usdcBalance||0).toFixed(2))
        }} disabled={!publicKey}
          style={{position:"absolute",right:"8px",top:"50%",transform:"translateY(-50%)",padding:"0.15rem 0.4rem",borderRadius:"4px",border:"1px solid #00c864",background:"transparent",color:"#00c864",fontWeight:"bold",cursor:"pointer",fontSize:"0.7rem"}}>MAX</button>
      </div>

      <button onClick={doSwap} disabled={loading||!publicKey||!amount}
        style={{width:"100%",padding:"0.7rem",borderRadius:"8px",border:"none",background:(!publicKey||!amount||loading)?"var(--surface)":"#00c864",color:(!publicKey||!amount||loading)?"var(--muted)":"#000",fontWeight:"bold",cursor:"pointer",fontSize:"0.95rem",opacity:(!publicKey||!amount||loading)?0.5:1}}>
        {loading?"Swapping...":"Swap "+fromToken.symbol+" → "+toToken.symbol}
      </button>

      {status&&<div style={{marginTop:"0.5rem",fontSize:"0.8rem",textAlign:"center",color:status.startsWith("Fehler")?"#ef4444":"#00c864"}}>{status}</div>}
      {!publicKey&&<div style={{marginTop:"0.5rem",fontSize:"0.75rem",textAlign:"center",color:"var(--muted)"}}>Wallet verbinden um zu swappen</div>}
    </div>
  )
}