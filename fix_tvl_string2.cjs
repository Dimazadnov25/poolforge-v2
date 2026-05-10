const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

const OLD = "            <div style={{fontSize:'1.3rem',color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>{tvl>=1e6?' !== null && (\r"
const NEW = "            <div style={{fontSize:'1.3rem',color:'#00ffff',fontFamily:'Rajdhani,sans-serif'}}>{tvl>=1e6?'$'+(tvl/1e6).toFixed(1)+'M':'$'+tvl.toFixed(0)}</div>\r\n          </div>\r\n        )}\r\n      </div>\r\n      {solTrend !== null && (\r"

if (c.indexOf(OLD) === -1) { console.log('NICHT GEFUNDEN'); process.exit(1) }
c = c.replace(OLD, NEW)
fs.writeFileSync(path, c)
console.log('✅ TVL String2 gefixt')