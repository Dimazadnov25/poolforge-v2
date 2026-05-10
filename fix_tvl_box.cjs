const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// TVL State hinzufuegen
c = c.replace(
  'const [solVolume, setSolVolume] = useState(null)',
  'const [solVolume, setSolVolume] = useState(null)\n  const [tvl, setTvl] = useState(null)'
)

// TVL fetch
const tvlEffect = `
  useEffect(() => {
    const loadTvl = async () => {
      try {
        const r = await fetch('https://api.orca.so/v2/solana/whirlpool/HJPjoWUrhoZzkNfRpHuieeFk9WcZWjwy6PBjZ81ngndJ')
        const d = await r.json()
        if (d.tvl) setTvl(parseFloat(d.tvl))
      } catch(e) {}
    }
    loadTvl()
    const iv = setInterval(loadTvl, 60000)
    return () => clearInterval(iv)
  }, [])
`

c = c.replace(
  'return (\n',
  tvlEffect + 'return (\n'
)

// TVL Kasten neben Byreal einfuegen
c = c.replace(
  '      <ByrealDashboard />',
  `      <div style={{display:'flex',gap:'0.4rem',alignItems:'stretch'}}>
        <div style={{flex:1}}><ByrealDashboard /></div>
        {tvl !== null && (
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
            padding:'1rem 0.5rem',borderRadius:'6px',fontWeight:700,
            border:'1px solid rgba(0,255,255,0.3)',background:'rgba(0,255,255,0.05)'}}>
            <div style={{fontSize:'0.65rem',color:'#ff2244',fontFamily:'Share Tech Mono,monospace',textTransform:'uppercase'}}>TVL</div>
            <div style={{fontSize:'1.3rem',color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>
              {tvl>=1e6?'$'+(tvl/1e6).toFixed(1)+'M':'$'+tvl.toFixed(0)}
            </div>
          </div>
        )}
      </div>`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ TVL Kasten neben Byreal')