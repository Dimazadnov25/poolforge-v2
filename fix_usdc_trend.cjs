const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// 1. State + Ref hinzufügen
c = c.replace(
  "  const [solWalletTrend, setSolWalletTrend] = useState(null)\n  const prevSolWalletValue = useRef(null)",
  "  const [solWalletTrend, setSolWalletTrend] = useState(null)\n  const prevSolWalletValue = useRef(null)\n  const [usdcWalletTrend, setUsdcWalletTrend] = useState(null)\n  const prevUsdcWalletValue = useRef(null)"
)

// 2. useEffect für USDC Baseline nach SOL useEffect einfügen
const solEffectEnd = "  }, [pool.solBalance, pool.solPrice])"
const usdcEffect = `\n\n  useEffect(() => {
    if (pool.usdcBalance === undefined) return
    const current = parseFloat(pool.usdcBalance || 0)
    if (current === 0) return
    const stored = parseFloat(localStorage.getItem('usdcWalletBaseline') || '0')
    if (!stored || stored === 0) {
      localStorage.setItem('usdcWalletBaseline', current.toString())
      prevUsdcWalletValue.current = current
    } else {
      prevUsdcWalletValue.current = stored
      const pct = ((current - stored) / stored) * 100
      setUsdcWalletTrend(pct)
    }
  }, [pool.usdcBalance])`

c = c.replace(solEffectEnd, solEffectEnd + usdcEffect)

// 3. Trend im USDC Kasten anzeigen
c = c.replace(
  "}}>$\{parseFloat(pool.usdcBalance||0).toFixed(2)}</div>",
  "}><span>$\{parseFloat(pool.usdcBalance||0).toFixed(2)}</span>{usdcWalletTrend !== null && <span style={{fontSize:'0.85rem',fontWeight:700,marginLeft:'0.4rem',fontFamily:'Share Tech Mono,monospace',color:usdcWalletTrend>=0?'#00ff88':'#ff2244'}}>{usdcWalletTrend>=0?'+':''}{usdcWalletTrend.toFixed(2)}%</span>}</div>"
)

fs.writeFileSync(file, c)
console.log('✅ USDC Wallet Trend eingefügt')