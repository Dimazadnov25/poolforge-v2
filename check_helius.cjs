const{Connection,PublicKey}=require("@solana/web3.js")
const conn=new Connection("https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2","confirmed")
const DLMM=new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo")
const WALLET=new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj")
async function check(){
  const accs=await conn.getProgramAccounts(DLMM,{filters:[{memcmp:{offset:40,bytes:WALLET.toBase58()}}]})
  console.log("Gefunden:",accs.length)
  // Auch mit offset 8 probieren
  const accs2=await conn.getProgramAccounts(DLMM,{filters:[{memcmp:{offset:8,bytes:WALLET.toBase58()}}]})
  console.log("Offset 8:",accs2.length)
}
check().catch(console.error)