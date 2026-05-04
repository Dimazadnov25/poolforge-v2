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
  for(let i=0;i<d.length-8;i+=4){
    const a=d.readInt32LE(i)
    const b=d.readInt32LE(i+4)
    if(Math.abs(a-activeBin)<200&&Math.abs(b-activeBin)<200&&a!==b)
      console.log("offset",i,":",a,b,"diff:",b-a)
  }
}
check().catch(console.error)