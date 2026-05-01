import{useState,useEffect}from"react"
import{useConnection}from"@solana/wallet-adapter-react"
import{PublicKey}from"@solana/web3.js"

const POOL=new PublicKey("5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6")
const POS=new PublicKey("2pLfC12zAeZD1CCE7q4ksxwj84h4kuZP2W5dM1u8Cgtt")
const METEORA_URL="https://app.meteora.ag/dlmm/5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6"

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
      let totalUsdc=0
      for(let i=0;i<totalBins;i++){
        const off=200+i*16
        if(off+16>pos.data.length)break
        totalUsdc+=Number(pos.data.readBigUInt64LE(off+8))/1e6
      }
      const solRatio=binsToLower/totalBins
      const totalUsd=totalUsdc/(1-solRatio*0.5)
      setData({inRange,binsToLower,binsToUpper,totalBins,pct,totalUsd})
    }catch(e){console.error("Meteora:",e.message)}
  }

  if(!data)return<div style={{background:"var(--card)",borderRadius:"12px",padding:"1.25rem",marginBottom:"1rem",color:"var(--muted)",fontSize:"0.85rem"}}>🌊 Meteora wird geladen...</div>

  const nearEdge=data.pct<10||data.pct>90
  const color=nearEdge?"#ef4444":"#00c864"
  const glow=nearEdge?"0 0 15px #ef4444":"0 0 15px #00c864"

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

      <div style={{marginBottom:"1rem"}}>
        <div style={{position:"relative",height:"12px",borderRadius:"6px",background:"var(--surface)",overflow:"hidden"}}>
          <div style={{position:"absolute",left:0,top:0,width:"100%",height:"100%",background:"linear-gradient(90deg,rgba(0,200,100,0.15),rgba(0,200,100,0.3),rgba(0,200,100,0.15))"}}/>
          <div style={{position:"absolute",top:"50%",left:data.pct+"%",transform:"translate(-50%,-50%)",width:"10px",height:"10px",borderRadius:"50%",background:"#00d4ff",boxShadow:"0 0 8px #00d4ff",zIndex:2}}/>
          {data.pct<10&&<div style={{position:"absolute",left:0,top:0,width:"12%",height:"100%",background:"rgba(239,68,68,0.3)",borderRadius:"6px 0 0 6px"}}/>}
          {data.pct>90&&<div style={{position:"absolute",right:0,top:0,width:"12%",height:"100%",background:"rgba(239,68,68,0.3)",borderRadius:"0 6px 6px 0"}}/>}
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.5rem",marginBottom:"0.75rem"}}>
        <div style={{background:"var(--surface)",borderRadius:"8px",padding:"0.6rem",textAlign:"center"}}>
          <div style={{color:"var(--muted)",fontSize:"0.68rem",marginBottom:"0.2rem"}}>Position</div>
          <div style={{fontWeight:"bold",fontSize:"1.8rem",color,textShadow:glow,textAlign:"center"}}>{data.pct.toFixed(1)}%</div>
        </div>
        <div style={{background:"var(--surface)",borderRadius:"8px",padding:"0.6rem",textAlign:"center"}}>
          <div style={{color:"var(--muted)",fontSize:"0.68rem",marginBottom:"0.2rem"}}>Wert</div>
          <div style={{fontWeight:"bold",fontSize:"0.9rem",color:"#00c864"}}>${data.totalUsd.toFixed(2)}</div>
        </div>
      </div>

      <a href={METEORA_URL} target="_blank" rel="noopener noreferrer"
        style={{display:"block",textAlign:"center",padding:"0.6rem",borderRadius:"8px",background:"rgba(0,200,100,0.15)",color:"#00c864",fontWeight:"bold",fontSize:"0.85rem",textDecoration:"none",border:"1px solid rgba(0,200,100,0.3)"}}>
        📊 Position auf Meteora öffnen ↗
      </a>
    </div>
  )
}