const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

const OLD = "\r\n      <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>\r\n      <ByrealDashboard />\r\n      </div>"

const NEW = "\r\n      <div style={{display:'flex',justifyContent:'center',gap:'0.4rem',alignItems:'stretch',width:'100%'}}>\r\n        <div style={{flex:1}}><ByrealDashboard /></div>\r\n        {tvl !== null && (\r\n          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'1rem 0.5rem',borderRadius:'6px',fontWeight:700,border:'1px solid rgba(0,255,255,0.3)',background:'rgba(0,255,255,0.05)'}}>\r\n            <div style={{fontSize:'0.65rem',color:'#ff2244',fontFamily:'Share Tech Mono,monospace',textTransform:'uppercase'}}>TVL</div>\r\n            <div style={{fontSize:'1.3rem',color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>{tvl>=1e6?'$'+(tvl/1e6).toFixed(1)+'M':'$'+tvl.toFixed(0)}</div>\r\n          </div>\r\n        )}\r\n      </div>"

if (c.indexOf(OLD) === -1) { console.log('NICHT GEFUNDEN'); process.exit(1) }
c = c.replace(OLD, NEW)
fs.writeFileSync(path, c)
console.log('✅ Byreal + TVL zentriert')