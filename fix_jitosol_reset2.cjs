const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "  const handlePositionUpdate = useCallback",
  `  const resetJitoBaseline = useCallback(() => {
    if (!pool.jitoSolBalance || !pool.jitoSolPrice) return
    const current = pool.jitoSolBalance * pool.jitoSolPrice
    localStorage.setItem('jitoSolBaseline', current.toString())
    prevJitoSolValue.current = current
    setJitoSolTrend(null)
  }, [pool.jitoSolBalance, pool.jitoSolPrice])

  const handlePositionUpdate = useCallback`
)

c = c.replace(
  "onClick={()=>{ localStorage.removeItem('jitoSolBaseline'); window.location.reload() }}",
  "onClick={resetJitoBaseline}"
)

fs.writeFileSync(file, c)
console.log('✅ Reset Funktion korrigiert')