const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

const OLD = "\r\n      <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>\r\n      <ByrealDashboard />\r\n      </div>"
const NEW = "\r\n      <div style={{display:'flex',justifyContent:'center'}}>\r\n        <div style={{width:'100%',maxWidth:'400px'}}><ByrealDashboard /></div>\r\n      </div>"

if (c.indexOf(OLD) === -1) { console.log('NICHT GEFUNDEN'); process.exit(1) }
c = c.replace(OLD, NEW)
fs.writeFileSync(path, c)
console.log('✅ Byreal zentriert')