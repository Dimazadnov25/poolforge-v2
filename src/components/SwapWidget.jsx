import{useState}from"react"
import{useWallet,useConnection}from"@solana/wallet-adapter-react"
import{VersionedTransaction}from"@solana/web3.js"

export default function SwapWidget({solBalance,usdcBalance}){
  const{publicKey,sendTransaction}=useWallet()
  const{connection}=useConnection()
  const[loading,setLoading]=useState(false)
  const[status,setStatus]=useState("")

  const maxSol=Math.max(0,(solBalance||0)-0.01)

  async function doSwap(){
    if(!publicKey||maxSol<=0)return
    setLoading(true);setStatus("...")
    try{
      const amountRaw=Math.floor(maxSol*1e9)
      const r=await fetch("/api/jupiter-stake",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          inputMint:"So11111111111111111111111111111111111111112",
          outputMint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          amount:amountRaw,
          userPublicKey:publicKey.toBase58()
        })
      })
      const d=await r.json()
      if(d.error)throw new Error(d.error)
      const tx=VersionedTransaction.deserialize(Buffer.from(d.swapTransaction,"base64"))
      const sig=await sendTransaction(tx,connection)
      await connection.confirmTransaction(sig,"confirmed")
      setStatus("✅")
      setTimeout(()=>{setStatus("");window.location.reload()},2000)
    }catch(e){setStatus("❌")}
    setLoading(false)
  }

  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem",marginTop:"0.5rem"}}>
      <span style={{fontSize:"0.75rem",color:"#64748b",fontFamily:"Share Tech Mono,monospace"}}>SOL→USDC</span>
      <span style={{fontSize:"0.85rem",color:"#94a3b8",fontFamily:"Share Tech Mono,monospace"}}>{maxSol.toFixed(4)}</span>
      <button onClick={doSwap} disabled={loading||!publicKey||maxSol<=0} style={{
        padding:"0.3rem 0.8rem",borderRadius:"6px",border:"1px solid rgba(99,102,241,0.4)",
        background:"rgba(99,102,241,0.1)",color:"#818cf8",fontWeight:700,
        fontSize:"0.8rem",cursor:"pointer",fontFamily:"Share Tech Mono,monospace"
      }}>{loading?"...":"MAX SOL"}</button>
      {status&&<span style={{fontSize:"0.8rem"}}>{status}</span>}
    </div>
  )
}