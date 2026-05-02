import{Connection,PublicKey}from"@solana/web3.js"

const DLMM_PROG=new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo")
const WALLET=new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj")
const NTFY_CHANNEL="poolforge-dzad"
const RPC=process.env.VITE_RPC_URL||"https://api.mainnet-beta.solana.com"

async function sendAlert(msg){
  await fetch("https://ntfy.sh/"+NTFY_CHANNEL,{
    method:"POST",
    headers:{"Title":"PoolForge Alert 🚨","Priority":"urgent","Tags":"warning"},
    body:msg
  })
}

export default async function handler(req,res){
  try{
    const conn=new Connection(RPC,"confirmed")
    const accs=await conn.getProgramAccounts(DLMM_PROG,{
      filters:[{memcmp:{offset:40,bytes:WALLET.toBase58()}}]
    })
    for(const acc of accs){
      const d=acc.account.data
      if(d.length<8120)continue
      const lbPair=new PublicKey(d.slice(8,40))
      const poolInfo=await conn.getAccountInfo(lbPair)
      if(!poolInfo)continue
      const activeBin=poolInfo.data.readInt32LE(48)
      const lowerBin=d.readInt32LE(7912)
      const upperBin=d.readInt32LE(7916)
      if(lowerBin===0&&upperBin===0)continue
      const totalBins=upperBin-lowerBin
      const binsToLower=activeBin-lowerBin
      const pct=totalBins>0?(binsToLower/totalBins*100):50
      const inRange=activeBin>=lowerBin&&activeBin<=upperBin

      if(!inRange){
        await sendAlert("🚨 OUT OF RANGE! Position sofort rebalancen!\nhttps://poolforge-v2.vercel.app")
      }else if(pct<10){
        await sendAlert("⚠️ Position nahe unterem Rand! "+pct.toFixed(1)+"% verbleibend\nhttps://poolforge-v2.vercel.app")
      }else if(pct>90){
        await sendAlert("⚠️ Position nahe oberem Rand! "+(100-pct).toFixed(1)+"% verbleibend\nhttps://poolforge-v2.vercel.app")
      }
    }
    res.status(200).json({ok:true})
  }catch(e){res.status(500).json({error:e.message})}
}