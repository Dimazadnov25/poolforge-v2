const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  "  const wallet = useWallet()\n\n  useEffect(() => {\n    if (pool.solBalance",
  "  const wallet = useWallet()\n  const pool = usePool()\n\n  useEffect(() => {\n    if (pool.solBalance"
)

if (c.includes("const pool = usePool()")) {
  console.log('✅ pool = usePool() eingefügt')
} else {
  console.log('❌ Fehlgeschlagen')
}

fs.writeFileSync(file, c)