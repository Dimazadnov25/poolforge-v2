const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// Kaputte catch Zeile ersetzen
const bad = c.match(/\} catch\(e\) \{[^\n]+const x = e[^\n]+/)?.[0]
if (bad) {
  console.log('Gefunden:', bad)
  c = c.replace(bad, `} catch(e) { setStatus('ERR:' + e.message.substring(0,30)); setTimeout(()=>setStatus(''),8000) }`)
  fs.writeFileSync(file, c)
  console.log('✅ Syntax gefixt')
} else {
  console.log('❌ Pattern nicht gefunden')
}