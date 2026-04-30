export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).end()
  try{
    const{inputMint,outputMint,amount,userPublicKey}=req.body
    const quoteResp=await fetch('https://ultra-api.jup.ag/order?inputMint='+inputMint+'&outputMint='+outputMint+'&amount='+amount+'&taker='+userPublicKey)
    const quote=await quoteResp.json()
    if(quote.error)return res.status(400).json({error:quote.error})
    if(!quote.transaction)return res.status(400).json({error:'No transaction',data:quote})
    res.status(200).json({swapTransaction:quote.transaction})
  }catch(e){res.status(500).json({error:e.message})}
}