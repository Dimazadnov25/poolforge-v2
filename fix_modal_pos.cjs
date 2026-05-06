const fs = require('fs')
let c = fs.readFileSync('src/components/PoolDashboard.jsx', 'utf8')

// Modal rausnehmen
const modalStart = c.indexOf('\n      {swapSuggest && (')
const modalEnd = c.indexOf('      )}', modalStart) + 8
const modal = c.slice(modalStart, modalEnd)
c = c.slice(0, modalStart) + c.slice(modalEnd)

// Vor </div> auf Zeile 129 (nach dem wallet.connected Block) einfügen
c = c.replace(
  `          )}
        </div>
        )
      }`,
  `          )}
${modal}
        </div>
        )
      }`
)

fs.writeFileSync('src/components/PoolDashboard.jsx', c)
console.log('✅ Modal richtig platziert')