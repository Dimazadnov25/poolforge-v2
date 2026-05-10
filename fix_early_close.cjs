const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

// Entferne die zwei Zeilen "    </div>\n  )\n" die nach dem swapSuggest-Block kommen
// aber mitten im JSX stehen
const BAD = "    </div>\n  )\n      {pool.error"
const GOOD = "      {pool.error"

if (c.indexOf(BAD) === -1) {
  console.log('NICHT GEFUNDEN, versuche CRLF...')
  const BAD2 = "    </div>\r\n  )\r\n      {pool.error"
  const GOOD2 = "      {pool.error"
  if (c.indexOf(BAD2) === -1) { console.log('Auch nicht gefunden'); process.exit(1) }
  c = c.replace(BAD2, GOOD2)
  console.log('✅ CRLF Variante gefixt')
} else {
  c = c.replace(BAD, GOOD)
  console.log('✅ Frühzeitiger Return-Close entfernt')
}

fs.writeFileSync(path, c)