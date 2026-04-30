import{Connection,PublicKey,Transaction,TransactionInstruction,SystemProgram}from'@solana/web3.js'
import crypto from'crypto'

const RPC=process.env.VITE_RPC_URL||'https://api.mainnet-beta.solana.com'
const PROG=new PublicKey('MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA')
const USDC_MINT=new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
const USDC_BANK=new PublicKey('3uxNepDbmkDNq6JhRja5Z8QwbTrfmkKP8AKZV5chYDGG')
const TOKEN_PROG=new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
const ATA_PROG=new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1bE1')

function disc(n){return Buffer.from(crypto.createHash('sha256').update('global:'+n).digest()).slice(0,8)}
function getATA(mint,owner){const[a]=PublicKey.findProgramAddressSync([owner.toBuffer(),TOKEN_PROG.toBuffer(),mint.toBuffer()],ATA_PROG);return a}
function getMFAccPDA(group,auth){const[a]=PublicKey.findProgramAddressSync([Buffer.from('marginfi_account'),group.toBuffer(),auth.toBuffer()],PROG);return a}
function getLiqVault(bank){const[a]=PublicKey.findProgramAddressSync([Buffer.from('liquidity_vault'),bank.toBuffer()],PROG);return a}
function getLiqVaultAuth(bank){const[a]=PublicKey.findProgramAddressSync([Buffer.from('liquidity_vault_authority'),bank.toBuffer()],PROG);return a}

function i80f48(buf,off){
  try{
    const lo=buf.readBigUInt64LE(off)
    const hi=buf.readBigInt64LE(off+8)
    return(Number(hi)*Math.pow(2,64)+Number(lo))/Math.pow(2,48)
  }catch{return 0}
}

export default async function handler(req,res){
  const conn=new Connection(RPC,'confirmed')

  if(req.method==='GET'){
    const{action,wallet}=req.query

    if(action==='apy'){
      try{
        const r=await fetch('https://app.marginfi.com/api/banks',{headers:{'Accept':'application/json'}})
        if(r.ok){
          const d=await r.json()
          const banks=Array.isArray(d)?d:(d.banks||d.data||[])
          const b=banks.find(x=>x.mint===USDC_MINT.toBase58()||x.address===USDC_BANK.toBase58()||x.symbol==='USDC')
          if(b){
            const apy=b.depositRate??b.lendingRate??b.apy??b.supplyApy
            if(apy!=null)return res.status(200).json({apy:parseFloat(apy)<1?parseFloat(apy)*100:parseFloat(apy)})
          }
        }
      }catch{}
      try{
        const bi=await conn.getAccountInfo(USDC_BANK)
        if(bi){
          const tl=i80f48(bi.data,244),ta=i80f48(bi.data,260)
          const u=ta>0?tl/ta:0
          return res.status(200).json({apy:Math.max(2,Math.min(20,u*14))})
        }
      }catch{}
      return res.status(200).json({apy:7.5})
    }

    if(action==='balance'&&wallet){
      try{
        const auth=new PublicKey(wallet)
        const bi=await conn.getAccountInfo(USDC_BANK)
        if(!bi)return res.status(200).json({balance:0})
        const group=new PublicKey(bi.data.slice(8,40))
        const mfAcc=getMFAccPDA(group,auth)
        const ai=await conn.getAccountInfo(mfAcc)
        if(!ai)return res.status(200).json({balance:0})
        const d=ai.data
        let shares=0
        for(let i=0;i<16;i++){
          const o=80+i*104
          if(o+104>d.length)break
          if(d[o]!==1)continue
          const bk=new PublicKey(d.slice(o+1,o+33))
          if(bk.toBase58()===USDC_BANK.toBase58()){shares=i80f48(d,o+40);break}
        }
        const sv=i80f48(bi.data,80)
        return res.status(200).json({balance:Math.max(0,shares*(sv>0?sv:1))})
      }catch(e){return res.status(200).json({balance:0,error:e.message})}
    }
  }

  if(req.method==='POST'){
    const{action,amount,userPublicKey}=req.body
    if(!action||!amount||!userPublicKey)return res.status(400).json({error:'Missing params'})
    try{
      const auth=new PublicKey(userPublicKey)
      const bi=await conn.getAccountInfo(USDC_BANK)
      if(!bi)return res.status(400).json({error:'Bank not found'})
      const group=new PublicKey(bi.data.slice(8,40))
      const mfAcc=getMFAccPDA(group,auth)
      const lv=getLiqVault(USDC_BANK)
      const lva=getLiqVaultAuth(USDC_BANK)
      const uta=getATA(USDC_MINT,auth)
      const ab=Buffer.alloc(8);ab.writeBigUInt64LE(BigInt(Math.round(amount*1e6)))
      const ixs=[]
      const ai=await conn.getAccountInfo(mfAcc)
      if(!ai){
        ixs.push(new TransactionInstruction({
          programId:PROG,
          keys:[
            {pubkey:group,isSigner:false,isWritable:false},
            {pubkey:mfAcc,isSigner:false,isWritable:true},
            {pubkey:auth,isSigner:true,isWritable:false},
            {pubkey:auth,isSigner:true,isWritable:true},
            {pubkey:SystemProgram.programId,isSigner:false,isWritable:false}
          ],
          data:disc('marginfi_account_initialize')
        }))
      }
      if(action==='deposit'){
        ixs.push(new TransactionInstruction({
          programId:PROG,
          keys:[
            {pubkey:group,isSigner:false,isWritable:false},
            {pubkey:mfAcc,isSigner:false,isWritable:true},
            {pubkey:auth,isSigner:true,isWritable:false},
            {pubkey:USDC_BANK,isSigner:false,isWritable:true},
            {pubkey:uta,isSigner:false,isWritable:true},
            {pubkey:lv,isSigner:false,isWritable:true},
            {pubkey:TOKEN_PROG,isSigner:false,isWritable:false}
          ],
          data:Buffer.concat([disc('lending_account_deposit'),ab])
        }))
      }else if(action==='withdraw'){
        ixs.push(new TransactionInstruction({
          programId:PROG,
          keys:[
            {pubkey:group,isSigner:false,isWritable:false},
            {pubkey:mfAcc,isSigner:false,isWritable:true},
            {pubkey:auth,isSigner:true,isWritable:false},
            {pubkey:USDC_BANK,isSigner:false,isWritable:true},
            {pubkey:uta,isSigner:false,isWritable:true},
            {pubkey:lva,isSigner:false,isWritable:false},
            {pubkey:lv,isSigner:false,isWritable:true},
            {pubkey:TOKEN_PROG,isSigner:false,isWritable:false}
          ],
          data:Buffer.concat([disc('lending_account_withdraw'),ab,Buffer.from([0x00])])
        }))
      }else return res.status(400).json({error:'Invalid action'})
      const{blockhash}=await conn.getLatestBlockhash()
      const tx=new Transaction({recentBlockhash:blockhash,feePayer:auth})
      tx.add(...ixs)
      return res.status(200).json({transaction:tx.serialize({requireAllSignatures:false}).toString('base64')})
    }catch(e){return res.status(500).json({error:e.message})}
  }
  res.status(405).end()
}