const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `} catch(e) { setStatus('❌ ' + e`,
  `} catch(e) { console.error('SWAP FEHLER:', e.message, e); alert('Swap Fehler: ' + e.message); setStatus('❌ ' + e`
)

fs.writeFileSync(file, c)
console.log('✅ Error logging eingebaut')