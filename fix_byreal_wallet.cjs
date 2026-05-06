const fs = require('fs')
let c = fs.readFileSync('src/components/ByrealDashboard.jsx', 'utf8')

// Hardcode Byreal wallet statt publicKey
c = c.replace(
  "const r = await fetch('/api/byreal-positions?wallet=' + publicKey.toBase58())",
  "const r = await fetch('/api/byreal-positions?wallet=ESLvaL9rNoDFYoWwRGqpLZmLk9KgR9r5S3L5EvauHyAy')"
)

// useEffect Abhängigkeit auch anpassen - kein publicKey mehr nötig
c = c.replace(
  "if (!publicKey) return",
  "// Byreal wallet hardcoded"
)
c = c.replace(
  "}, [publicKey])",
  "}, [])"
)

fs.writeFileSync('src/components/ByrealDashboard.jsx', c)
console.log('✅ Byreal wallet hardcoded')