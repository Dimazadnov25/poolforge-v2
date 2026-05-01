import{useState,useEffect}from"react"
import{useConnection}from"@solana/wallet-adapter-react"
import{Connection,PublicKey}from"@solana/web3.js"

const POOL=new PublicKey("5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6")
const POS=new PublicKey("2pLfC12zAeZD1CCE7q4ksxwj84h4kuZP2W5dM1u8Cgtt")

export default function MeteoraDashboard({solPrice}){
  const{connection}=useConnection()
  const[data,setData]=useState(null)

  useEffect(()=>{fetchData();const t=setInterval(fetchData,30000);return()=>clearInterval(t)},[])

  async function fetchData(){
    try{
      const[pool,pos]=await Promise.all([connection.getAccountInfo(POOL),connection.getAccountInfo(POS)])
      if(!pool||!pos)return
      const activeBin=pool.data.readInt32LE(48)
      const lowerBin=pos.data.readInt32LE(7912)
      const upperBin=pos.data.readInt32LE(7916)
      const inRange=activeBin>=lowerBin&&activeBin<=upperBin
      const totalBins=upperBin-lowerBin
      const binsToLower=activeBin-lowerBin
      const binsToUpper=upperBin-activeBin
      setData({activeBin,lowerBin,upperBin,inRange,binsToLower,binsToUpper,totalBins})
    }catch(e){console.error("Meteora:",e.message)}
  }

  if(!data)return(
    <div style={{background:"var(--card)",borderRadius:"12px",padding:"1.25rem",marginBottom:"1rem",color:"var(--muted)",fontSize:"0.85rem"}}>
      🌊 Meteora wird geladen...
    </div>
  )

  const pctLower=(data.binsToLower/data.totalBins*100).toFixed(1)
  const pctUpper=(data.binsToUpper/data.totalBins*100).toFixed(1)

  return(
    <div style={{background:"var(--card)",borderRadius:"12px",padding:"1.25rem",marginBottom:"1rem"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
        <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
          <span style={{fontSize:"1.1rem"}}>🌊</span>
          <h3 style={{margin:0,fontSize:"0.95rem",fontWeight:"bold"}}>Meteora DLMM</h3>
          <span style={{fontSize:"0.7rem",color:"var(--muted)",background:"var(--surface)",padding:"0.1rem 0.4rem",borderRadius:"4px"}}>SOL-USDC</span>
        </div>
        <span style={{padding:"0.2rem 0.7rem",borderRadius:"20px",fontSize:"0.8rem",fontWeight:"bold",background:data.inRange?"rgba(0,200,100,0.15)":"rgba(239,68,68,0.15)",color:data.inRange?"#00c864":"#ef4444"}}>
          {data.inRange?"✅ In Range":"🚨 Out of Range"}
        </span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.75rem",marginBottom:"0.75rem"}}>
        <div style={{background:"var(--surface)",borderRadius:"8px",padding:"0.75rem",textAlign:"center"}}>
          <div style={{color:"var(--muted)",fontSize:"0.7rem",marginBottom:"0.25rem"}}>Active Bin</div>
          <div style={{fontWeight:"bold",fontSize:"1rem"}}>{data.activeBin}</div>
        </div>
        <div style={{background:"var(--surface)",borderRadius:"8px",padding:"0.75rem",textAlign:"center"}}>
          <div style={{color:"var(--muted)",fontSize:"0.7rem",marginBottom:"0.25rem"}}>Bis Untergrenze</div>
          <div style={{fontWeight:"bold",fontSize:"1rem",color:data.binsToLower<5?"#ef4444":"var(--text)"}}>{data.binsToLower} Bins ({pctLower}%)</div>
        </div>
        <div style={{background:"var(--surface)",borderRadius:"8px",padding:"0.75rem",textAlign:"center"}}>
          <div style={{color:"var(--muted)",fontSize:"0.7rem",marginBottom:"0.25rem"}}>Bis Obergrenze</div>
          <div style={{fontWeight:"bold",fontSize:"1rem",color:data.binsToUpper<5?"#ef4444":"var(--text)"}}>{data.binsToUpper} Bins ({pctUpper}%)</div>
        </div>
      </div>
      <div style={{background:"var(--surface)",borderRadius:"8px",padding:"0.5rem 0.75rem",fontSize:"0.75rem",color:"var(--muted)",textAlign:"center"}}>
        Range: <span style={{color:"var(--text)",fontWeight:"bold"}}>{data.lowerBin}</span> → <span style={{color:"var(--text)",fontWeight:"bold"}}>{data.upperBin}</span> ({data.totalBins} Bins)
      </div>
    </div>
  )
}