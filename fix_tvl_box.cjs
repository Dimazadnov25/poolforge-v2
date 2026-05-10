const fs = require('fs')

const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// 1) State für TVL hinzufügen — direkt nach dem ersten useState
const stateSearch = c.indexOf('const [')
const insertAfterLine = c.indexOf('\n', stateSearch) + 1
c = c.slice(0, insertAfterLine) +
  '  const [solTvl, setSolTvl] = React.useState(null)\n' +
  c.slice(insertAfterLine)

// 2) TVL Fetch in useEffect einbauen — am Anfang des ersten useEffect
const useEffectIdx = c.indexOf('useEffect(')
const useEffectBody = c.indexOf('{', useEffectIdx) + 1
const fetchTvl = `
    // TVL von DeFiLlama holen
    const fetchTvl = async () => {
      try {
        const r = await fetch('https://api.llama.fi/v2/chains')
        const chains = await r.json()
        const sol = chains.find(ch => ch.name === 'Solana')
        if (sol?.tvl) setSolTvl(sol.tvl)
      } catch(e) { console.warn('TVL fetch error', e) }
    }
    fetchTvl()
    const tvlInterval = setInterval(fetchTvl, 60000)
    return () => { clearInterval(tvlInterval) }
`
// Wir fügen es am Ende des bestehenden useEffect-Cleanups ein
// Suche nach dem return () => in useEffect und erweitern
// Einfacher: eigenes zweites useEffect am Ende der Komponente einfügen
// Statt useEffect erweitern, ein neues hinzufügen — vor dem return

const returnIdx = c.lastIndexOf('\n  return (')
c = c.slice(0, returnIdx) +
`
  React.useEffect(() => {
    const fetchTvl = async () => {
      try {
        const r = await fetch('https://api.llama.fi/v2/chains')
        const chains = await r.json()
        const sol = chains.find(ch => ch.name === 'Solana')
        if (sol?.tvl) setSolTvl(sol.tvl)
      } catch(e) { console.warn('TVL fetch error', e) }
    }
    fetchTvl()
    const id = setInterval(fetchTvl, 60000)
    return () => clearInterval(id)
  }, [])
` +
  c.slice(returnIdx)

// 3) TVL Kasten neben SOL-Preis einfügen
// Suche den SOL-Preis-Kasten und füge TVL-Kasten danach ein
const priceBlock = '{pool.solPrice && ('
const priceIdx = c.indexOf(priceBlock)
if (priceIdx === -1) { console.log('❌ SOL-Preis Block nicht gefunden'); process.exit(1) }

// Finde das Ende dieses Blocks (schließendes )}) oder ähnliches)
// Suche nach dem nächsten </div> nach dem Preisblock
const closingTag = c.indexOf('</div>', priceIdx)
const afterPriceBlock = c.indexOf('\n', closingTag) + 1

const tvlBox = `        {solTvl && (
          <div style={{
            background: 'rgba(0,255,255,0.05)',
            border: '1px solid rgba(0,255,255,0.3)',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'inline-block',
            marginLeft: '16px'
          }}>
            <div style={{color:'#ff2244', fontSize:'0.75rem', marginBottom:'4px'}}>SOLANA TVL</div>
            <strong style={{color:'#00ffff', fontSize:'1.6rem'}}>
              \${solTvl >= 1e9
                ? (solTvl / 1e9).toFixed(2) + 'B'
                : solTvl >= 1e6
                  ? (solTvl / 1e6).toFixed(1) + 'M'
                  : solTvl.toFixed(0)}
            </strong>
          </div>
        )}
`

c = c.slice(0, afterPriceBlock) + tvlBox + c.slice(afterPriceBlock)

fs.writeFileSync(file, c, 'utf8')
console.log('✅ TVL Kasten eingebaut')