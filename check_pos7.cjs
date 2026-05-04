const{Connection,PublicKey}=require("@solana/web3.js")
const conn=new Connection("https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2","confirmed")
const POS=new PublicKey("4bFqcr6euauPqdwo67yNWh14E8baDFAc985ZD4KddJvw")
async function check(){
  const info=await conn.getAccountInfo(POS)
  if(!info){console.log("Nicht gefunden");return}
  console.log("Owner:",info.owner.toBase58())
  console.log("Size:",info.data.length)
  const d=info.data
  const lbPair=new PublicKey(d.slice(8,40))
  console.log("lbPair:",lbPair.toBase58())
  const pool=await conn.getAccountInfo(lbPair)
  if(!pool)return
  const activeBin=pool.data.readInt32LE(48)
  const lowerBin=d.readInt32LE(7912)
  const upperBin=d.readInt32LE(7916)
  console.log("activeBin:",activeBin,"lowerBin:",lowerBin,"upperBin:",upperBin)
  const pct=(activeBin-lowerBin)/(upperBin-lowerBin)*100
  console.log("pct:",pct.toFixed(1)+"%")
}
check().catch(console.error)