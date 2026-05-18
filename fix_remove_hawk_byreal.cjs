const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

// ByrealDashboard Import entfernen
c = c.replace(/import ByrealDashboard from '\.\/ByrealDashboard'\n/, '')
c = c.replace(/import ByrealDashboard from "\.\/ByrealDashboard"\n/, '')

// <ByrealDashboard /> Tag entfernen
c = c.replace(/\s*<ByrealDashboard\s*\/>/, '')

// HawkFi Import entfernen
c = c.replace(/import HawkFi\w* from '\.\/Hawk\w+'\n/, '')
c = c.replace(/import HawkFi\w* from "\.\/Hawk\w+"\n/, '')

// HawkFi JSX entfernen (falls vorhanden)
c = c.replace(/\s*<HawkFi\w*\s*\/>/, '')

fs.writeFileSync(file, c)
console.log('✅ Hawk + Byreal entfernt')