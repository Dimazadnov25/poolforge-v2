export default async function handler(req,res){
  if(req.method==='GET'&&req.query.action==='apy'){
    try{
      const r=await fetch('https://marginfi-v2-ui-git-main-mrgn.vercel.app/api/banks',{headers:{accept:'application/json'}})
      if(r.ok){const d=await r.json();const b=(d.banks||d||[]).find(x=>x.symbol==='USDC'||x.tokenSymbol==='USDC');if(b){return res.status(200).json({apy:b.lendingRate??b.depositRate??7.5})}}
    }catch{}
    return res.status(200).json({apy:7.5})
  }
  res.status(405).end()
}