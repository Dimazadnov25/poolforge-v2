import { useState, useEffect } from 'react'

export default function SolChart({ currentPrice }) {
  const [candles, setCandles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('https://api.coingecko.com/api/v3/coins/solana/ohlc?vs_currency=usd&days=1')
        const d = await r.json()
        setCandles(d)
      } catch(e) {}
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 60000)
    return () => clearInterval(iv)
  }, [])

  if (loading || candles.length < 2) return (
    <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem',border:'1px solid rgba(0,255,255,0.15)',height:'140px',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <span style={{color:'#444',fontFamily:'Share Tech Mono,monospace',fontSize:'0.7rem'}}>CHART LADEN...</span>
    </div>
  )

  const W = 380, H = 130, PAD = 4
  const allPrices = candles.flatMap(c => [c[2], c[3]])
  const min = Math.min(...allPrices)
  const max = Math.max(...allPrices)
  const range = max - min || 1
  const lastClose = candles[candles.length-1][4]
  const firstOpen = candles[0][1]
  const up = (currentPrice || lastClose) >= firstOpen
  const candleW = Math.max(3, Math.floor((W - PAD*2) / candles.length) - 1)

  const toY = p => H - PAD - ((p - min) / range) * (H - PAD*2)

  return (
    <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.5rem',border:'1px solid rgba(' + (up?'0,255,136':'255,34,68') + ',0.2)'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.2rem'}}>
        <span style={{fontSize:'0.6rem',color:'#444',fontFamily:'Share Tech Mono,monospace'}}>SOL 24H</span>
        <span style={{fontSize:'0.85rem',color:'#ffffff',fontFamily:'Share Tech Mono,monospace',fontWeight:'bold'}}>{'$'+max.toFixed(2)+' H  $'+min.toFixed(2)+' L'}</span>
      </div>
      <svg width="100%" viewBox={'0 0 '+W+' '+H} preserveAspectRatio="none" style={{display:'block'}}>
        {candles.map((c, i) => {
          const x = PAD + (i / (candles.length-1)) * (W - PAD*2)
          const open = c[1], high = c[2], low = c[3], close = c[4]
          const isGreen = close >= open
          const color = isGreen ? '#00ff88' : '#ff2244'
          const bodyTop = toY(Math.max(open, close))
          const bodyBot = toY(Math.min(open, close))
          const bodyH = Math.max(1, bodyBot - bodyTop)
          return (
            <g key={i}>
              <line x1={x} y1={toY(high)} x2={x} y2={toY(low)} stroke={color} strokeWidth="1"/>
              <rect x={x - candleW/2} y={bodyTop} width={candleW} height={bodyH} fill={color}/>
            </g>
          )
        })}
        {currentPrice && <text x={PAD+5} y={PAD+22} textAnchor="start" fill="#ffffff" fontSize="22" fontFamily="Share Tech Mono,monospace" fontWeight="bold">{'$'+currentPrice.toFixed(2)}</text>}
      </svg>
    </div>
  )
}