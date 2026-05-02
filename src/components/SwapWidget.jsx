import{useEffect}from"react"

export default function SwapWidget({solPrice,solBalance,usdcBalance}){
  useEffect(()=>{
    if(window.Jupiter){
      window.Jupiter.init({
        displayMode:"integrated",
        integratedTargetId:"jupiter-terminal",
        endpoint:"https://api.mainnet-beta.solana.com",
        defaultExplorer:"Solscan",
        formProps:{
          initialInputMint:"So11111111111111111111111111111111111111112",
          initialOutputMint:"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        }
      })
    }
  },[])

  return(
    <div className="card" style={{marginTop:"1rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"1rem"}}>
        <span style={{fontSize:"1.1rem"}}>⚡</span>
        <h3 style={{margin:0}}>Swap</h3>
        <span style={{fontSize:"0.7rem",color:"var(--muted)",background:"var(--surface)",padding:"0.1rem 0.4rem",borderRadius:"4px"}}>Jupiter</span>
      </div>
      <div id="jupiter-terminal" style={{minHeight:"400px"}}/>
    </div>
  )
}