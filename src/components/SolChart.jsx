import { useState, useEffect } from 'react'

export default function SolChart({ currentPrice }) {
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=1&interval=hourly')
        const d = await r.json()
        const pts = d.prices.map(p => p[1])
        if (currentPrice) pts.push(currentPrice)
        setPrices(pts)
      } catch(e) {}
      setLoading(false)
    }
    load()
    const iv = setInterval(load, 60000)
    return () => clearInterval(iv)
  }, [currentPrice])

  if (loading || prices.length < 2) return (
    <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem',border:'1px solid rgba(0,255,255,0.15)',height:'120px',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <span style={{color:'#444',fontFamily:'Share Tech Mono,monospace',fontSize:'0.7rem'}}>CHART LADEN...</span>
    </div>
  )

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const up = prices[prices.length-1] >= prices[0]
  const color = up ? '#00ff88' : '#ff2244'
  const W = 380
  const H = 120
  const PAD = 4
  const barW = Math.max(2, Math.floor((W - PAD * 2) / prices.length) - 1)

  return (
    <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.5rem',border:'1px solid rgba(' + (up?'0,255,136':'255,34,68') + ',0.2)'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'0.2rem'}}>
        <span style={{fontSize:'0.6rem',color:'#444',fontFamily:'Share Tech Mono,monospace'}}>SOL 24H</span>
        <span style={{fontSize:'0.6rem',color:color,fontFamily:'Share Tech Mono,monospace'}}>{'$' + max.toFixed(2) + ' H  $' + min.toFixed(2) + ' L'}</span>
      </div>
      <svg width="100%" viewBox={'0 0 ' + W + ' ' + H} preserveAspectRatio="none" style={{display:'block'}}>
        {prices.map((p, i) => {
          const x = PAD + (i / (prices.length - 1)) * (W - PAD * 2)
          const barH = ((p - min) / range) * (H - PAD * 2)
          return <rect key={i} x={x - barW/2} y={H - PAD - barH} width={barW} height={barH} fill={color} opacity="0.8"/>
        })}
        {currentPrice && <text x={PAD+5} y={PAD+22} textAnchor="start" fill="#ffffff" fontSize="22" fontFamily="Share Tech Mono,monospace" fontWeight="bold">{'$' + currentPrice.toFixed(2)}</text>}
      </svg>
    </div>
  )
}