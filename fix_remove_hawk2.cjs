const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(/import HawkDashboard from '\.\/HawkDashboard'\n/, '')
c = c.replace(/\s*<a href="https:\/\/www\.hawkfi\.ag\/dashboard"[^>]*>HAWK<\/a>/, '')

fs.writeFileSync(file, c)
console.log('✅ Hawk entfernt')