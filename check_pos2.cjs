const{Connection,PublicKey}=require("@solana/web3.js")
const conn=new Connection("https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2","confirmed")
const DLMM=new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo")
const NFT_MINT=new PublicKey("AhhzwAHK69NbBrTy83gC3zFZBLhqvQYwG7bqUKCX2CVw")
async function check(){
  // Suche DLMM Account der diese NFT Mint enthält
  const accs=await conn.getProgramAccounts(DLMM,{
    filters:[{memcmp:{offset:72,bytes:NFT_MINT.toBase58()}}]
  })
  console.log("Gefunden offset 72:",accs.length)
  const accs2=await conn.getProgramAccounts(DLMM,{
    filters:[{memcmp:{offset:8,bytes:NFT_MINT.toBase58()}}]
  })
  console.log("Gefunden offset 8:",accs2.length)
  if(accs2.length>0)accs2.forEach(a=>console.log(a.pubkey.toBase58()))
}
check().catch(console.error)