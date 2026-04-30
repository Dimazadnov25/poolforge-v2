export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  const JUP='https://lend-api.jup.ag'
  const USDC='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

  if(req.method==='GET'){
    const{action,wallet}=req.query
    if(action==='apy'){
      try{
        const r=await fetch(JUP+'/earn/tokens')
        const d=await r.json()
        const usdc=(Array.isArray(d)?d:d.tokens||[]).find(t=>t.mint===USDC||t.symbol==='USDC')
        if(usdc){
          const apy=usdc.supplyApy??usdc.apy??usdc.depositApy??0
          return res.status(200).json({apy:parseFloat(apy)*100})
        }
      }catch(e){console.error(e.message)}
      return res.status(200).json({apy:7.2})
    }
    if(action==='balance'&&wallet){
      try{
        const r=await fetch(JUP+'/earn/positions?wallet='+wallet)
        const d=await r.json()
        const arr=Array.isArray(d)?d:d.positions||[]
        const pos=arr.find(p=>p.mint===USDC)
        return res.status(200).json({balance:pos?parseFloat(pos.depositedAmount??pos.amount??0):0})
      }catch{return res.status(200).json({balance:0})}
    }
  }

  if(req.method==='POST'){
    const{action,amount,userPublicKey}=req.body
    try{
      const endpoint=action==='deposit'?'/earn/deposit-instructions':'/earn/withdraw-instructions'
      const r=await fetch(JUP+endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({wallet:userPublicKey,mint:USDC,amount:Math.round(parseFloat(amount)*1e6)})
      })
      const d=await r.json()
      if(!r.ok)return res.status(400).json({error:JSON.stringify(d)})
      return res.status(200).json(d)
    }catch(e){return res.status(500).json({error:e.message})}
  }
  res.status(405).end()
}