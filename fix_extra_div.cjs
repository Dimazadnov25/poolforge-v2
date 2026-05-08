const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

c = c.replace(
  `      )}\n      </div>\n\n      {pool.error`,
  `      )}\n\n      {pool.error`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Extra div entfernt')