const fs = require('fs')
let pd = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

pd = pd.replace(
  "import MeteoraDashboard from './MeteoraDashboard'",
  "import MeteoraDashboard from './MeteoraDashboard'\nimport ByrealDashboard from './ByrealDashboard'\nimport PriceAlert from './PriceAlert'"
)

fs.writeFileSync('src/components/PoolDashboard.jsx', pd)
console.log('✅ Imports eingefügt')

// Prüfen
const check = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
console.log('PriceAlert Import:', check.includes("import PriceAlert"))
console.log('ByrealDashboard Import:', check.includes("import ByrealDashboard"))