const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Doppelten flex div entfernen
c = c.replace(
  `<div style={{display:'flex', gap:'0.4rem', alignItems:'center'}}>\n      <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>`,
  `<div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}>`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Doppelter div entfernt:', !c.includes("display:'flex', gap:'0.4rem', alignItems:'center'}}>\n      <div"))