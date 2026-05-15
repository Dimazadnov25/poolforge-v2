const fs = require('fs')
const file = 'src/components/PriceAlert.jsx'
let c = fs.readFileSync(file, 'utf8')

// Alten span komplett ersetzen - suche nach eindeutigem Teil
const spanStart = c.indexOf("      {activeAlert && refPrice && change !== null && (\r\n        <span")
const spanEnd = c.indexOf("    </div>", spanStart) + "    </div>".length

if (spanStart === -1) { console.log('❌ nicht gefunden'); process.exit(1) }

const newBlock = "    </div>\r\n      {activeAlert && refPrice && change !== null && (\r\n        <div style={{marginTop:'0.4rem',padding:'0.75rem 1rem',borderRadius:'6px',border:'1px solid rgba(245,158,11,0.4)',background:'rgba(245,158,11,0.07)'}}>\r\n          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>\r\n            <span style={{fontSize:'1rem',color:'#94a3b8',fontFamily:'Share Tech Mono,monospace'}}>REF <strong style={{color:'#f59e0b',fontSize:'1.2rem'}}>${refPrice.toFixed(2)}</strong></span>\r\n            <span style={{fontSize:'2.2rem',fontWeight:700,fontFamily:'Rajdhani,sans-serif',color:Math.abs(change)>activeAlert*0.7?'#fb923c':change>=0?'#00ff88':'#ff2244'}}>{change>=0?'+':''}{change.toFixed(2)}%</span>\r\n            <span style={{fontSize:'0.9rem',color:'#f59e0b',fontFamily:'Share Tech Mono,monospace'}}>{activeAlert}% ALARM</span>\r\n          </div>\r\n        </div>\r\n      )}"

c = c.substring(0, spanStart) + newBlock + c.substring(spanEnd)
fs.writeFileSync(file, c)
console.log('✅ Ref Kasten direkt ersetzt')