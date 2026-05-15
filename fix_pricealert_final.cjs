const fs = require('fs')
const file = 'src/components/PriceAlert.jsx'
let c = fs.readFileSync(file, 'utf8')

const oldStr = `      {activeAlert && refPrice && change !== null && (
        <span style={{fontSize:'0.75rem', color: Math.abs(change) > activeAlert * 0.7 ? '#fb923c' : '#64748b'}}>
          Ref: \${refPrice.toFixed(2)} | {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          {saving ? ' \u27f3' : ' \u2705 aktiv'}
        </span>
      )}
    </div>`

const newStr = `    </div>
      {activeAlert && refPrice && change !== null && (
        <div style={{marginTop:'0.4rem',padding:'0.75rem 1rem',borderRadius:'6px',border:'1px solid rgba(245,158,11,0.4)',background:'rgba(245,158,11,0.07)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'0.5rem'}}>
            <span style={{fontSize:'0.9rem',color:'#94a3b8',fontFamily:'Share Tech Mono,monospace'}}>REF <strong style={{color:'#f59e0b',fontSize:'1.1rem'}}>\${refPrice.toFixed(2)}</strong></span>
            <span style={{fontSize:'2rem',fontWeight:700,fontFamily:'Rajdhani,sans-serif',color:Math.abs(change)>activeAlert*0.7?'#fb923c':change>=0?'#00ff88':'#ff2244'}}>{change>=0?'+':''}{change.toFixed(2)}%</span>
            <span style={{fontSize:'0.85rem',color:'#f59e0b',fontFamily:'Share Tech Mono,monospace'}}>{saving?'⟳':'✅'} {activeAlert}%</span>
          </div>
        </div>
      )}`

if (!c.includes(oldStr)) {
  console.log('❌ nicht gefunden, Kontext:')
  const idx = c.indexOf('refPrice.toFixed')
  console.log(JSON.stringify(c.substring(idx-100, idx+200)))
  process.exit(1)
}

c = c.replace(oldStr, newStr)
fs.writeFileSync(file, c)
console.log('✅ Ref Kasten neu')