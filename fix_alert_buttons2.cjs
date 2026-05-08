const fs = require('fs')
let c = fs.readFileSync('src/components/PriceAlert.jsx', 'utf8')

// Array: 0.1 raus
c = c.replace('[0.1, 0.5, 1, 2, 3]', '[0.5, 1, 2, 3]')

// Button Style: viereckig, groesser, nebeneinander
c = c.replace(
  /padding:'0\.3rem 0\.75rem',\s*borderRadius:'999px',/,
  `padding:'0.5rem 1rem', borderRadius:'6px',`
)

fs.writeFileSync('src/components/PriceAlert.jsx', c)
console.log('✅ 0.1% entfernt, Buttons viereckig+groesser:', c.includes('[0.5, 1, 2, 3]'))