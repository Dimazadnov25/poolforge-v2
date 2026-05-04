const{Connection,PublicKey}=require("@solana/web3.js")
const conn=new Connection("https://api.mainnet-beta.solana.com","confirmed")
async function check(){
  const POS=new PublicKey("GyBaG3ockgdVqkyz4A3BEk4qyS961Ph4R2NB7ScfzoVJ")
  const pos=await conn.getAccountInfo(POS)
  const d=pos.data
  // Suche kleine Werte die Fees sein könnten (z.B. 0.001-0.1 SOL oder 0.1-10 USDC)
  for(let i=0;i<d.length-8;i+=8){
    const v=Number(d.readBigUInt64LE(i))
    if(v>100&&v<100000000)console.log("offset",i,":",v,"=",v/1e9,"SOL or",v/1e6,"USDC")
  }
}
check().catch(console.error)