const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// useEffect für solWalletTrend ersetzen - Basiswert beim ersten Laden speichern
const oldEffect = `  useEffect(() => {
    if (pool.solBalance === undefined || !pool.solPrice) return
    const current = parseFloat(pool.solBalance || 0) * pool.solPrice
    if (prevSolWalletValue.current !== null && prevSolWalletValue.current !== 0) {
      const pct = ((current - prevSolWalletValue.current) / prevSolWalletValue.current) * 100
      setSolWalletTrend(pct)
    }
    prevSolWalletValue.current = current
  }, [pool.solBalance, pool.solPrice])`

const newEffect = `  useEffect(() => {
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

if (!c.includes(oldEffect)) {
  console.log('❌ nicht gefunden')
  process.exit(1)
}

c = c.replace(oldEffect, newEffect)
fs.writeFileSync(file, c)
console.log('✅ Baseline-Trend eingefügt')