const fs = require('fs')
const files = ['src/components/OpenPositionForm.jsx', 'src/components/PositionDetails.jsx']
for (const file of files) {
  if (!fs.existsSync(file)) { console.log('NICHT GEFUNDEN:', file); continue }
  let c = fs.readFileSync(file, 'utf8')
  const hits = (c.match(/solBalance\|\|0\)-0\.0[0-9]+/g) || [])
  console.log(file, '→ gefunden:', hits)
  c = c.replaceAll('solBalance||0)-0.01', 'solBalance||0)-0.03')
  c = c.replaceAll('solBalance||0)-0.02', 'solBalance||0)-0.03')
  fs.writeFileSync(file, c)
  console.log('✅', file)
}