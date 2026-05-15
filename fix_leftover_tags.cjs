const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace('\n\n\n            </div>\n          </div>\n        )}', '')

fs.writeFileSync(file, c)
console.log('✅ Leftover Tags entfernt')