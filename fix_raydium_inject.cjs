const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Import hinzufuegen
c = c.replace(
  "import PriceAlert from './PriceAlert'",
  "import PriceAlert from './PriceAlert'\nimport RaydiumDashboard from './RaydiumDashboard'"
)

// Tag vor dem letzten </div></div> einfuegen
c = c.replace(
  "      </div>\n    </div>\n  )\n\n  React.useEffect",
  "      <RaydiumDashboard />\n      </div>\n    </div>\n  )\n\n  React.useEffect"
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('Import:', c.includes("import RaydiumDashboard"))
console.log('Tag:', c.includes('<RaydiumDashboard'))