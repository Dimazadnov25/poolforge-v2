import{useState,useEffect}from"react"
import{useConnection,useWallet}from"@solana/wallet-adapter-react"
import{PublicKey}from"@solana/web3.js"

const DLMM_PROG=new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo")
const TOKEN_PROG=new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
const METEORA_BASE="https://app.meteora.ag/dlmm/"

export default function MeteoraDashboard(){
  const{connection}=useConnection()
  const{publicKey}=useWallet()
  const[positions,setPositions]=useState([])
  const[loading,setLoading]=useState(false)

  useEffect(()=>{
    if(publicKey){fetchPositions()}
    const t=setInterval(()=>{if(publicKey)fetchPositions()},5000)
    return()=>clearInterval(t)
  },[publicKey?.toBase58()])

  async function fetchPositions(){
    try{
      const accs=await connection.getProgramAccounts(DLMM_PROG,{
        filters:[{memcmp:{offset:40,bytes:publicKey.toBase58()}}]
      })
      const result=[]
      for(const acc of accs){
        const d=acc.account.data
        if(d.length<8120)continue
        const lbPair=new PublicKey(d.slice(8,40))
        const poolInfo=await connection.getAccountInfo(lbPair)
        if(!poolInfo)continue
        const activeBin=poolInfo.data.readInt32LE(48)
        const lowerBin=d.readInt32LE(7912)
        const upperBin=d.readInt32LE(7916)
        if(lowerBin===0&&upperBin===0)continue
        const inRange=activeBin>=lowerBin&&activeBin<=upperBin
        const totalBins=upperBin-lowerBin
        const binsToLower=activeBin-lowerBin
        const pct=totalBins>0?(binsToLower/totalBins*100):50
        result.push({lbPair:lbPair.toBase58(),inRange,pct,totalBins})
      }
      setPositions(result)
    }catch(e){console.error("Meteora:",e.message)}
  }

  if(!publicKey)return null
  if(!positions.length&&!loading)return(
    <div style={{background:"var(--card)",borderRadius:"12px",padding:"1.25rem",marginBottom:"1rem"}}>
      <div style={{display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"1rem"}}>
        <span style={{fontSize:"1.1rem"}}>🌊</span>
        <h3 style={{margin:0,fontSize:"0.95rem",fontWeight:"bold"}}>Meteora DLMM</h3>
      </div>
      <div style={{textAlign:"center",marginBottom:"0.75rem"}}>
        <div style={{color:"var(--muted)",fontSize:"0.72rem",marginBottom:"0.5rem"}}>Neue Position öffnen</div>
        <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",flexWrap:"wrap"}}>
          {[1,4,10,20].map(bins=>(
            <a key={bins} href={METEORA_BASE+"HTvjzsfX3yU6BUodCjZ5vZkUrAxMDTrBs3CJaq43ashR"} target="_blank" rel="noopener noreferrer"
              style={{padding:"0.3rem 0.8rem",borderRadius:"8px",background:"var(--surface)",color:"#00c864",fontSize:"0.82rem",fontWeight:"bold",textDecoration:"none",border:"1px solid rgba(0,200,100,0.3)"}}>
              {bins} Bin
            </a>
          ))}
        </div>
      </div>
    </div>
  )

  return(
    <div>
      {positions.map((pos,i)=>{
        const nearEdge=pos.pct<10||pos.pct>90
        const color=nearEdge?"#ef4444":"#00c864"
        const glow=nearEdge?"0 0 15px #ef4444":"0 0 15px #00c864"
        const url=METEORA_BASE+pos.lbPair
        return(
          <div key={i} style={{background:"var(--card)",borderRadius:"12px",padding:"1.25rem",marginBottom:"1rem"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                <span style={{fontSize:"1.1rem"}}>🌊</span>
                <h3 style={{margin:0,fontSize:"0.95rem",fontWeight:"bold"}}>Meteora DLMM</h3>
                <span style={{fontSize:"0.7rem",color:"var(--muted)",background:"var(--surface)",padding:"0.1rem 0.4rem",borderRadius:"4px"}}>SOL-USDC</span>
              </div>
              <span style={{padding:"0.2rem 0.7rem",borderRadius:"20px",fontSize:"0.8rem",fontWeight:"bold",background:pos.inRange?"rgba(0,200,100,0.15)":"rgba(239,68,68,0.15)",color:pos.inRange?"#00c864":"#ef4444"}}>
                {pos.inRange?"✅ In Range":"🚨 Out of Range"}
              </span>
            </div>
            <div style={{marginBottom:"1rem"}}>
              <div style={{position:"relative",height:"12px",borderRadius:"6px",background:"var(--surface)",overflow:"hidden"}}>
                <div style={{position:"absolute",left:0,top:0,width:"100%",height:"100%",background:"linear-gradient(90deg,rgba(0,200,100,0.15),rgba(0,200,100,0.3),rgba(0,200,100,0.15))"}}/>
                <div style={{position:"absolute",top:"50%",left:pos.pct+"%",transform:"translate(-50%,-50%)",width:"10px",height:"10px",borderRadius:"50%",background:"#00d4ff",boxShadow:"0 0 8px #00d4ff",zIndex:2}}/>
                {pos.pct<10&&<div style={{position:"absolute",left:0,top:0,width:"12%",height:"100%",background:"rgba(239,68,68,0.3)",borderRadius:"6px 0 0 6px"}}/>}
                {pos.pct>90&&<div style={{position:"absolute",right:0,top:0,width:"12%",height:"100%",background:"rgba(239,68,68,0.3)",borderRadius:"0 6px 6px 0"}}/>}
              </div>
            </div>
            <div style={{textAlign:"center",marginBottom:"0.75rem"}}>
              <div style={{color:"var(--muted)",fontSize:"0.68rem",marginBottom:"0.2rem"}}>Position</div>
              <div style={{fontWeight:"bold",fontSize:"1.8rem",color,textShadow:glow}}>{pos.pct.toFixed(1)}%</div>
            </div>
            <a href={url} target="_blank" rel="noopener noreferrer"
              style={{display:"block",textAlign:"center",padding:"0.6rem",borderRadius:"8px",background:"rgba(0,200,100,0.15)",color:"#00c864",fontWeight:"bold",fontSize:"0.85rem",textDecoration:"none",border:"1px solid rgba(0,200,100,0.3)",marginBottom:"0.75rem"}}>
              📊 Position auf Meteora öffnen ↗
            </a>
            <div style={{textAlign:"center"}}>
              <div style={{color:"var(--muted)",fontSize:"0.72rem",marginBottom:"0.5rem"}}>Neue Position öffnen</div>
              <div style={{display:"flex",gap:"0.5rem",justifyContent:"center",flexWrap:"wrap"}}>
                {[1,4,10,20].map(bins=>(
                  <a key={bins} href={url} target="_blank" rel="noopener noreferrer"
                    style={{padding:"0.3rem 0.8rem",borderRadius:"8px",background:"var(--surface)",color:"#00c864",fontSize:"0.82rem",fontWeight:"bold",textDecoration:"none",border:"1px solid rgba(0,200,100,0.3)"}}>
                    {bins} Bin
                  </a>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}