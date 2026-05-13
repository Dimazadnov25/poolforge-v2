const fs = require('fs')

const component = `import { useState, useEffect, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, Keypair, Transaction } from '@solana/web3.js'

const API = '/api/raydium'
const TICK_SPACING = 10

function tickToPrice(tick) {
  return Math.pow(1.0001, tick) * 1000
}

function priceToTick(price) {
  return Math.floor(Math.log(price / 1000) / Math.log(1.0001))
}

export default function RaydiumDashboard() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [poolState, setPoolState] = useState(null)
  const [positions, setPositions] = useState([])
  const [solAmount, setSolAmount] = useState('')
  const [usdcAmount, setUsdcAmount] = useState('')
  const [rangePercent, setRangePercent] = useState(2)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  // Pool State laden
  useEffect(() => {
    fetch(API).then(r => r.json()).then(setPoolState).catch(console.error)
    const iv = setInterval(() => {
      fetch(API).then(r => r.json()).then(setPoolState).catch(console.error)
    }, 30000)
    return () => clearInterval(iv)
  }, [])

  // Positionen aus localStorage laden
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('raydium_positions') || '[]')
      setPositions(saved)
    } catch(e) {}
  }, [])

  const savePosition = (pos) => {
    const updated = [...positions, pos]
    setPositions(updated)
    localStorage.setItem('raydium_positions', JSON.stringify(updated))
  }

  const removePosition = (nftMint) => {
    const updated = positions.filter(p => p.nftMint !== nftMint)
    setPositions(updated)
    localStorage.setItem('raydium_positions', JSON.stringify(updated))
  }

  const sendTx = async (base64Tx, signers = []) => {
    const txBuf = Buffer.from(base64Tx, 'base64')
    const tx = Transaction.from(txBuf)
    if (signers.length > 0) tx.partialSign(...signers)
    const signed = await wallet.signTransaction(tx)
    const sig = await connection.sendRawTransaction(signed.serialize())
    await connection.confirmTransaction(sig, 'confirmed')
    return sig
  }

  const openPosition = useCallback(async () => {
    if (!wallet.connected || !poolState) return
    setLoading(true); setStatus('Position wird geoeffnet...')
    try {
      const price = parseFloat(poolState.price)
      const priceLower = price * (1 - rangePercent / 100)
      const priceUpper = price * (1 + rangePercent / 100)
      const tickLower = Math.floor(priceToTick(priceLower) / TICK_SPACING) * TICK_SPACING
      const tickUpper = Math.ceil(priceToTick(priceUpper)  / TICK_SPACING) * TICK_SPACING

      // Neues NFT Keypair generieren
      const nftKeypair = Keypair.generate()
      const nftMint = nftKeypair.publicKey.toBase58()

      setStatus('TX1: Position oeffnen...')
      const r1 = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'openPosition', wallet: wallet.publicKey.toBase58(), nftMint, tickLower, tickUpper })
      })
      const d1 = await r1.json()
      if (d1.error) throw new Error(d1.error)
      const sig1 = await sendTx(d1.tx, [nftKeypair])
      setStatus('TX1 bestaetigt! Warte 3s...')
      await new Promise(r => setTimeout(r, 3000))

      setStatus('TX2: Liquiditaet hinzufuegen...')
      const solLamports  = Math.floor(parseFloat(solAmount  || '0') * 1e9)
      const usdcLamports = Math.floor(parseFloat(usdcAmount || '0') * 1e6)
      const r2 = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'addLiquidity',
          wallet: wallet.publicKey.toBase58(),
          nftMint, positionPDA: d1.positionPDA,
          tickLower, tickUpper,
          liquidityAmount: '1000000',
          amount0Max: solLamports.toString(),
          amount1Max: usdcLamports.toString()
        })
      })
      const d2 = await r2.json()
      if (d2.error) throw new Error(d2.error)
      const sig2 = await sendTx(d2.tx)

      savePosition({ nftMint, positionPDA: d1.positionPDA, tickLower, tickUpper, openedAt: Date.now() })
      setStatus('✅ Position geoeffnet! ' + sig2.slice(0,8) + '...')
      setSolAmount(''); setUsdcAmount('')
    } catch(e) {
      setStatus('❌ Fehler: ' + e.message)
    } finally { setLoading(false) }
  }, [wallet, poolState, solAmount, usdcAmount, rangePercent])

  const collectFees = useCallback(async (pos) => {
    if (!wallet.connected) return
    setLoading(true); setStatus('Fees werden geclaimed...')
    try {
      const r = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'collectFees', wallet: wallet.publicKey.toBase58(), nftMint: pos.nftMint, positionPDA: pos.positionPDA })
      })
      const d = await r.json()
      if (d.error) throw new Error(d.error)
      await sendTx(d.tx)
      setStatus('✅ Fees geclaimed!')
    } catch(e) { setStatus('❌ ' + e.message) }
    finally { setLoading(false) }
  }, [wallet])

  const rebalance = useCallback(async (pos) => {
    if (!wallet.connected || !poolState) return
    setLoading(true)
    try {
      // Schritt 1: Fees clamen
      setStatus('⚡ Rebalance 1/4: Fees clamen...')
      const r1 = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'collectFees', wallet:wallet.publicKey.toBase58(), nftMint:pos.nftMint, positionPDA:pos.positionPDA }) })
      const d1 = await r1.json()
      if (!d1.error) await sendTx(d1.tx)
      await new Promise(r => setTimeout(r, 2000))

      // Schritt 2: Position schliessen
      setStatus('⚡ Rebalance 2/4: Position schliessen...')
      const r2 = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'closePosition', wallet:wallet.publicKey.toBase58(), nftMint:pos.nftMint, positionPDA:pos.positionPDA }) })
      const d2 = await r2.json()
      if (d2.error) throw new Error(d2.error)
      await sendTx(d2.tx)
      removePosition(pos.nftMint)
      await new Promise(r => setTimeout(r, 2000))

      // Schritt 3: Neue Position um aktuellen Preis
      setStatus('⚡ Rebalance 3/4: Neue Position oeffnen...')
      const price = parseFloat(poolState.price)
      const priceLower = price * (1 - rangePercent / 100)
      const priceUpper = price * (1 + rangePercent / 100)
      const tickLower = Math.floor(priceToTick(priceLower) / TICK_SPACING) * TICK_SPACING
      const tickUpper = Math.ceil(priceToTick(priceUpper)  / TICK_SPACING) * TICK_SPACING
      const nftKeypair = Keypair.generate()
      const nftMint = nftKeypair.publicKey.toBase58()

      const r3 = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'openPosition', wallet:wallet.publicKey.toBase58(), nftMint, tickLower, tickUpper }) })
      const d3 = await r3.json()
      if (d3.error) throw new Error(d3.error)
      await sendTx(d3.tx, [nftKeypair])
      await new Promise(r => setTimeout(r, 3000))

      // Schritt 4: Liquiditaet wieder rein
      setStatus('⚡ Rebalance 4/4: Liquiditaet hinzufuegen...')
      const r4 = await fetch(API, { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'addLiquidity', wallet:wallet.publicKey.toBase58(),
          nftMint, positionPDA: d3.positionPDA, tickLower, tickUpper,
          liquidityAmount:'1000000', amount0Max:'999999999999', amount1Max:'999999999999' }) })
      const d4 = await r4.json()
      if (d4.error) throw new Error(d4.error)
      await sendTx(d4.tx)

      savePosition({ nftMint, positionPDA: d3.positionPDA, tickLower, tickUpper, openedAt: Date.now() })
      setStatus('✅ Rebalance abgeschlossen!')
    } catch(e) { setStatus('❌ Rebalance Fehler: ' + e.message) }
    finally { setLoading(false) }
  }, [wallet, poolState, rangePercent])

  const isInRange = (pos) => {
    if (!poolState) return true
    return poolState.tickCurrent >= pos.tickLower && poolState.tickCurrent <= pos.tickUpper
  }

  const style = {
    box: { border:'1px solid rgba(0,255,255,0.3)', background:'rgba(0,255,255,0.05)', borderRadius:'6px', padding:'1rem', marginBottom:'0.5rem' },
    label: { fontSize:'0.65rem', color:'#aaa', fontFamily:'Share Tech Mono,monospace', textTransform:'uppercase' },
    value: { fontSize:'1.2rem', color:'#00ffff', fontFamily:'Rajdhani,sans-serif', fontWeight:700 },
    btn: { background:'rgba(0,255,255,0.1)', border:'1px solid rgba(0,255,255,0.4)', color:'#00ffff', borderRadius:'4px', padding:'0.4rem 0.8rem', cursor:'pointer', fontFamily:'Share Tech Mono,monospace', fontSize:'0.75rem', marginRight:'0.4rem' },
    btnRed: { background:'rgba(255,50,50,0.1)', border:'1px solid rgba(255,50,50,0.4)', color:'#ff4444', borderRadius:'4px', padding:'0.4rem 0.8rem', cursor:'pointer', fontFamily:'Share Tech Mono,monospace', fontSize:'0.75rem', marginRight:'0.4rem' },
    input: { background:'rgba(0,0,0,0.3)', border:'1px solid rgba(0,255,255,0.3)', color:'#00ffff', borderRadius:'4px', padding:'0.3rem 0.6rem', width:'100%', fontFamily:'Share Tech Mono,monospace', marginBottom:'0.5rem' },
  }

  return (
    <div style={{...style.box, borderColor:'rgba(255,170,0,0.4)'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.8rem'}}>
        <span style={{color:'#ffaa00', fontFamily:'Rajdhani,sans-serif', fontWeight:700, fontSize:'1.1rem'}}>⚡ RAYDIUM CLMM</span>
        {poolState && <span style={{...style.value, fontSize:'0.9rem'}}>${parseFloat(poolState.price).toFixed(2)}</span>}
      </div>

      {/* Pool Info */}
      {poolState && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.4rem', marginBottom:'0.8rem'}}>
          <div style={style.box}>
            <div style={style.label}>Tick Current</div>
            <div style={{...style.value, fontSize:'0.9rem'}}>{poolState.tickCurrent}</div>
          </div>
          <div style={style.box}>
            <div style={style.label}>Tick Spacing</div>
            <div style={{...style.value, fontSize:'0.9rem'}}>{poolState.tickSpacing}</div>
          </div>
        </div>
      )}

      {/* Position oeffnen */}
      {wallet.connected && (
        <div style={{...style.box, borderColor:'rgba(0,255,100,0.3)'}}>
          <div style={{...style.label, marginBottom:'0.5rem'}}>Position oeffnen</div>
          <div style={{display:'flex', gap:'0.4rem', marginBottom:'0.5rem'}}>
            {[1,2,3,5].map(p => (
              <button key={p} style={{...style.btn, borderColor: rangePercent===p ? '#00ffff' : 'rgba(0,255,255,0.2)', background: rangePercent===p ? 'rgba(0,255,255,0.2)' : 'transparent'}}
                onClick={() => setRangePercent(p)}>±{p}%</button>
            ))}
          </div>
          <input style={style.input} placeholder="SOL Betrag" value={solAmount} onChange={e => setSolAmount(e.target.value)} />
          <input style={style.input} placeholder="USDC Betrag" value={usdcAmount} onChange={e => setUsdcAmount(e.target.value)} />
          <button style={{...style.btn, width:'100%'}} onClick={openPosition} disabled={loading}>
            {loading ? '...' : '+ Position oeffnen'}
          </button>
        </div>
      )}

      {/* Positionen */}
      {positions.map(pos => (
        <div key={pos.nftMint} style={{...style.box, borderColor: isInRange(pos) ? 'rgba(0,255,100,0.4)' : 'rgba(255,50,50,0.4)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.4rem'}}>
            <span style={{...style.label}}>{pos.nftMint.slice(0,8)}...</span>
            <span style={{fontSize:'0.7rem', color: isInRange(pos) ? '#00ff88' : '#ff4444', fontWeight:700}}>
              {isInRange(pos) ? '● IN RANGE' : '⚠ OUT OF RANGE'}
            </span>
          </div>
          <div style={{fontSize:'0.75rem', color:'#aaa', fontFamily:'Share Tech Mono,monospace', marginBottom:'0.6rem'}}>
            Ticks: {pos.tickLower} → {pos.tickUpper}
          </div>
          <div style={{display:'flex', gap:'0.4rem'}}>
            <button style={style.btn} onClick={() => collectFees(pos)} disabled={loading}>Fees clamen</button>
            <button style={{...style.btn, borderColor:'rgba(255,170,0,0.4)', color:'#ffaa00',
              background: !isInRange(pos) ? 'rgba(255,170,0,0.15)' : 'transparent'}}
              onClick={() => rebalance(pos)} disabled={loading}>
              ⚡ Rebalance
            </button>
            <button style={style.btnRed} onClick={() => removePosition(pos.nftMint)}>✕</button>
          </div>
        </div>
      ))}

      {status && <div style={{...style.label, color: status.startsWith('✅') ? '#00ff88' : status.startsWith('❌') ? '#ff4444' : '#ffaa00', marginTop:'0.5rem'}}>{status}</div>}
    </div>
  )
}
`

fs.writeFileSync('src/components/RaydiumDashboard.jsx', component)
console.log('✅ RaydiumDashboard.jsx erstellt')