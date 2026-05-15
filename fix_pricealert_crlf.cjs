const fs = require('fs')
const file = 'src/components/PriceAlert.jsx'
let c = fs.readFileSync(file, 'utf8')

const oldStr = "      {activeAlert && refPrice && change !== null && (\r\n        <span style={{fontSize:'0.75rem', color: Math.abs(change) > activeAlert * 0.7 ? '#fb923c' : '#64748b'}}>\r\n          Ref: ${refPrice.toFixed(2)} | {change >= 0 ? '+' : ''}{change.toFixed(2)}%\r\n          {saving ? ' \u29bf' : ' \u2705 aktiv'}\r\n        </span>\r\n      )}\r\n    </div>"

const newStr = "    </div>\r\n      {activeAlert && refPrice && change !== null && (\r\n        <div style={{marginTop:'0.4rem',padding:'0.75rem 1rem',borderRadius:'6px',border:'1px solid rgba(245,158,11,0.4)',background:'rgba(245,158,11,0.07)'}}>\r\n          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'0.5rem'}}>\r\n            <span style={{fontSize:'0.9rem',color:'#94a3b8',fontFamily:'Share Tech Mono,monospace'}}>REF <strong style={{color:'#f59e0b',fontSize:'1.1rem'}}>${refPrice.toFixed(2)}</strong></span>\r\n            <span style={{fontSize:'2rem',fontWeight:700,fontFamily:'Rajdhani,sans-serif',color:Math.abs(change)>activeAlert*0.7?'#fb923c':change>=0?'#00ff88':'#ff2244'}}>{change>=0?'+':''}{change.toFixed(2)}%</span>\r\n            <span style={{fontSize:'0.85rem',color:'#f59e0b',fontFamily:'Share Tech Mono,monospace'}}>{saving?'⟳':'✅'} {activeAlert}%</span>\r\n          </div>\r\n        </div>\r\n      )}"

if (!c.includes(oldStr)) {
  console.log('❌ nicht gefunden')
  const idx = c.indexOf('refPrice.toFixed')
  console.log(JSON.stringify(c.substring(idx-50, idx+150)))
  process.exit(1)
}

c = c.replace(oldStr, newStr)
fs.writeFileSync(file, c)
console.log('✅ Ref Kasten gross')