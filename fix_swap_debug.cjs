const fs = require('fs')
const file = 'src/components/PoolDashboard.jsx'
let c = fs.readFileSync(file, 'utf8')

c = c.replace(
  `async function doSwap() {
    if (!publicKey) return
    setLoading(true); setStatus('...')`,
  `async function doSwap() {
    console.log('doSwap called, publicKey:', publicKey?.toBase58())
    if (!publicKey) { alert('Wallet nicht verbunden!'); return }
    setLoading(true); setStatus('...')`
)

fs.writeFileSync(file, c)
console.log('✅ Debug log eingebaut')