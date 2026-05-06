const fs = require('fs')

// 1. PoolDashboard - Zahlen größer + Balance jede Sekunde refreshen
let pd = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Balance jede 3 Sekunden aktualisieren
pd = pd.replace(
  `const iv = setInterval(fetchVolume, 60000)
    return () => clearInterval(iv)
  }, [])`,
  `const iv = setInterval(fetchVolume, 60000)
    return () => clearInterval(iv)
  }, [])

  // Balance alle 3 Sekunden aktualisieren
  useEffect(() => {
    const iv = setInterval(() => {
      if (pool.refreshBalances) pool.refreshBalances()
    }, 3000)
    return () => clearInterval(iv)
  }, [pool.refreshBalances])`
)

// SOL Preis größer
pd = pd.replace(
  `fontSize:'1.2rem', fontWeight:700, color:'#06b6d4'`,
  `fontSize:'1.5rem', fontWeight:700, color:'#06b6d4', fontFamily:'Orbitron, monospace'`
)

// Vol größer
pd = pd.replace(
  `fontSize:'1.2rem', fontWeight:700, color:'#10b981'`,
  `fontSize:'1.5rem', fontWeight:700, color:'#10b981', fontFamily:'Orbitron, monospace'`
)

// Balances größer
pd = pd.replace(
  `fontSize:'0.8rem', fontWeight:600, color:'#e2e8f0', lineHeight:1.4`,
  `fontSize:'1rem', fontWeight:600, color:'#e2e8f0', lineHeight:1.4, fontFamily:'Orbitron, monospace'`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', pd)
console.log('✅ Zahlen größer + Balance-Refresh')

// 2. usePool Hook - refreshBalances Funktion hinzufügen
let hook = fs.readFileSync('src/hooks/usePool.js', 'utf8')

if (!hook.includes('refreshBalances')) {
  // fetchBalances Funktion suchen und refreshBalances als Alias exportieren
  hook = hook.replace(
    /return \{([^}]+)\}/,
    m => m.replace('}', '  refreshBalances: fetchBalances,\n}')
  )
  fs.writeFileSync('src/hooks/usePool.js', hook)
  console.log('✅ refreshBalances in usePool exportiert')
} else {
  console.log('ℹ️ refreshBalances bereits vorhanden')
}