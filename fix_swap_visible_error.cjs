const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// Status auch Fehlermeldung anzeigen - länger sichtbar
c = c.replace(
  `} catch(e) { console.error('SWAP FEHLER:', e.message, e); alert('Swap Fehler: ' + e.message); setStatus('❌ ' + e`,
  `} catch(e) { setStatus('❌ ' + e.message.substring(0,40)); setTimeout(()=>setStatus(''),8000); console.error(e); const x = e`
)

// Button breiter damit Status sichtbar
c = c.replace(
  `{loading ? status : 'MAX SOL → JitoSOL'}`,
  `{loading ? '...' : status && status.startsWith('❌') ? status : 'MAX SOL → JitoSOL'}`
)

fs.writeFileSync(file, c)
console.log('✅ Fehler direkt im Button sichtbar')