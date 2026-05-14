const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "              <div style={{fontSize:'0.65rem',color:'#9945FF',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>JitoSOL</div>",
  "              <div style={{fontSize:'0.65rem',color:'#9945FF',textTransform:'uppercase',fontFamily:'Share Tech Mono,monospace'}}>JitoSOL</div>\n              <button onClick={()=>{ localStorage.removeItem('jitoSolBaseline'); window.location.reload() }} style={{fontSize:'0.55rem',padding:'0.1rem 0.3rem',borderRadius:'3px',border:'1px solid rgba(153,69,255,0.4)',background:'transparent',color:'#9945FF',cursor:'pointer',fontFamily:'Share Tech Mono,monospace'}}>RESET</button>"
)

fs.writeFileSync(file, c)
console.log('✅ Reset Button eingefügt')