const fs = require('fs')
const file = 'src/components/PriceAlert.jsx'
let c = fs.readFileSync(file, 'utf8')

// Block steht nach </div> - zurück rein verschieben
c = c.replace(
  "    </div>\r\n      {activeAlert && refPrice && change !== null && (",
  "      {activeAlert && refPrice && change !== null && ("
)

// </div> ans Ende
c = c.replace(
  "      )}\r\n  )\r\n}",
  "      )}\r\n    </div>\r\n  )\r\n}"
)

// altes </div> entfernen das jetzt doppelt ist
const idx = c.indexOf("    </div>\r\n  )\r\n}")
if (idx !== -1) {
  c = c.replace("    </div>\r\n      {activeAlert", "      {activeAlert")
}

fs.writeFileSync(file, c)
console.log('✅ Struktur korrigiert')