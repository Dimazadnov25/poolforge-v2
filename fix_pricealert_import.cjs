const fs = require('fs')
let pd = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')
console.log('Hat PriceAlert Import:', pd.includes("import PriceAlert"))
console.log('Hat PriceAlert Usage:', pd.includes("<PriceAlert"))

if (!pd.includes("import PriceAlert")) {
  // Import ganz oben nach letztem import einfügen
  pd = pd.replace(
    /^(import .+ from '.+'\n)(?!import)/m,
    (m) => m + "import PriceAlert from './PriceAlert'\n"
  )
  fs.writeFileSync('src/components/PoolDashboard.jsx', pd)
  console.log('✅ Import eingefügt')
} else {
  console.log('ℹ️ Import bereits vorhanden')
}