const{Connection,PublicKey}=require("@solana/web3.js")
const conn=new Connection("https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2","confirmed")
const DLMM=new PublicKey("LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo")
const NFT=new PublicKey("AhhzwAHK69NbBrTy83gC3zFZBLhqvQYwG7bqUKCX2CVw")
async function check(){
  // Position PDA = ["position", nft_mint]
  const[pda]=PublicKey.findProgramAddressSync([Buffer.from("position"),NFT.toBuffer()],DLMM)
  console.log("Position PDA:",pda.toBase58())
  const info=await conn.getAccountInfo(pda)
  if(info){
    console.log("Owner:",info.owner.toBase58())
    console.log("Size:",info.data.length)
    const d=info.data
    const lbPair=new PublicKey(d.slice(8,40))
    console.log("lbPair:",lbPair.toBase58())
    const activeBin=(await conn.getAccountInfo(lbPair))?.data.readInt32LE(48)
    const lowerBin=d.readInt32LE(7912)
    const upperBin=d.readInt32LE(7916)
    console.log("activeBin:",activeBin,"lowerBin:",lowerBin,"upperBin:",upperBin)
    const pct=(activeBin-lowerBin)/(upperBin-lowerBin)*100
    console.log("pct:",pct.toFixed(1)+"%")
  }else console.log("Nicht gefunden")
}
check().catch(console.error)