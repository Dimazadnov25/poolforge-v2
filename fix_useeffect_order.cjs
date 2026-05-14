const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const tvlEffect = `\r\n  useEffect(() => {\r\n    const fetchTvl = async () => {\r\n      try {\r\n        const r = await fetch('https://api.llama.fi/v2/chains')\r\n        const chains = await r.json()\r\n        const sol = chains.find(ch => ch.name === 'Solana')\r\n        if (sol?.tvl) setSolTvl(sol.tvl)\r\n      } catch(e) { console.warn('TVL fetch error', e) }\r\n    }\r\n    fetchTvl()\r\n    const id = setInterval(fetchTvl, 60000)\r\n    return () => clearInterval(id)\r\n  }, [])\r\n`

// Entferne den useEffect nach dem return
const badBlock = `\r\n  useEffect(() => {\r\n    const fetchTvl = async () => {\r\n      try {\r\n        const r = await fetch('https://api.llama.fi/v2/chains')\r\n        const chains = await r.json()\r\n        const sol = chains.find(ch => ch.name === 'Solana')\r\n        if (sol?.tvl) setSolTvl(sol.tvl)\r\n      } catch(e) { console.warn('TVL fetch error', e) }\r\n    }\r\n    fetchTvl()\r\n    const id = setInterval(fetchTvl, 60000)\r\n    return () => clearInterval(id)\r\n  }, [])\r\n}`

if (!c.includes(badBlock)) {
  console.log('❌ Block nicht gefunden')
  process.exit(1)
}

// Ersetze: useEffect nach return entfernen, nur } am Ende lassen
c = c.replace(badBlock, '\r\n}')

// Füge useEffect vor return ein
c = c.replace('  return (\r\n    <div', tvlEffect + '  return (\r\n    <div')

fs.writeFileSync(file, c)
console.log('✅ useEffect vor return verschoben')