import React, { useState } from 'react'

const TO = '3WFsnea3voEmLM3uUFGpMUYShP9HcVKuM2hbsoPt83Bb'
const USDC = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
const RPC = 'https://mainnet.helius-rpc.com/?api-key=7802f08f-81ab-48e9-a7e7-edccb2357cf2'

export default function SendWidget({ wallet, onRefresh }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [status, setStatus] = useState(null)

  const send = async () => {
    if (!wallet?.publicKey || !amount || parseFloat(amount) <= 0) return
    try {
      setStatus('Senden...')
      const { Connection, PublicKey, Transaction } = await import('@solana/web3.js')
      const { getAssociatedTokenAddress, createTransferInstruction } = await import('@solana/spl-token')
      const conn = new Connection(RPC, 'confirmed')
      const usdcMint = new PublicKey(USDC)
      const fromAta = await getAssociatedTokenAddress(usdcMint, wallet.publicKey)
      const toAta = await getAssociatedTokenAddress(usdcMint, new PublicKey(TO))
      const tx = new Transaction().add(createTransferInstruction(fromAta, toAta, wallet.publicKey, Math.floor(parseFloat(amount) * 1e6)))
      tx.feePayer = wallet.publicKey
      tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash
      const signed = await wallet.signTransaction(tx)
      const sig = await conn.sendRawTransaction(signed.serialize())
      await conn.confirmTransaction(sig)
      setStatus('✅ Gesendet!')
      setAmount('')
      if (onRefresh) onRefresh()
      setTimeout(() => { setOpen(false); setStatus(null) }, 2000)
    } catch(e) { setStatus('❌ ' + e.message) }
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} style={{width:'100%',padding:'0.5rem',borderRadius:'0.6rem',border:'1px solid rgba(0,255,255,0.3)',background:'#111',color:'#00ffff',cursor:'pointer',fontFamily:'Orbitron,monospace',fontWeight:700,fontSize:'0.9rem'}}>SEND USDC</button>
  )

  return (
    <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.75rem',border:'1px solid rgba(0,255,255,0.3)'}}>
      <div style={{fontSize:'0.65rem',color:'#ff2244',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace',marginBottom:'0.4rem'}}>SEND USDC</div>
      <div style={{fontSize:'0.55rem',color:'#555',fontFamily:'Share Tech Mono,monospace',marginBottom:'0.5rem',wordBreak:'break-all'}}>{TO}</div>
      <div style={{display:'flex',gap:'0.4rem',marginBottom:'0.4rem'}}>
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="USDC Betrag" type="number" style={{flex:1,background:'#000',border:'1px solid rgba(0,255,255,0.3)',borderRadius:'4px',padding:'0.4rem 0.5rem',color:'#00ffff',fontFamily:'Share Tech Mono,monospace',fontSize:'0.9rem',outline:'none'}} />
        <button onClick={send} style={{padding:'0.4rem 0.8rem',borderRadius:'4px',border:'1px solid #00ffff',background:'rgba(0,255,255,0.1)',color:'#00ffff',cursor:'pointer',fontFamily:'Orbitron,monospace',fontWeight:700,fontSize:'0.8rem'}}>SEND</button>
        <button onClick={() => { setOpen(false); setAmount(''); setStatus(null) }} style={{padding:'0.4rem 0.6rem',borderRadius:'4px',border:'1px solid #333',background:'transparent',color:'#555',cursor:'pointer',fontSize:'0.9rem'}}>✕</button>
      </div>
      {status && <div style={{fontSize:'0.8rem',color:'#00ffff',fontFamily:'Share Tech Mono,monospace'}}>{status}</div>}
    </div>
  )
}