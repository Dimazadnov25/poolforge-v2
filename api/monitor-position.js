import{Connection,PublicKey}from"@solana/web3.js"

const DLMM_PROG=new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo")
const WALLET=new PublicKey("ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy")
const POS=new PublicKey("Gs39HvfzRqu7aRMQ1iQyR3M6sVpNgDrqe7jjx5qK6gHE")
const NTFY_CHANNEL="poolforge-dzad"
const RPC="https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2"

async function sendAlert(title,msg,priority="urgent"){
  await fetch("https://ntfy.sh/"+NTFY_CHANNEL,{
    method:"POST",
    headers:{"Title":title,"Priority":priority,"Tags":"warning"},
    body:msg
  })
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

    console.log("pct:",pct.toFixed(1),"inRange:",inRange)

    if(!inRange){
      await sendAlert("🚨 PoolForge OUT OF RANGE","Sofort rebalancen!\nhttps://poolforge-v2.vercel.app","urgent")
    }else if(pct<10){
      await sendAlert("⚠️ AKTUELL "+pct.toFixed(1)+"%","Position nahe unterem Rand!\nhttps://poolforge-v2.vercel.app","high")
    }else if(pct>90){
      await sendAlert("⚠️ AKTUELL "+pct.toFixed(1)+"%","Position nahe oberem Rand!\nhttps://poolforge-v2.vercel.app","high")
    }

    res.status(200).json({ok:true,pct:pct.toFixed(1),inRange})
  }catch(e){
    await sendAlert("❌ Monitor Fehler",e.message,"default")
    res.status(500).json({error:e.message})
  }
}
