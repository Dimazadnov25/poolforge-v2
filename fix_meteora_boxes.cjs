const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const meteoraSection = `
      {/* Meteora DLMM Kästen */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'0.5rem',marginTop:'0.5rem'}}>
        {[
          { bins: '4-Bin',  url: 'https://app.meteora.ag/dlmm/5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6',  addr: '5rCf1D...HAS6' },
          { bins: '10-Bin', url: 'https://app.meteora.ag/dlmm/BGm1tav58oGcsQJehL9WXBFXF7D27vZsKefj4xJKD5Y',   addr: 'BGm1ta...D5Y'  },
          { bins: '20-Bin', url: 'https://app.meteora.ag/dlmm/BVRbyLjjfSBcoyiYFuxbgKYnWuiFaF9CSXEa5vdSZ9Hh', addr: 'BVRbyL...Z9Hh' },
        ].map(p => (
          <a key={p.bins} href={p.url} target="_blank" rel="noopener noreferrer" style={{textDecoration:'none'}}>
            <div style={{
              display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
              padding:'0.75rem 0.4rem',borderRadius:'6px',cursor:'pointer',
              border:'1px solid rgba(0,255,255,0.3)',background:'rgba(0,255,255,0.04)',
              transition:'background 0.2s'
            }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(0,255,255,0.12)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(0,255,255,0.04)'}
            >
              <div style={{fontSize:'0.55rem',color:'#ff2244',fontFamily:'Share Tech Mono,monospace',textTransform:'uppercase',letterSpacing:'0.05em'}}>METEORA DLMM</div>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'#00ffff',fontFamily:'Rajdhani,sans-serif',lineHeight:1.1}}>{p.bins}</div>
              <div style={{fontSize:'0.5rem',color:'rgba(0,255,255,0.5)',fontFamily:'Share Tech Mono,monospace',marginTop:'0.2rem'}}>{p.addr}</div>
            </div>
          </a>
        ))}
      </div>`

// Einfügen direkt nach <ByrealDashboard />
const target = '<ByrealDashboard />'
if (!c.includes(target)) { console.log('❌ ByrealDashboard nicht gefunden'); process.exit(1) }
c = c.replace(target, target + meteoraSection)

fs.writeFileSync(file, c)
console.log('✅ 3 Meteora-Kästen eingebaut')