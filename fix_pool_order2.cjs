const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Alles zwischen "export default function" und "return (" neu ordnen
const volumeHook = `
  const [solVolume, setSolVolume] = useState(null)
  const [swapSuggest, setSwapSuggest] = useState(null)
  const [positionData, setPositionData] = useState({})

  const wallet = useWallet()
  const pool = usePool()

  useEffect(() => {
    const fetchVolume = async () => {
      try {
        const r = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT')
        const d = await r.json()
        if (d.quoteVolume) setSolVolume(parseFloat(d.quoteVolume))
      } catch(e) {}
    }
    fetchVolume()
    const iv = setInterval(fetchVolume, 60000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => {
      if (pool.refreshBalances) pool.refreshBalances()
    }, 3000)
    return () => clearInterval(iv)
  }, [pool.refreshBalances])

  const handlePositionUpdate = useCallback((mint, details) => {
    setPositionData(prev => ({ ...prev, [mint]: details }))
  }, [])
`

// Alles von Anfang der Funktion bis return ( ersetzen
c = c.replace(
  /export default function PoolDashboard\(\) \{[\s\S]+?(?=  return \()/,
  `export default function PoolDashboard() {${volumeHook}\n`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Reihenfolge gefixt')

// Verify
const check = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
const poolLine = check.indexOf('const pool = usePool()')
const effectLine = check.indexOf('pool.refreshBalances')
console.log('pool deklariert bei char:', poolLine)
console.log('pool.refreshBalances bei char:', effectLine)
console.log('Reihenfolge OK:', poolLine < effectLine)