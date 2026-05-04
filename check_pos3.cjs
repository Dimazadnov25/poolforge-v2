const{Connection,PublicKey}=require("@solana/web3.js")
const conn=new Connection("https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2","confirmed")
const WALLET=new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj")
async function check(){
  // Letzte Transaktionen der Wallet lesen um Position Adresse zu finden
  const sigs=await conn.getSignaturesForAddress(WALLET,{limit:10})
  for(const s of sigs){
    const tx=await conn.getTransaction(s.signature,{commitment:"confirmed",maxSupportedTransactionVersion:0})
    if(!tx)continue
    const logs=tx.meta?.logMessages||[]
    if(!logs.some(l=>l.includes("AddLiquidity")||l.includes("InitializePosition")||l.includes("addLiquidity")))continue
    console.log("TX:",s.signature.slice(0,20))
    const keys=tx.transaction.message.staticAccountKeys||[]
    keys.forEach((k,i)=>console.log(i,k.toBase58?.()??k))
    break
  }
}
check().catch(console.error)