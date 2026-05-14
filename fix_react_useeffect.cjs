const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')
c = c.replaceAll('React.useEffect', 'useEffect')
fs.writeFileSync(file, c)
console.log('✅ React.useEffect -> useEffect')