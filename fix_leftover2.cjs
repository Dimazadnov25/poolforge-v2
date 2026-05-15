const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace('        \r\n            </div>\r\n          </div>\r\n        )}\r\n', '')

fs.writeFileSync(file, c)
console.log('✅ Leftover entfernt')