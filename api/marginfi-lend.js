import{Connection,PublicKey}from'@solana/web3.js'
import{KaminoMarket,KaminoAction,VanillaObligation,PROGRAM_ID}from'@kamino-finance/klend-sdk'
import BN from'bn.js'

const RPC=process.env.VITE_RPC_URL||'https://api.mainnet-beta.solana.com'
const MARKET_ADDRESS=new PublicKey('7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF')
const USDC_MINT=new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')

let cachedMarket=null
let cacheTime=0

async function getMarket(){
  if(cachedMarket&&Date.now()-cacheTime<60000)return cachedMarket
  const conn=new Connection(RPC,'confirmed')
  cachedMarket=await KaminoMarket.load(conn,MARKET_ADDRESS,400)
  cacheTime=Date.now()
  return cachedMarket
}

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')

  if(req.method==='GET'){
    const{action,wallet}=req.query
    try{
      const market=await getMarket()
      const reserve=market.getReserveByMint(USDC_MINT)

      if(action==='apy'){
        const rate=reserve?reserve.calculateSupplyAPR()*100:7.2
        return res.status(200).json({apy:rate})
      }

      if(action==='balance'&&wallet){
        const auth=new PublicKey(wallet)
        const obligations=await market.getAllUserObligations(auth)
        if(!obligations?.length)return res.status(200).json({balance:0})
        let total=0
        for(const obl of obligations){
          if(!obl)continue
          for(const[mint,deposit]of obl.deposits.entries()){
            if(mint.equals(USDC_MINT)){
              total+=deposit.amount.toNumber()/1e6
            }
          }
        }
        return res.status(200).json({balance:total})
      }
    }catch(e){return res.status(500).json({error:e.message})}
  }

  if(req.method==='POST'){
    const{action,amount,userPublicKey}=req.body
    if(!action||!amount||!userPublicKey)return res.status(400).json({error:'Missing params'})
    try{
      const conn=new Connection(RPC,'confirmed')
      const market=await getMarket()
      const auth=new PublicKey(userPublicKey)
      const amountBN=new BN(Math.round(parseFloat(amount)*1e6))
      let kaminoAction
      if(action==='deposit'){
        kaminoAction=await KaminoAction.buildDepositTxns(market,amountBN,USDC_MINT,auth,new VanillaObligation(PROGRAM_ID))
      }else if(action==='withdraw'){
        kaminoAction=await KaminoAction.buildWithdrawTxns(market,amountBN,USDC_MINT,auth,new VanillaObligation(PROGRAM_ID))
      }else{
        return res.status(400).json({error:'Invalid action'})
      }
      const allTxs=[
        ...(kaminoAction.setupIxsToSign||[]),
        ...(kaminoAction.lendingIxsToSign||[]),
        ...(kaminoAction.cleanupIxsToSign||[])
      ]
      const serialized=allTxs.map(tx=>tx.serialize({requireAllSignatures:false,verifySignatures:false}).toString('base64'))
      return res.status(200).json({transactions:serialized})
    }catch(e){return res.status(500).json({error:e.message})}
  }
  res.status(405).end()
}