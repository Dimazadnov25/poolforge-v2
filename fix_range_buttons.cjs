const fs = require('fs')
let c = fs.readFileSync('src/components/OpenPositionForm.jsx', 'utf8')

const oldBlock = `<div style={{display:'flex', gap:'0.5rem', flexWrap:'wrap'}}>\r\n          {[0.5,1,2,3,5].map(r => (\r\n            <button type=\"button\" key={r} onClick={() => setRange(r)}\r\n              className={range === r ? 'btn btn-blue' : 'btn btn-secondary'}\r\n              style={{padding:'0.25rem 0.5rem', fontSize:'0.8rem'}}>\r\n              {r}%\r\n            </button>\r\n          ))}\r\n        </div>`

const newBlock = `<div style={{display:'flex', gap:'0.4rem'}}>\r\n          {[1,2,3,5].map(r => (\r\n            <button type=\"button\" key={r} onClick={() => setRange(r)} style={{\r\n              padding:'0.45rem 0.9rem', fontSize:'0.9rem', fontWeight:700,\r\n              borderRadius:'6px', border: range===r ? '2px solid #3b82f6' : '2px solid rgba(59,130,246,0.35)',\r\n              background: range===r ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.07)',\r\n              color: range===r ? '#93c5fd' : '#6b99d6',\r\n              cursor:'pointer', transition:'all 0.15s'\r\n            }}>{r}%</button>\r\n          ))}\r\n        </div>`

if (c.includes(oldBlock)) {
  c = c.replace(oldBlock, newBlock)
  console.log('✅ Range Buttons aktualisiert')
} else {
  console.log('❌ Block nicht gefunden — JSON check:')
  const idx = c.lastIndexOf('setRange(')
  console.log(JSON.stringify(c.substring(idx-400, idx+50)))
}

fs.writeFileSync('src/components/OpenPositionForm.jsx', c)