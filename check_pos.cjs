const{Connection,PublicKey}=require("@solana/web3.js")
const conn=new Connection("https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2","confirmed")
const WALLET=new PublicKey("BFU5gQ5jYq534vSDKGnBSNffwtoTZFkeo68WJmviVVzj")
const TOKEN_PROG=new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
async function check(){
  const accs=await conn.getParsedTokenAccountsByOwner(WALLET,{programId:TOKEN_PROG})
  const nfts=accs.value.filter(a=>a.account.data.parsed.info.tokenAmount.amount==="1")
  console.log("NFTs (Positionen):",nfts.length)
  nfts.forEach(n=>console.log(n.account.data.parsed.info.mint))
}
check().catch(console.error)