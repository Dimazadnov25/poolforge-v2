const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// useEffect mit pool.refreshBalances ans Ende der Hook-Deklarationen verschieben
c = c.replace(
  `        // Balance alle 3 Sekunden aktualisieren
        useEffect(() => {
          const iv = setInterval(() => {
            if (pool.refreshBalances) pool.refreshBalances()
          }, 3000)
          return () => clearInterval(iv)
        }, [pool.refreshBalances])

        const wallet = useWallet()
        const pool = usePool()`,
  `        const wallet = useWallet()
        const pool = usePool()

        // Balance alle 3 Sekunden aktualisieren
        useEffect(() => {
          const iv = setInterval(() => {
            if (pool.refreshBalances) pool.refreshBalances()
          }, 3000)
          return () => clearInterval(iv)
        }, [pool.refreshBalances])`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ pool Reihenfolge gefixt')