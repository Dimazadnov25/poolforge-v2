const{Connection,PublicKey}=require("@solana/web3.js")
const conn=new Connection("https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2","confirmed")
const DLMM=new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo")
const NFT=new PublicKey("AhhzwAHK69NbBrTy83gC3zFZBLhqvQYwG7bqUKCX2CVw")
async function check(){
  // Versuche verschiedene PDAs
  const seeds=[
    [Buffer.from("position"),NFT.toBuffer()],
    [NFT.toBuffer()],
    [Buffer.from("position_v2"),NFT.toBuffer()],
  ]
  for(const s of seeds){
    const[pda]=PublicKey.findProgramAddressSync(s,DLMM)
    const info=await conn.getAccountInfo(pda)
    if(info&&info.owner.equals(DLMM)){
      console.log("GEFUNDEN! PDA:",pda.toBase58())
      console.log("Size:",info.data.length)
      break
    }
  }
  // Auch NFT direkt als Account lesen
  const nftInfo=await conn.getAccountInfo(NFT)
  console.log("NFT owner:",nftInfo?.owner.toBase58())
  console.log("NFT size:",nftInfo?.data.length)
}
check().catch(console.error)