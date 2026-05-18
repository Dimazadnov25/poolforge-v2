const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(/import SolChart from '\.\/SolChart'\n/, '')
c = c.replace(/\s*<SolChart[^>]*\/>/, '')
c = c.replace(/\s*<SolChart[^>]*><\/SolChart>/, '')

fs.writeFileSync(file, c)
console.log('✅ SolChart entfernt')