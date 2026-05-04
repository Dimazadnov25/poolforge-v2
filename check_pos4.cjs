const{Connection,PublicKey}=require("@solana/web3.js")
const conn=new Connection("https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2","confirmed")
const WALLET=new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj")
async function check(){
  const sigs=await conn.getSignaturesForAddress(WALLET,{limit:5})
  for(const s of sigs){
    const tx=await conn.getTransaction(s.signature,{commitment:"confirmed",maxSupportedTransactionVersion:0})
    if(!tx)continue
    const logs=tx.meta?.logMessages||[]
    console.log("TX:",s.signature.slice(0,20))
    console.log("Logs:",logs.slice(0,5))
    console.log("---")
  }
}
check().catch(console.error)