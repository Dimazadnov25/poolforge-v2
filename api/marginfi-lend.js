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
        const{Connection,PublicKey}=await import('@solana/web3.js')
        const conn=new Connection(process.env.VITE_RPC_URL||'https://api.mainnet-beta.solana.com','confirmed')
        const JL_USDC='9BEcn9aPEmhSPbPQeFGjidRiEKki46fVQDyPpSQXPA2D'
        const TOKEN_PROG=new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        const owner=new PublicKey(wallet)
        const accs=await conn.getParsedTokenAccountsByOwner(owner,{programId:TOKEN_PROG})
        const jlAcc=accs.value.find(a=>a.account.data.parsed.info.mint===JL_USDC)
        const balance=jlAcc?parseFloat(jlAcc.account.data.parsed.info.tokenAmount.uiAmount||0):0
        return res.status(200).json({balance})
      }catch(e){return res.status(200).json({balance:0,error:e.message})}
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