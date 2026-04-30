import{Connection,PublicKey,Transaction}from'@solana/web3.js'
import{MarginfiClient,getConfig}from'@mrgnlabs/marginfi-client-v2'
import{NodeWallet}from'@mrgnlabs/mrgn-common'
import{Keypair}from'@solana/web3.js'

const RPC=process.env.VITE_RPC_URL||'https://api.mainnet-beta.solana.com'

async function getClient(){
  const conn=new Connection(RPC,'confirmed')
  const dummy=new NodeWallet(Keypair.generate())
  const config=getConfig('production')
  return await MarginfiClient.fetch(config,dummy,conn)
}

export default async function handler(req,res){
  if(req.method==='GET'){
    const{action,wallet}=req.query
    try{
      const client=await getClient()
      const bank=client.getBankByTokenSymbol('USDC')
      if(!bank)return res.status(404).json({error:'USDC bank not found'})

      if(action==='apy'){
        const apy=bank.computeInterestRates()
        return res.status(200).json({apy:apy.lendingRate.toNumber()*100})
      }

      if(action==='balance'&&wallet){
        const auth=new PublicKey(wallet)
        const accounts=await client.getMarginfiAccountsForAuthority(auth)
        if(!accounts||accounts.length===0)return res.status(200).json({balance:0})
        const acc=accounts[0]
        const bal=acc.getHealthComponents().assets
        const usdcBal=acc.activeBalances.find(b=>b.bankPk.toBase58()===bank.address.toBase58())
        if(!usdcBal)return res.status(200).json({balance:0})
        const{assets}=usdcBal.computeQuantityUi(bank)
        return res.status(200).json({balance:assets.toNumber()})
      }
    }catch(e){return res.status(500).json({error:e.message})}
  }

  if(req.method==='POST'){
    const{action,amount,userPublicKey}=req.body
    if(!action||!amount||!userPublicKey)return res.status(400).json({error:'Missing params'})
    try{
      const conn=new Connection(RPC,'confirmed')
      const auth=new PublicKey(userPublicKey)
      const dummy=new NodeWallet(Keypair.generate())
      const config=getConfig('production')
      const client=await MarginfiClient.fetch(config,dummy,conn)
      const bank=client.getBankByTokenSymbol('USDC')
      if(!bank)return res.status(404).json({error:'USDC bank not found'})

      let accounts=await client.getMarginfiAccountsForAuthority(auth)
      let mfAcc=accounts?.[0]

      const instructions=[]
      const signers=[]

      if(!mfAcc){
        // Neues Account erstellen
        const{instructions:initIxs,address}=await client.makeCreateMarginfiAccountIx()
        instructions.push(...initIxs)
        // Nach der Erstellung nochmal laden - wir bauen alles in eine TX
      }

      // Wir erstellen eine neue Wallet-Signatur-TX
      let tx
      if(!mfAcc){
        // Erstelle Account + Deposit in einer TX
        const newAccKeypair=Keypair.generate()
        signers.push(newAccKeypair)
        const createIxs=await client.makeCreateMarginfiAccountIx(newAccKeypair)
        const tempClient=await MarginfiClient.fetch(config,dummy,conn)
        // Simuliere Account für deposit IX
        tx=new Transaction()
        const{blockhash}=await conn.getLatestBlockhash()
        tx.recentBlockhash=blockhash
        tx.feePayer=auth
        if(createIxs.instructions)tx.add(...createIxs.instructions)
      }else{
        if(action==='deposit'){
          const depositIx=await mfAcc.makeDepositIx(amount,bank)
          tx=new Transaction()
          const{blockhash}=await conn.getLatestBlockhash()
          tx.recentBlockhash=blockhash
          tx.feePayer=auth
          tx.add(...depositIx.instructions)
        }else if(action==='withdraw'){
          const withdrawIx=await mfAcc.makeWithdrawIx(amount,bank)
          tx=new Transaction()
          const{blockhash}=await conn.getLatestBlockhash()
          tx.recentBlockhash=blockhash
          tx.feePayer=auth
          tx.add(...withdrawIx.instructions)
        }
      }

      return res.status(200).json({
        transaction:tx.serialize({requireAllSignatures:false,verifySignatures:false}).toString('base64')
      })
    }catch(e){return res.status(500).json({error:e.message})}
  }
  res.status(405).end()
}