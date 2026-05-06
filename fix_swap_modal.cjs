const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Modal direkt vor dem letzten return-schliessenden Tag einfügen
c = c.replace(
  `          </div>
        )
      }`,
  `          </div>

          {swapSuggest && (
            <div style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}
              onClick={() => setSwapSuggest(null)}>
              <div style={{background:'#1e293b',borderRadius:'1rem',padding:'1.5rem',maxWidth:'340px',width:'90%',border:'1px solid rgba(99,102,241,0.4)',boxShadow:'0 0 40px rgba(99,102,241,0.2)'}}
                onClick={e => e.stopPropagation()}>
                <div style={{fontSize:'1.1rem',fontWeight:700,color:'#e2e8f0',marginBottom:'0.75rem'}}>💱 SOL → USDC</div>
                <div style={{color:'#94a3b8',fontSize:'0.9rem',marginBottom:'1.25rem'}}>
                  Du hast <strong style={{color:'#06b6d4'}}>{swapSuggest} SOL</strong> über dem Minimum (0.01 SOL).<br/>Jetzt zu USDC tauschen?
                </div>
                <div style={{display:'flex',gap:'0.75rem'}}>
                  <button onClick={() => setSwapSuggest(null)} style={{flex:1,padding:'0.6rem',borderRadius:'0.5rem',border:'1px solid rgba(255,255,255,0.1)',background:'transparent',color:'#64748b',cursor:'pointer'}}>Nein</button>
                  <button onClick={async () => {
                    setSwapSuggest(null)
                    await pool.swapSolToUsdc(swapSuggest)
                  }} style={{flex:1,padding:'0.6rem',borderRadius:'0.5rem',border:'none',background:'linear-gradient(135deg,#6366f1,#06b6d4)',color:'#fff',cursor:'pointer',fontWeight:600}}>Ja, swap!</button>
                </div>
              </div>
            </div>
          )}
        )
      }`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('Modal eingefügt:', c.includes('SOL → USDC'))