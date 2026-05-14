const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// 1. useRef zum Import hinzufügen
c = c.replace(
  "import { useState, useCallback, useEffect } from 'react'",
  "import { useState, useCallback, useEffect, useRef } from 'react'"
)

// 2. RaydiumDashboard import entfernen (noch drin)
c = c.replace("import RaydiumDashboard from './RaydiumDashboard'\r\n", '')

// 3. Nach den State-Deklarationen useRef + useEffect für SOL-Wert-Trend einfügen
const oldState = 'const [positionData, setPositionData] = useState({})'
const newState = `const [positionData, setPositionData] = useState({})
  const [solWalletTrend, setSolWalletTrend] = useState(null)
  const prevSolWalletValue = useRef(null)`
c = c.replace(oldState, newState)

// 4. useEffect der den Trend berechnet wenn Balance+Preis sich ändern
const oldEffect = 'const wallet = useWallet()'
const newEffect = `const wallet = useWallet()

  useEffect(() => {
    if (pool.solBalance === undefined || !pool.solPrice) return
    const current = parseFloat(pool.solBalance || 0) * pool.solPrice
    if (prevSolWalletValue.current !== null && prevSolWalletValue.current !== 0) {
      const pct = ((current - prevSolWalletValue.current) / prevSolWalletValue.current) * 100
      setSolWalletTrend(pct)
    }
    prevSolWalletValue.current = current
  }, [pool.solBalance, pool.solPrice])`
c = c.replace(oldEffect, newEffect)

// 5. Trend-Anzeige im SOL Wallet Kasten ersetzen (solTrend -> solWalletTrend)
c = c.replace(
  '{solTrend !== null && <div style={{fontSize:\'0.85rem\',fontWeight:700,fontFamily:\'Share Tech Mono,monospace\',color:solTrend>=0?\'#00ff88\':\'#ff2244\'}}>{solTrend>=0?\'+\':\'\'}{solTrend.toFixed(2)}%</div>}',
  '{solWalletTrend !== null && <div style={{fontSize:\'0.85rem\',fontWeight:700,fontFamily:\'Share Tech Mono,monospace\',color:solWalletTrend>=0?\'#00ff88\':\'#ff2244\'}}>{solWalletTrend>=0?\'+\':\'\'}{solWalletTrend.toFixed(2)}%</div>}'
)

fs.writeFileSync(file, c)
console.log('✅ SOL Wallet Trend eingefügt')