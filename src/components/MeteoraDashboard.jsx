import{useState,useEffect}from'react'
import{useWallet}from'@solana/wallet-adapter-react'

const METEORA_API='https://dlmm-api.meteora.ag'
const WALLET='BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj'

export default function MeteoraDashboard({solPrice}){
  const[positions,setPositions]=useState([])
  const[loading,setLoading]=useState(true)

  useEffect(()=>{fetchPositions();const t=setInterval(fetchPositions,60000);return()=>clearInterval(t)},[])

  async function fetchPositions(){
    try{
      const r=await fetch(METEORA_API+'/position/'+WALLET)
      const d=await r.json()
      setPositions(Array.isArray(d)?d:[])
    }catch(e){console.error('Meteora:',e.message)}
    setLoading(false)
  }

  if(loading)return <div style={{background:'var(--card)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem',color:'var(--muted)',fontSize:'0.85rem'}}>🌊 Meteora wird geladen...</div>
  if(!positions.length)return null

  return(
    <div style={{background:'var(--card)',borderRadius:'12px',padding:'1.25rem',marginBottom:'1rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'1rem'}}>
        <span style={{fontSize:'1.1rem'}}>🌊</span>
        <h3 style={{margin:0,fontSize:'0.95rem',fontWeight:'bold'}}>Meteora DLMM</h3>
      </div>
      {positions.map((pos,i)=>{
        const activeBin=pos.activeBinId??pos.currentBinId??0
        const minBin=pos.lowerBinId??pos.minBinId??0
        const maxBin=pos.upperBinId??pos.maxBinId??0
        const inRange=activeBin>=minBin&&activeBin<=maxBin
        const totalUsd=(parseFloat(pos.totalXAmount||0)/1e9)*(solPrice||0)+(parseFloat(pos.totalYAmount||0)/1e6)
        return(
          <div key={i} style={{background:'var(--surface)',borderRadius:'8px',padding:'0.75rem',marginBottom:'0.5rem'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'0.5rem'}}>
              <span style={{fontSize:'0.75rem',color:'var(--muted)'}}>{(pos.address||pos.pubkey||'').slice(0,8)}...</span>
              <span style={{padding:'0.15rem 0.5rem',borderRadius:'20px',fontSize:'0.75rem',fontWeight:'bold',background:inRange?'rgba(0,200,100,0.15)':'rgba(239,68,68,0.15)',color:inRange?'#00c864':'#ef4444'}}>
                {inRange?'✅ In Range':'🚨 Out of Range'}
              </span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem',fontSize:'0.8rem'}}>
              <div style={{textAlign:'center'}}>
                <div style={{color:'var(--muted)',fontSize:'0.7rem'}}>Active Bin</div>
                <div style={{fontWeight:'bold'}}>{activeBin}</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{color:'var(--muted)',fontSize:'0.7rem'}}>Range</div>
                <div style={{fontWeight:'bold'}}>{minBin} → {maxBin}</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{color:'var(--muted)',fontSize:'0.7rem'}}>Wert</div>
                <div style={{fontWeight:'bold',color:'#00c864'}}>${totalUsd.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}