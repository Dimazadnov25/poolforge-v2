import{Connection,PublicKey}from"@solana/web3.js"

const POS=new PublicKey("9em49RxjaQcTdET27UofZgKnoriTzH4MSQrEkCAxKTfW")
const NTFY="poolforge-dzad"
const RPC="https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2"

async function sendAlert(title,msg,priority="urgent"){
  await fetch("https://ntfy.sh/"+NTFY,{method:"POST",headers:{"Title":title,"Priority":priority,"Tags":"warning"},body:msg})
}

export default async function handler(req,res){
  try{
    const conn=new Connection(RPC,"confirmed")
    const posInfo=await conn.getAccountInfo(POS)
    if(!posInfo)return res.status(200).json({ok:true,message:"Position not found"})
    const d=posInfo.data
    const lbPair=new PublicKey(d.slice(8,40))
    const poolInfo=await conn.getAccountInfo(lbPair)
    if(!poolInfo)return res.status(200).json({ok:true,message:"Pool not found"})
    const activeBin=poolInfo.data.readInt32LE(48)
    const lowerBin=d.readInt32LE(7912)
    const upperBin=d.readInt32LE(7916)
    const totalBins=upperBin-lowerBin
    const binsToLower=activeBin-lowerBin
    const pct=totalBins>0?(binsToLower/totalBins*100):50
    const inRange=activeBin>=lowerBin&&activeBin<=upperBin
    if(!inRange){
      await sendAlert("OUT OF RANGE!","Sofort rebalancen! https://poolforge-v2.vercel.app","urgent")
    }else if(pct<20){
      await sendAlert("AKTUELL "+pct.toFixed(1)+"%","Nahe unterem Rand! https://poolforge-v2.vercel.app","high")
    }else if(pct>80){
      await sendAlert("AKTUELL "+pct.toFixed(1)+"%","Nahe oberem Rand! https://poolforge-v2.vercel.app","high")
    }
    res.status(200).json({ok:true,pct:pct.toFixed(1),inRange,activeBin,lowerBin,upperBin})
  }catch(e){
    res.status(500).json({error:e.message})
  }
}




