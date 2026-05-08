const fs = require('fs')
const files = ['src/components/OpenPositionForm.jsx', 'src/components/PositionDetails.jsx']
for (const f of files) {
  if (!fs.existsSync(f)) continue
  let c = fs.readFileSync(f, 'utf8')
  const count = (c.match(/0\.01/g)||[]).length
  c = c.replaceAll('0.01', '0.03')
  fs.writeFileSync(f, c)
  console.log(f, '→', count, 'x ersetzt, 0.03 drin:', c.includes('0.03'))
}