const fs = require('fs')
const file = 'src/components/PriceAlert.jsx'
let c = fs.readFileSync(file, 'utf8')

// marginTop von div entfernen damit es direkt unter den Buttons sitzt
c = c.replace(
  "style={{marginTop:'0.4rem',padding:'0.75rem 1rem'",
  "style={{padding:'0.75rem 1rem'"
)

// Flex-Container der Buttons: flex-wrap hinzufügen damit REF-Box darunter rutscht
c = c.replace(
  "style={{marginTop:'0.75rem', display:'flex', alignItems:'center', gap:'0.4rem'}}",
  "style={{marginTop:'0.75rem', display:'flex', flexDirection:'column', gap:'0.4rem'}}"
)

// Buttons in eigene Zeile
c = c.replace(
  "      {[0.5, 1, 2, 3].map(pct => {",
  "      <div style={{display:'flex',gap:'0.4rem'}}>\r\n      {[0.5, 1, 2, 3].map(pct => {"
)
c = c.replace(
  "      })}\r\n      {activeAlert",
  "      })}\r\n      </div>\r\n      {activeAlert"
)

fs.writeFileSync(file, c)
console.log('✅ REF Box unter Buttons')