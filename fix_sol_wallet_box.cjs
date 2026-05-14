const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

const oldStr = '        {pool.usdcBalance !== undefined && (\r\n          <div style={{background:\'#111\',borderRadius:\'0.6rem\',padding:\'0.6rem 0.5rem\',border:\'1px solid rgba(0,255,255,0.3)\'}}>\r\n            <div style={{fontSize:\'0.65rem\',color:\'#ff2244\',textTransform:\'uppercase\',fontFamily:\'Share Tech Mono,monospace\'}}>USDC Wallet</div>\r\n            <div style={{fontSize:\'2.2rem\',fontWeight:700,color:\'#00ffff\',fontFamily:\'Rajdhani,sans-serif\'}}>${parseFloat(pool.usdcBalance||0).toFixed(2)}</div>\r\n          </div>\r\n        )}\r\n      </div>'

if (!c.includes(oldStr)) {
  console.log('❌ immer noch nicht gefunden')
  process.exit(1)
}

const addon = '\r\n        {pool.solBalance !== undefined && pool.solPrice && (\r\n          <div style={{background:\'#111\',borderRadius:\'0.6rem\',padding:\'0.6rem 0.5rem\',border:\'1px solid rgba(0,255,255,0.3)\'}}>\r\n            <div style={{fontSize:\'0.65rem\',color:\'#ff2244\',textTransform:\'uppercase\',fontFamily:\'Share Tech Mono,monospace\'}}>SOL Wallet</div>\r\n            <div style={{fontSize:\'2.2rem\',fontWeight:700,color:\'#00ffff\',fontFamily:\'Rajdhani,sans-serif\'}}>${(parseFloat(pool.solBalance||0)*pool.solPrice).toFixed(2)}</div>\r\n            <div style={{fontSize:\'0.7rem\',color:\'#888\',fontFamily:\'Share Tech Mono,monospace\'}}>{parseFloat(pool.solBalance||0).toFixed(4)} SOL</div>\r\n          </div>\r\n        )}'

c = c.replace(oldStr, oldStr + addon)
fs.writeFileSync(file, c)
console.log('✅ SOL Wallet Kasten eingefügt')