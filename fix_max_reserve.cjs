const fs = require('fs')

const files = [
  'src/components/OpenPositionForm.jsx',
  'src/components/PositionDetails.jsx'
]

for (const file of files) {
  if (!fs.existsSync(file)) { console.log('NICHT GEFUNDEN:', file); continue }
  let c = fs.readFileSync(file, 'utf8')
  const before = (c.match(/solBalance\|\|0\)-0\.01/g) || []).length
  c = c.replaceAll('solBalance||0)-0.01', 'solBalance||0)-0.03')
  const after = (c.match(/solBalance\|\|0\)-0\.03/g) || []).length
  fs.writeFileSync(file, c, 'utf8')
  console.log(file, '→ ersetzt:', before, 'Treffer, nach Fix:', after)
}