export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*')
  const JUP='https://api.jup.ag/lend/v1'
  const USDC='EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

  if(req.method==='GET'){
    const{action,wallet}=req.query
    if(action==='apy'){
      try{
        const r=await fetch(JUP+'/earn/tokens',{headers:{accept:'application/json'}})
        const d=await r.json()
        const usdc=d.find(t=>t.assetAddress===USDC||t.symbol?.includes('USDC'))
        if(usdc){
          const apy=(parseFloat(usdc.supplyRate??usdc.totalRate??0)*100)
          return res.status(200).json({apy})
        }
      }catch(e){console.error(e.message)}
      return res.status(200).json({apy:7.2})
    }
    if(action==='balance'&&wallet){
      try{
        const r=await fetch(JUP+'/earn/positions?wallet='+wallet,{headers:{accept:'application/json'}})
        const d=await r.json()
        const pos=(Array.isArray(d)?d:d.positions||[]).find(p=>p.assetAddress===USDC||p.asset?.address===USDC)
        return res.status(200).json({balance:pos?parseFloat(pos.assets??pos.amount??0):0})
      }catch{return res.status(200).json({balance:0})}
    }
  }

  if(req.method==='POST'){
    const{action,amount,userPublicKey}=req.body
    try{
      const endpoint=action==='deposit'?'/earn/deposit-instructions':'/earn/withdraw-instructions'
      const r=await fetch(JUP+endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json',accept:'application/json'},
        body:JSON.stringify({signer:userPublicKey,asset:USDC,amount:String(Math.round(parseFloat(amount)*1e6))})
      })
      const d=await r.json()
      if(!r.ok)return res.status(400).json({error:JSON.stringify(d)})
      // Build transaction from instructions
      const{Connection,PublicKey,Transaction,TransactionInstruction}=await import('@solana/web3.js')
      const conn=new Connection(process.env.VITE_RPC_URL||'https://api.mainnet-beta.solana.com','confirmed')
      const{blockhash}=await conn.getLatestBlockhash()
      const tx=new Transaction({recentBlockhash:blockhash,feePayer:new PublicKey(userPublicKey)})
      for(const ix of d.instructions||[]){
        tx.add(new TransactionInstruction({
          programId:new PublicKey(ix.programId),
          keys:ix.accounts.map(a=>({pubkey:new PublicKey(a.pubkey),isSigner:a.isSigner,isWritable:a.isWritable})),
          data:ix.data?Buffer.from(ix.data,'base64'):Buffer.alloc(0)
        }))
      }
      const serialized=tx.serialize({requireAllSignatures:false,verifySignatures:false}).toString('base64')
      return res.status(200).json({transaction:serialized})
    }catch(e){return res.status(500).json({error:e.message})}
  }
  res.status(405).end()
}