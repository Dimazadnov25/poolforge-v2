const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const hawkBox = `
      <a href="https://www.hawkfi.ag/meteora/5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6?position=DEWFsMTF4uo5hNvyzchNziJxDfLsGG4fQum7jC4gSG1J" target="_blank" rel="noreferrer" style={{display:'block',textAlign:'center',padding:'0.6rem',borderRadius:'0.6rem',border:'1px solid rgba(0,255,255,0.3)',background:'#111',color:'#00ffff',fontFamily:'Orbitron,monospace',fontWeight:700,fontSize:'1rem',textDecoration:'none',letterSpacing:'0.1em'}}>HAWK</a>`

c = c.replace(
  '<PriceAlert solPrice={pool.solPrice} />',
  '<PriceAlert solPrice={pool.solPrice} />' + hawkBox
)

fs.writeFileSync(file, c)
console.log('✅ HAWK Link eingefügt')