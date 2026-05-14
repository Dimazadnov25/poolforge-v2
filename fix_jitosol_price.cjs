const fs = require('fs')

// ── usePool.js: jitoSolPrice State + Fetch hinzufügen ──
const hookFile = 'src/hooks/usePool.js'
let h = fs.readFileSync(hookFile, 'utf8')

h = h.replace(
  "  const [jitoSolBalance, setJitoSolBalance] = useState(null)",
  "  const [jitoSolBalance, setJitoSolBalance] = useState(null)\n  const [jitoSolPrice, setJitoSolPrice] = useState(null)"
)

// JitoSOL Preis via Jupiter fetchen
h = h.replace(
  "        setJitoSolBalance(jitoAmt)",
  `        setJitoSolBalance(jitoAmt)
        // JitoSOL Preis via Jupiter
        const jitoPrice = await fetch('https://lite-api.jup.ag/price/v2?ids=J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn')
        const jitoPriceData = await jitoPrice.json()
        const jitoUsdPrice = parseFloat(jitoPriceData?.data?.['J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn']?.price || 0)
        if (jitoUsdPrice > 0) setJitoSolPrice(jitoUsdPrice)`
)

h = h.replace(
  "    poolState, solPrice, solBalance, usdcBalance, jitoSolBalance,",
  "    poolState, solPrice, solBalance, usdcBalance, jitoSolBalance, jitoSolPrice,"
)

fs.writeFileSync(hookFile, h)
console.log('✅ usePool.js: jitoSolPrice hinzugefügt')

// ── PoolDashboard.jsx: jitoSolPrice verwenden ──
const dashFile = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(dashFile, 'utf8')

c = c.replace(
  "{pool.jitoSolBalance ? (pool.jitoSolBalance * pool.solPrice).toFixed(2) : '0.00'}",
  "{pool.jitoSolBalance && pool.jitoSolPrice ? (pool.jitoSolBalance * pool.jitoSolPrice).toFixed(2) : '0.00'}"
)

// useEffect Baseline auch auf jitoSolPrice umstellen
c = c.replace(
  "    const current = pool.jitoSolBalance * pool.solPrice",
  "    const current = pool.jitoSolBalance * (pool.jitoSolPrice || pool.solPrice)"
)
c = c.replace(
  "  }, [pool.jitoSolBalance, pool.solPrice])",
  "  }, [pool.jitoSolBalance, pool.jitoSolPrice])"
)

fs.writeFileSync(dashFile, c)
console.log('✅ PoolDashboard.jsx: jitoSolPrice verwendet')