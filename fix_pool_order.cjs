const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// pool = usePool() vor den useEffect verschieben
c = c.replace(
  "  }, [pool.solBalance, pool.solPrice])\r\n  const pool = usePool()",
  "  }, [pool.solBalance, pool.solPrice])"
)

c = c.replace(
  "  const wallet = useWallet()\r\n\r\n  useEffect(() => {\r\n    if (pool.solBalance",
  "  const wallet = useWallet()\r\n  const pool = usePool()\r\n\r\n  useEffect(() => {\r\n    if (pool.solBalance"
)

fs.writeFileSync(file, c)
console.log('✅ pool = usePool() vor useEffect verschoben')