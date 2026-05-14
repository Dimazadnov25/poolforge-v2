const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const oldEffect = `  useEffect(() => {
    if (pool.solBalance === undefined || !pool.solPrice) return
    const current = parseFloat(pool.solBalance || 0) * pool.solPrice
    if (current === 0) return
    if (prevSolWalletValue.current === null) {
      prevSolWalletValue.current = current
    } else {
      const pct = ((current - prevSolWalletValue.current) / prevSolWalletValue.current) * 100
      setSolWalletTrend(pct)
    }
  }, [pool.solBalance, pool.solPrice])`

const newEffect = `  useEffect(() => {
    if (pool.solBalance === undefined || !pool.solPrice) return
    const current = parseFloat(pool.solBalance || 0) * pool.solPrice
    if (current === 0) return
    const stored = parseFloat(localStorage.getItem('solWalletBaseline') || '0')
    if (!stored || stored === 0) {
      localStorage.setItem('solWalletBaseline', current.toString())
      prevSolWalletValue.current = current
    } else {
      prevSolWalletValue.current = stored
      const pct = ((current - stored) / stored) * 100
      setSolWalletTrend(pct)
    }
  }, [pool.solBalance, pool.solPrice])`

if (!c.includes(oldEffect)) {
  console.log('❌ nicht gefunden')
  process.exit(1)
}

c = c.replace(oldEffect, newEffect)
fs.writeFileSync(file, c)
console.log('✅ Baseline in localStorage gespeichert')