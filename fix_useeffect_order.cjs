const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

// Finde den useEffect Block nach dem return
const idx = c.indexOf('\n  React.useEffect(() => {')
if (idx === -1) { console.log('Block nicht gefunden'); process.exit(1) }

// Finde Ende des Blocks
const endIdx = c.indexOf('\n  }, [])\n', idx) + '\n  }, [])\n'.length
const block = c.substring(idx, endIdx)

// Entferne aus nach-return Position
c = c.substring(0, idx) + c.substring(endIdx)

// Füge vor "return (" ein
c = c.replace('\nreturn (', '\n' + block.trimStart().replace('React.useEffect', 'useEffect') + '\nreturn (')

fs.writeFileSync(path, c)
console.log('✅ useEffect vor return verschoben')