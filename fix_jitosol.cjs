const fs = require('fs')

// ── 1. usePool.js ──────────────────────────────────────────────
const hookFile = 'src/hooks/usePool.js'
let h = fs.readFileSync(hookFile, 'utf8')

// JitoSOL Balance State hinzufügen
h = h.replace(
  "  const [usdcBalance, setUsdcBalance] = useState(null)",
  "  const [usdcBalance, setUsdcBalance] = useState(null)\n  const [jitoSolBalance, setJitoSolBalance] = useState(null)"
)

// JitoSOL in refreshBalances fetchen
h = h.replace(
  "      setUsdcBalance(usdcAmt)",
  `      setUsdcBalance(usdcAmt)
      // JitoSOL Balance
      const JITOSOL_MINT = 'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'
      try {
        const jitoAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, { mint: new (require('@solana/web3.js').PublicKey)(JITOSOL_MINT) })
        const jitoAmt = jitoAccounts.value[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0
        setJitoSolBalance(jitoAmt)
      } catch(e) { setJitoSolBalance(0) }`
)

// jitoSolBalance im return hinzufügen
h = h.replace(
  "    poolState, solPrice, solBalance, usdcBalance,",
  "    poolState, solPrice, solBalance, usdcBalance, jitoSolBalance,"
)

fs.writeFileSync(hookFile, h)
console.log('✅ usePool.js: jitoSolBalance hinzugefügt')

// ── 2. PoolDashboard.jsx ───────────────────────────────────────
const dashFile = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(dashFile, 'utf8')

// State + Ref für JitoSOL Trend
c = c.replace(
  "  const [usdcWalletTrend, setUsdcWalletTrend] = useState(null)\n  const prevUsdcWalletValue = useRef(null)",
  "  const [usdcWalletTrend, setUsdcWalletTrend] = useState(null)\n  const prevUsdcWalletValue = useRef(null)\n  const [jitoSolTrend, setJitoSolTrend] = useState(null)\n  const prevJitoSolValue = useRef(null)"
)

// JitoSOL useEffect nach USDC useEffect einfügen
const usdcEffectEnd = "  }, [pool.usdcBalance])"
const jitoEffect = `\n\n  useEffect(() => {
    if (pool.jitoSolBalance === undefined || !pool.solPrice) return
    const current = pool.jitoSolBalance * pool.solPrice
    if (current === 0) return
    const stored = parseFloat(localStorage.getItem('jitoSolBaseline') || '0')
    if (!stored || stored === 0) {
      localStorage.setItem('jitoSolBaseline', current.toString())
      prevJitoSolValue.current = current
    } else {
      prevJitoSolValue.current = stored
      const pct = ((current - stored) / stored) * 100
      setJitoSolTrend(pct)
    }
  }, [pool.jitoSolBalance, pool.solPrice])`

c = c.replace(usdcEffectEnd, usdcEffectEnd + jitoEffect)

// JitoSOL Kasten + MAX SOL Button nach SOL Wallet Kasten einfügen
const solWalletEnd = `        )}`
const jitoBox = `\n\n        {pool.solPrice && (\n          <div style={{background:'#111',borderRadius:'0.6rem',padding:'0.6rem 0.5rem',border:'1px solid rgba(153,69,255,0.4)'}}>\n            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>\n              <div style={{fontSize:'0.65rem',color:'#9945FF',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>JitoSOL</div>\n              <button onClick={async()=>{\n                const maxSol = Math.max(0, (parseFloat(pool.solBalance||0) - 0.03))\n                if(maxSol<=0) return\n                window.open('https://jup.ag/swap/SOL-JitoSOL?inAmount='+maxSol,'_blank')\n              }} style={{fontSize:'0.6rem',padding:'0.15rem 0.4rem',borderRadius:'3px',border:'1px solid #9945FF',background:'rgba(153,69,255,0.1)',color:'#9945FF',cursor:'pointer',fontFamily:'Share Tech Mono,monospace'}}>MAX SOL → JitoSOL</button>\n            </div>\n            <div style={{fontSize:'2.2rem',fontWeight:700,color:'#9945FF',fontFamily:'Rajdhani,sans-serif'}}>\n              <span>{pool.jitoSolBalance ? (pool.jitoSolBalance * pool.solPrice).toFixed(2) : '0.00'}</span>\n              {jitoSolTrend !== null && <span style={{fontSize:'0.85rem',fontWeight:700,marginLeft:'0.4rem',fontFamily:'Share Tech Mono,monospace',color:jitoSolTrend>=0?'#00ff88':'#ff2244'}}>{jitoSolTrend>=0?'+':''}{jitoSolTrend.toFixed(2)}%</span>}\n            </div>\n            <div style={{fontSize:'0.7rem',color:'#888',fontFamily:'Share Tech Mono,monospace'}}>{pool.jitoSolBalance ? pool.jitoSolBalance.toFixed(4) : '0.0000'} JitoSOL</div>\n          </div>\n        )}`

// Nach dem SOL Wallet Kasten einfügen
const solWalletBlock = `        {pool.solBalance !== undefined && pool.solPrice && (`
const solWalletCloseIdx = c.indexOf(solWalletBlock)
const closingIdx = c.indexOf('\n        )}', solWalletCloseIdx) + '\n        )}'.length
c = c.substring(0, closingIdx) + jitoBox + c.substring(closingIdx)

fs.writeFileSync(dashFile, c)
console.log('✅ PoolDashboard.jsx: JitoSOL Kasten eingefügt')