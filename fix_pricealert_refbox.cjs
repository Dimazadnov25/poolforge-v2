const fs = require('fs')
const file = 'src/components/PriceAlert.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `      {activeAlert && refPrice && change !== null && (
        <span style={{fontSize:'0.75rem', color: Math.abs(change) > activeAlert * 0.7 ? '#fb923c' : '#64748b'}}>
          Ref: \${refPrice.toFixed(2)} | {change >= 0 ? '+' : ''}{change.toFixed(2)}%
          {saving ? ' ⟳' : ' ✅ aktiv'}
        </span>
      )}
    </div>`,
  `    </div>
      {activeAlert && refPrice && change !== null && (
        <div style={{marginTop:'0.4rem',padding:'0.5rem 0.75rem',borderRadius:'6px',border:'1px solid rgba(245,158,11,0.3)',background:'rgba(245,158,11,0.05)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{fontSize:'0.75rem',color:'#94a3b8',fontFamily:'Share Tech Mono,monospace'}}>REF: <strong style={{color:'#f59e0b'}}>\${refPrice.toFixed(2)}</strong></span>
          <span style={{fontSize:'1rem',fontWeight:700,fontFamily:'Share Tech Mono,monospace',color:Math.abs(change)>activeAlert*0.7?'#fb923c':change>=0?'#00ff88':'#ff2244'}}>{change>=0?'+':''}{change.toFixed(2)}%</span>
          <span style={{fontSize:'0.7rem',color:'#f59e0b',fontFamily:'Share Tech Mono,monospace'}}>{saving?'⟳':'✅'} {activeAlert}% ALARM</span>
        </div>
      )}`
)

fs.writeFileSync(file, c)
console.log('✅ Ref Info eigener Kasten')