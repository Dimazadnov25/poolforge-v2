const{Connection,PublicKey}=require("@solana/web3.js")
const conn=new Connection("https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2","confirmed")
async function check(){
  const POS=new PublicKey("Gs39HvfzRqu7aRMQ1iQyR3M6sVpNgDrqe7jjx5qK6gHE")
  const info=await conn.getAccountInfo(POS)
  const d=info.data
  const lbPair=new PublicKey(d.slice(8,40))
  const pool=await conn.getAccountInfo(lbPair)
  const activeBin=pool.data.readInt32LE(48)
  console.log("activeBin:",activeBin)
  console.log("Size:",d.length)
  for(let i=d.length-200;i<d.length-4;i+=4){
    const v=d.readInt32LE(i)
    if(Math.abs(v-activeBin)<500&&v!==0)console.log("offset",i,":",v)
  }
}
check().catch(console.error)