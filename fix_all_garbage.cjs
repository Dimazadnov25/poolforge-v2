const fs = require('fs')
const path = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(path, 'utf8')

// 1. Entferne zweiten frühzeitigen Return-Close vor React.useEffect
c = c.replace("    </div>\n  )\n\n  React.useEffect", "  React.useEffect")

// 2. Verschiebe React.useEffect vor return (
const ueStart = c.indexOf('\n  React.useEffect(() => {')
if (ueStart !== -1) {
  const ueEnd = c.indexOf('\n  }, [])\n', ueStart) + '\n  }, [])\n'.length
  const block = c.substring(ueStart + 1, ueEnd)
  c = c.substring(0, ueStart) + c.substring(ueEnd)
  c = c.replace('return (', block.replace('React.useEffect', 'useEffect') + 'return (')
  console.log('✅ useEffect verschoben')
}

// 3. Entferne Garbage "}+tvl.toFixed(0)}" und danach </div>
c = c.replace('\n}+tvl.toFixed(0)}\n            </div>', '')
console.log('✅ Garbage entfernt')

fs.writeFileSync(path, c)