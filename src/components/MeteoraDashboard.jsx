import{useState,useEffect}from"react"
import{useConnection}from"@solana/wallet-adapter-react"
import{PublicKey}from"@solana/web3.js"

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
      const pct=totalBins>0?(binsToLower/totalBins*100):50
      setData({activeBin,lowerBin,upperBin,inRange,binsToLower,binsToUpper,totalBins,pct})
    }catch(e){console.error("Meteora:",e.message)}
  }

  if(!data)return<div style={{background:"var(--card)",borderRadius:"12px",padding:"1.25rem",marginBottom:"1rem",color:"var(--muted)",fontSize:"0.85rem"}}>🌊 Meteora wird geladen...</div>

  const pctLower=(data.binsToLower/data.totalBins*100).toFixed(1)
  const pctUpper=(data.binsToUpper/data.totalBins*100).toFixed(1)
  const dangerLower=data.binsToLower<8
  const dangerUpper=data.binsToUpper<8

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

      {/* Visuelle Range Bar */}
      <div style={{marginBottom:"1rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.72rem",color:"var(--muted)",marginBottom:"0.3rem"}}>
          <span style={{color:dangerLower?"#ef4444":"var(--muted)"}}>Min {data.lowerBin}</span>
          <span style={{color:"#00d4ff",fontWeight:"bold"}}>● {data.activeBin}</span>
          <span style={{color:dangerUpper?"#ef4444":"var(--muted)"}}>Max {data.upperBin}</span>
        </div>
        <div style={{position:"relative",height:"12px",borderRadius:"6px",background:"var(--surface)",overflow:"hidden"}}>
          {/* Range füllung */}
          <div style={{position:"absolute",left:0,top:0,width:"100%",height:"100%",background:"linear-gradient(90deg,rgba(0,200,100,0.15),rgba(0,200,100,0.3),rgba(0,200,100,0.15))",borderRadius:"6px"}}/>
          {/* Active Bin Marker */}
          <div style={{position:"absolute",top:"50%",left:data.pct+"%",transform:"translate(-50%,-50%)",width:"10px",height:"10px",borderRadius:"50%",background:"#00d4ff",boxShadow:"0 0 8px #00d4ff",zIndex:2}}/>
          {/* Danger zones */}
          {dangerLower&&<div style={{position:"absolute",left:0,top:0,width:"12%",height:"100%",background:"rgba(239,68,68,0.3)",borderRadius:"6px 0 0 6px"}}/>}
          {dangerUpper&&<div style={{position:"absolute",right:0,top:0,width:"12%",height:"100%",background:"rgba(239,68,68,0.3)",borderRadius:"0 6px 6px 0"}}/>}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:"0.7rem",marginTop:"0.3rem"}}>
          <span style={{color:dangerLower?"#ef4444":"var(--muted)"}}>⬅ {data.binsToLower} Bins ({pctLower}%)</span>
          <span style={{color:dangerUpper?"#ef4444":"var(--muted)"}}>{ data.binsToUpper} Bins ({pctUpper}%) ➡</span>
        </div>
      </div>      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0.5rem"}}>
        <div style={{background:"var(--surface)",borderRadius:"8px",padding:"0.6rem",textAlign:"center"}}>
          <div style={{color:"var(--muted)",fontSize:"0.68rem",marginBottom:"0.2rem"}}>Active Bin</div>
          <div style={{fontWeight:"bold",fontSize:"0.9rem"}}>{data.activeBin}</div>
        </div>
        <div style={{background:"var(--surface)",borderRadius:"8px",padding:"0.6rem",textAlign:"center"}}>
          <div style={{color:"var(--muted)",fontSize:"0.68rem",marginBottom:"0.2rem"}}>Total Bins</div>
          <div style={{fontWeight:"bold",fontSize:"0.9rem"}}>{data.totalBins}</div>
        </div>
        <div style={{background:"var(--surface)",borderRadius:"8px",padding:"0.6rem",textAlign:"center"}}>
          <div style={{color:"var(--muted)",fontSize:"0.68rem",marginBottom:"0.2rem"}}>Position</div>
          <div style={{fontWeight:"bold",fontSize:"0.9rem"}}>{data.pct.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  )
}